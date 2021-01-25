import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Injectable, Input, Output } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';

/**
 * File node data with nested structure.
 * Each node has a name, and a type or a list of children.
 */
export class FileNode {
  id: string;
  children: FileNode[];
  name: string;
  type: any;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
  constructor(
    public expandable: boolean,
    public name: string,
    public level: number,
    public type: any,
    public id: string
  ) { }
}



/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has name and type.
 * For a directory, it has name and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
@Injectable()
export class FileDatabase {
  dataChange = new BehaviorSubject<FileNode[]>([]);
  get data(): FileNode[] { return this.dataChange.value; }

  constructor() {

  }

  initialize(dataObj) {

    // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
    //     file node as children.
    const data = this.buildFileTree(dataObj, 0);

    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `FileNode`.
   */
  buildFileTree(arrayTreeNodes: any[], level: number, parentId: string = '0'): FileNode[] {
    var map = {};
    arrayTreeNodes.forEach((treeNode) => {
      var obj = treeNode;
      obj.children = [];
      obj.type= (treeNode.isFolder)? "folder" : "node";

      if(!map[obj.id]) {map[obj.id] = obj;}
      else{
        let previousChildren= map[obj.id].children
        map[obj.id] = obj;
        map[obj.id].children=previousChildren
      }
      var parent = obj.parent || '-';
      if (!map[parent]) {
        map[parent] = {
          children: []
        };
      }
      map[parent].children.push(obj);
    });

    return map['-'].children;
  }
}

/**
 * @title Tree with flat nodes
 */
@Component({
  selector: 'app-data-tree',
  templateUrl: 'data-tree.component.html',
  styleUrls: ['data-tree.component.scss'],
  providers: [FileDatabase]
})
export class DataTreeComponent {
  @Output() createNode: EventEmitter<any>;
  @Output() createFolder: EventEmitter<any>;
  @Output() emitNode: EventEmitter<any>;
  @Output() emitAllNodes: EventEmitter<any>;
  @Input() eventNodeUpdatedSubscription: Observable <any> ;
  @Input() eventCreateNodeSubscription: Observable <any> ;
  @Input() eventGetAllRowsSubscription: Observable <any> ;
  private _eventNodeUpdatedSubscription: any;
  private _eventCreateNodeSubscription: any;
  private _eventGetAllRowsSubscription: any;
  treeControl: FlatTreeControl<FileFlatNode>;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;
  // expansion model tracks expansion state
  expansionModel = new SelectionModel<string>(true);
  dragging = false;
  expandTimeout: any;
  expandDelay = 1000;
  validateDrop = false;
  treeData: any;

  @Input() getAll: () => Observable<any>;

  constructor(public database: FileDatabase) {
    this.emitNode = new EventEmitter();
    this.createNode = new EventEmitter();
    this.createFolder = new EventEmitter();
    this.emitAllNodes = new EventEmitter();
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<FileFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
 
  }

  ngOnInit(){

    if(this.eventNodeUpdatedSubscription)
    {
      this.eventNodeUpdatedSubscription.subscribe(
        (node) => {
          this.updateNode(node);
        }
      )
    }
    if(this.eventCreateNodeSubscription)
    {
      this.eventCreateNodeSubscription.subscribe(
        (node) => {
          if(node.isFolder) this.createNewFolder(node);
          else this.createNewNode(node);
        }
      )
    }

    if (this.eventGetAllRowsSubscription) {
      this._eventGetAllRowsSubscription = this.eventGetAllRowsSubscription.subscribe(() => {
        this.emitAllRows();
      });
    }
    
    this.getAll()
    .subscribe((items) => {
      this.treeData = items;
      this.database.initialize(this.treeData);
      this.database.dataChange.subscribe(data => this.rebuildTreeForData(data));
    });
  }


  transformer = (node: FileNode, level: number) => {
    if(node.children.length!=0){
      return new FileFlatNode(!!node.children, node.name, level, node.type, node.id);
    }else{
      return new FileFlatNode(!!undefined, node.name, level, node.type, node.id);
    }
  
  }
  private _getLevel = (node: FileFlatNode) => node.level;
  private _isExpandable = (node: FileFlatNode) => node.expandable;
  private _getChildren = (node: FileNode): Observable<FileNode[]> => observableOf(node.children);
  hasChild = (_: number, _nodeData: FileFlatNode) => _nodeData.expandable;


  /**
   * This constructs an array of nodes that matches the DOM
   */
  visibleNodes(): FileNode[] {
    const result = [];

    function addExpandedChildren(node: FileNode, expanded: string[]) {
      result.push(node);
      if (expanded.indexOf(node.id) != -1) {
        node.children.map((child) => addExpandedChildren(child, expanded));
      }
    }
    this.dataSource.data.forEach((node) => {
      addExpandedChildren(node, this.expansionModel.selected);
    });
    return result;
  }


   findNodeSiblings(arr: Array<any>, id: string): Array<any> {
    let result, subResult;
    arr.forEach((item, i) => {
      if (item.id === id) {
        result = arr;
      } else if (item.children) {
        subResult = this.findNodeSiblings(item.children, id);
        if (subResult) result = subResult;
      }
    });
    return result;

  }


