import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Injectable, Input, Output,ElementRef, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { forEach } from 'jszip';

/**
 * File node data with nested structure.
 * Each node has a name, and a type or a list of children.
 */
export class FileNode {
  id: string;
  children: FileNode[];
  name: string;
  type: any;
  active: any
  cartographyId: any
  cartographyName: any
  datasetURL: any
  description: any
  filterGetFeatureInfo: any
  filterGetMap: any
  filterSelectable: any
  isFolder: any
  metadataURL: any
  order: any
  parent: any
  queryableActive: any
  radio: any
  tooltip: any
  _links: any
  status: any
}

/** Flat node with expandable and level information */
export class FileFlatNode {
  constructor(
    public expandable: boolean,
    public name: string,
    public level: number,
    public type: any,
    public id: string,
    public status: string
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
  get data(): any { return this.dataChange.value; }

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
  buildFileTree(arrayTreeNodes: any[], level: number): any {
    var map = {};
    if(arrayTreeNodes.length===0)
    {
      let root = {
        isFolder:true,
        name:'Root',
        type: 'folder',
        isRoot: true,
        order: 0,
        children: []
      }
      map['root']=root;
    }
    else{
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
        var parent = obj.parent || 'root';
        if (!map[parent]) {
          map[parent] = {
            children: []
          };
        }
        map[parent].children.push(obj);
      });
      map['root'].type='folder';
      map['root'].name='Root';
      map['root'].order=0;
      map['root'].isFolder=true;
      map['root'].isRoot=true;
    }