  /**
   * Handle the drop - here we rearrange the data based on the drop event,
   * then rebuild the tree.
   * */
  drop(event: CdkDragDrop<string[]>) {
    // console.log('origin/destination', event.previousIndex, event.currentIndex);

    // ignore drops outside of the tree
    if (!event.isPointerOverContainer) return;

    // construct a list of visible nodes, this will match the DOM.
    // the cdkDragDrop event.currentIndex jives with visible nodes.
    // it calls rememberExpandedTreeNodes to persist expand state
    const visibleNodes = this.visibleNodes();

    // deep clone the data source so we can mutate it
    const changedData = JSON.parse(JSON.stringify(this.dataSource.data));

    // recursive find function to find siblings of node


    // determine where to insert the node
    const nodeAtDest = visibleNodes[event.currentIndex];
    const newSiblings = this.findNodeSiblings(changedData, nodeAtDest.id);
    if (!newSiblings) return;
    const insertIndex = newSiblings.findIndex(s => s.id === nodeAtDest.id);

    // remove the node from its old place
    const node = event.item.data;
    const siblings = this.findNodeSiblings(changedData, node.id);
    const siblingIndex = siblings.findIndex(n => n.id === node.id);
    const nodeToInsert: FileNode = siblings.splice(siblingIndex, 1)[0];
    if (nodeAtDest.id === nodeToInsert.id) return;

    // ensure validity of drop - must be same level
    const nodeAtDestFlatNode = this.treeControl.dataNodes.find((n) => nodeAtDest.id === n.id);
    if (this.validateDrop && nodeAtDestFlatNode.level !== node.level) {
      alert('Items can only be moved within the same level.');
      return;
    }

    // insert node 
    newSiblings.splice(insertIndex, 0, nodeToInsert);

    // rebuild tree with mutated data
    this.rebuildTreeForData(changedData);
  }

  /**
   * Experimental - opening tree nodes as you drag over them
   */
  dragStart() {
    this.dragging = true;
  }
  dragEnd() {
    this.dragging = false;
  }
  dragHover(node: FileFlatNode) {
    if (this.dragging) {
      clearTimeout(this.expandTimeout);
      this.expandTimeout = setTimeout(() => {
        this.treeControl.expand(node);
      }, this.expandDelay);
    }
  }
  dragHoverEnd() {
    if (this.dragging) {
      clearTimeout(this.expandTimeout);
    }
  }

  /**
   * The following methods are for persisting the tree expand state
   * after being rebuilt
   */

  rebuildTreeForData(data: any) {
    this.dataSource.data = data;
    this.expansionModel.selected.forEach((id) => {
      const node = this.treeControl.dataNodes.find((n) => n.id === id);
      this.treeControl.expand(node);
    });
  }

  /**
   * Not used but you might need this to programmatically expand nodes
   * to reveal a particular node
   */
  private expandNodesById(flatNodes: FileFlatNode[], ids: string[]) {
    if (!flatNodes || flatNodes.length === 0) return;
    const idSet = new Set(ids);
    return flatNodes.forEach((node) => {
      if (idSet.has(node.id)) {
        this.treeControl.expand(node);
        let parent = this.getParentNode(node);
        while (parent) {
          this.treeControl.expand(parent);
          parent = this.getParentNode(parent);
        }
      }
    });
  }

  private getParentNode(node: FileFlatNode): FileFlatNode | null {
    const currentLevel = node.level;
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  updateNode(nodeUpdated)
  {
    const dataToChange = JSON.parse(JSON.stringify(this.dataSource.data))
    const siblings = this.findNodeSiblings(dataToChange, nodeUpdated.id);
    let index= siblings.findIndex(node => node.id === nodeUpdated.id)
    siblings[index]=nodeUpdated;
    console.log(index);
    this.rebuildTreeForData(dataToChange);

  }

  createNewFolder(newFolder)
  {
    newFolder.type="folder";
    const dataToChange = JSON.parse(JSON.stringify(this.dataSource.data))
    if(newFolder.parent === null) {dataToChange.push(newFolder)}
    else{
      const siblings = this.findNodeSiblings(dataToChange, newFolder.parent);
      let index= siblings.findIndex(node => node.id === newFolder.parent);
      siblings[index].children.push(newFolder)
    }
    this.rebuildTreeForData(dataToChange);

  }

  createNewNode(newNode)
  {
    newNode.type="node";
    const dataToChange = JSON.parse(JSON.stringify(this.dataSource.data))
    const siblings = this.findNodeSiblings(dataToChange, newNode.parent);
    let index= siblings.findIndex(node => node.id === newNode.parent);
    siblings[index].children.push(newNode)
    this.rebuildTreeForData(dataToChange);

  }



  onButtonClicked(id, button: string)
  {
    console.log(id);
    console.log(this.dataSource.data)
    const changedData = JSON.parse(JSON.stringify(this.dataSource.data))
    const siblings = this.findNodeSiblings(changedData, id);
    console.log(siblings)
    if(button ==='edit')  {this.emitNode.emit( siblings.find(node => node.id === id));}
    else if(button === 'newFolder') {this.createFolder.emit( siblings.find(node => node.id === id));}
    else if(button === 'newNode') {this.createNode.emit( siblings.find(node => node.id === id));}

  }

  emitAllRows()
  {
    const dataToEmit = JSON.parse(JSON.stringify(this.dataSource.data))
    let allRows = this.getChildren(dataToEmit); 
    this.emitAllNodes.emit(allRows);
  }

  getChildren(arr)
  {
    let result = [];
    let subResult;
    arr.forEach((item, i) => {
      if (item.children.length>0) {
        subResult = this.getChildren(item.children);
        if (subResult) result.push(...subResult);
      }
      result.push(item);

    });
    return result;
  }
}