    return map['root'];
  }
  

  deleteItem(node: FileNode, changedData:any) {
    this.deleteNode(changedData.children, node);
    this.dataChange.next(changedData);
  }

  deleteNode(nodes: FileNode[], nodeToDelete: FileNode) {
    const index = nodes.indexOf(nodeToDelete, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          this.deleteNode(node.children, nodeToDelete);
        }
      });
    }
  }

  copyPasteItem(from: FileNode, to: FileNode, changedData:any): FileNode {
    const newItem = this.insertItem(to, from,changedData);

    return newItem;
  }

  copyPasteItemAbove(from: FileNode, to: FileNode,changedData:any): FileNode {
    const newItem = this.insertItemAbove(to, from,changedData);

    return newItem;
  }

  copyPasteItemBelow(from: FileNode, to: FileNode,changedData:any): FileNode {
    const newItem = this.insertItemBelow(to, from,changedData);

    return newItem;
  }

  /** Add an item to to-do list */
  
  getNewItem(node:FileNode){
    const newItem = {
      name: node.name,
      children: node.children,
      type: node.type,
      id: node.id, 
      active: node.active,
      cartographyId: node.cartographyId,
      cartographyName: node.cartographyName,
      datasetURL: node.datasetURL,
      description: node.description,
      filterGetFeatureInfo: node.filterGetFeatureInfo,
      filterGetMap: node.filterGetMap,
      filterSelectable: node.filterSelectable,
      isFolder: node.isFolder,
      metadataURL: node.metadataURL,
      order: node.order,
      queryableActive: node.queryableActive,
      radio: node.radio,
      tooltip: node.tooltip,
      _links: node._links } as FileNode;

    return newItem;
  }

  insertItem(parent: FileNode, node: FileNode,changedData:any): FileNode {
    if (!parent.children) {
      parent.children = [];
    }
    const newItem = this.getNewItem(node)
    newItem.parent = parent==null || parent.id==undefined?null:parent.id;

    parent.children.push(newItem);
    this.dataChange.next(changedData);
    return newItem;
  }

  insertItemAbove(node: FileNode, nodeDrag: FileNode,changedData:any): FileNode {
    const parentNode = this.getParentFromNodes(node,changedData);
    const newItem = this.getNewItem(nodeDrag)
    newItem.parent = parentNode==null || parentNode.id==undefined?null:parentNode.id;

    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
    } else {
      changedData.children.splice(changedData.children.indexOf(node), 0, newItem);
    }
    this.dataChange.next(changedData);
    return newItem;
  }

  insertItemBelow(node: FileNode, nodeDrag: FileNode,changedData:any): FileNode {
    const parentNode = this.getParentFromNodes(node,changedData);
   
    const newItem = this.getNewItem(nodeDrag)
    newItem.parent = parentNode==null || parentNode.id==undefined?null:parentNode.id;

    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
    } else {
      changedData.children.splice(changedData.children.indexOf(node) + 1, 0, newItem);
    }
    this.dataChange.next(changedData);
    return newItem;
  }

  
  getParentFromNodes(node: FileNode,changedData:any): FileNode {
    for (let i = 0; i < changedData.children.length; ++i) {
      const currentRoot =  changedData.children[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  
  getParent(currentRoot: FileNode, node: FileNode): FileNode {
    if (currentRoot.children && currentRoot.children.length > 0) {
      for (let i = 0; i < currentRoot.children.length; ++i) {
        const child = currentRoot.children[i];
        if (child === node) {
          return currentRoot;
        } else if (child.children && child.children.length > 0) {
          const parent = this.getParent(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
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
  @Input() eventRefreshSubscription: Observable <any> ;
  private _eventNodeUpdatedSubscription: any;
  private _eventCreateNodeSubscription: any;
  private _eventGetAllRowsSubscription: any;
  private _eventRefreshSubscription: any;
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


  /* Drag and drop */
  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 1500;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;
  @ViewChild('emptyItem') emptyItem: ElementRef;

    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    flatNodeMap = new Map<FileFlatNode, FileNode>();

    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMap = new Map<FileNode, FileFlatNode>();


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

    if (this.eventRefreshSubscription) {
      this._eventRefreshSubscription = this.eventRefreshSubscription.subscribe(() => {
        this.getElements();
      });
    }
    
    this.getElements();
  }

  getElements(): void {
    this.getAll()
    .subscribe((items) => {
      this.treeData = items;
      this.database.initialize(this.treeData);
      this.database.dataChange.subscribe(data => this.rebuildTreeForData([data]));
    });
  }


  transformer = (node: FileNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.name === node.name
      ? existingNode
      : new FileFlatNode((node.children && node.children.length > 0),node.name,level,node.type,node.id,node.status);

    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  
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


  handleDragStart(event, node) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    event.dataTransfer.setData('foo', 'bar');
    event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
    this.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleDragOver(event, node) {
    event.preventDefault();

    // Handle node expand
    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          this.treeControl.expand(node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }

    // Handle drag area
    const percentageX = event.offsetX / event.target.clientWidth;
    const percentageY = event.offsetY / event.target.clientHeight;
    if (percentageY < 0.25) {
      this.dragNodeExpandOverArea = 'above';
    } else if (percentageY > 0.75) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
  }

  handleDrop(event, node) {
    event.preventDefault();
    const changedData = JSON.parse(JSON.stringify(this.dataSource.data))
    const siblings = this.findNodeSiblings(changedData, node.id);

    let toFlatNode= siblings.find(nodeAct => nodeAct.id === node.id);
    let fromFlatNode= siblings.find(nodeAct => nodeAct.id === this.dragNode.id);
    if (this.dragNode.status!="pendingDelete" && node !== this.dragNode && (this.dragNodeExpandOverArea !== 'center' || (this.dragNodeExpandOverArea === 'center' && toFlatNode.isFolder))) {
      let newItem: FileNode;

      if (this.dragNodeExpandOverArea === 'above') {
        newItem = this.database.copyPasteItemAbove(fromFlatNode,toFlatNode,changedData[0]);
      } else if (this.dragNodeExpandOverArea === 'below') {
        newItem = this.database.copyPasteItemBelow(fromFlatNode,toFlatNode,changedData[0]);
      } else {
        newItem = this.database.copyPasteItem(fromFlatNode, toFlatNode,changedData[0]);
      }
      let parentLvl=this.treeControl.dataNodes.find((n) => n.id === fromFlatNode.id).level;
      fromFlatNode.children.forEach(child=>{
        this.treeControl.dataNodes.find((n) => n.id === child.id).level=parentLvl+1
      });
      this.database.deleteItem(fromFlatNode,changedData[0]);
      this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));
    }
   
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  handleDragEnd(event) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  /**
   * The following methods are for persisting the tree expand state
   * after being rebuilt
   */

   sortByOrder(data: any[]){
    data.sort((a,b) => a.order.toString().localeCompare( b.order.toString()));
    data.forEach((item) => {
      if (item.children.length>0) {
        this.sortByOrder(item.children);
      }

    });
   }

  rebuildTreeForData(data: any[]) {
    //this.dataSource.data = data;
    this.sortByOrder(data);
    this.dataSource.data = [];
    this.dataSource.data = data;
    this.treeControl.expansionModel.selected.forEach((nodeAct) => {
      const node = this.treeControl.dataNodes.find((n) => n.id === nodeAct.id);
      this.treeControl.expand(node);
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
    this.rebuildTreeForData(dataToChange);

  }

  createNewFolder(newFolder)
  {
    newFolder.type="folder";
    const dataToChange = JSON.parse(JSON.stringify(this.dataSource.data))
    if(newFolder.parent === null) {
      newFolder.order=dataToChange[0].children.length;
      dataToChange[0].children.push(newFolder)
    }
    else{
      const siblings = this.findNodeSiblings(dataToChange, newFolder.parent);
      let index= siblings.findIndex(node => node.id === newFolder.parent);
      newFolder.order=siblings[index].children.length;
      siblings[index].children.push(newFolder)
    }
    this.rebuildTreeForData(dataToChange);

  }

  createNewNode(newNode)
  {
    newNode.type="node";
    const dataToChange = JSON.parse(JSON.stringify(this.dataSource.data))
    if(newNode.parent === null) {
      newNode.order=dataToChange[0].children.length;
      dataToChange[0].children.push(newNode)
    }
    else{
    const siblings = this.findNodeSiblings(dataToChange, newNode.parent);
    let index= siblings.findIndex(node => node.id === newNode.parent);
    newNode.order=siblings[index].children.length;
    siblings[index].children.push(newNode)
    }

    this.rebuildTreeForData(dataToChange);

  }



  onButtonClicked(id, button: string)
  {
    const changedData = JSON.parse(JSON.stringify(this.dataSource.data))
    const siblings = this.findNodeSiblings(changedData, id);
    let nodeClicked= siblings.find(node => node.id === id);
    if(button ==='edit')  {this.emitNode.emit(nodeClicked)}
    else if(button === 'newFolder') {this.createFolder.emit(nodeClicked)}
    else if(button === 'newNode') {this.createNode.emit( nodeClicked)}
    else if(button === 'delete') {
      // let children= this.getAllChildren(nodeClicked.children)
      // children.forEach(children => {
      //   children.status='pendingDelete';
      // });
      this.deleteChildren(nodeClicked.children);
      // nodeClicked.children=children
      nodeClicked.status='pendingDelete'
      
      this.rebuildTreeForData(changedData);
    }

  }

  emitAllRows()
  {
    const dataToEmit = JSON.parse(JSON.stringify(this.dataSource.data))
    let allRows = this.getAllChildren(dataToEmit); 
    this.emitAllNodes.emit(allRows);
  }

  getAllChildren(arr)
  {
    let result = [];
    let subResult;
    arr.forEach((item, i) => {
      if (item.children.length>0) {
        subResult = this.getAllChildren(item.children);
        if (subResult) result.push(...subResult);
      }
      result.push(item);

    });
    return result;
  }

  deleteChildren(arr)
  {
    arr.forEach((item, i) => {
      if (item.children.length>0) {
        this.deleteChildren(item.children);
      }
      item.status='pendingDelete'

    });
  }

}


