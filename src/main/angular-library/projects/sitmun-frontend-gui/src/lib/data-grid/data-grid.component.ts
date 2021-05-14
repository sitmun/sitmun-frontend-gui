import { AgGridModule } from '@ag-grid-community/angular';
import { Component, OnInit, NgModule, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AllCommunityModules, ColumnApi, Module } from '@ag-grid-community/all-modules';
import { TranslateService } from '@ngx-translate/core';
import { BtnEditRenderedComponent } from '../btn-edit-rendered/btn-edit-rendered.component';
import { BtnCheckboxRenderedComponent } from '../btn-checkbox-rendered/btn-checkbox-rendered.component';
import { BtnCheckboxFilterComponent } from '../btn-checkbox-filter/btn-checkbox-filter.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogMessageComponent } from '../dialog-message/dialog-message.component';
import { forEach } from 'jszip';
declare let $: any;



@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {

  _eventRefreshSubscription: any;
  _eventGetSelectedRowsSubscription: any;
  _eventGetAllRowsSubscription: any;
  _eventSaveAgGridStateSubscription: any;
  modules: Module[] = AllCommunityModules;


  UndeRedoActions
  searchValue: string;
  gridApi: any;
  gridColumnApi: any;
  statusColumn = false;
  someColumnIsEditable = false;
  changesMap: Map<number, Map<string, number>> = new Map<number, Map<string, number>>();
  // We will save the id of edited cells and the number of editions done.
  params: any; // Last parameters of the grid (in case we do apply changes we will need it) 
  rowData: any[];
  changeCounter: number; // Number of editions done above any cell 
  previousChangeCounter: number; // Number of ditions done after the last modification(changeCounter)
  redoCounter: number; // Number of redo we can do
  modificationChange = false;
  undoNoChanges = false; // Boolean that indicates if an undo hasn't modifications
  gridOptions;
  someStatusHasChangedToDelete = false;


  @Input() eventRefreshSubscription: Observable<boolean>;
  @Input() eventGetSelectedRowsSubscription: Observable<boolean>;
  @Input() eventGetAllRowsSubscription: Observable<boolean>;
  @Input() eventSaveAgGridStateSubscription: Observable<boolean>;
  @Input() eventAddItemsSubscription: Observable<boolean>;
  @Input() frameworkComponents: any;
  @Input() components: any;
  @Input() columnDefs: any[];
  @Input() getAll: () => Observable<any>;
  @Input() discardChangesButton: boolean;
  @Input() discardNonReverseStatus: boolean;
  @Input() id: any;
  @Input() undoButton: boolean;
  @Input() defaultColumnSorting: string;
  @Input() redoButton: boolean;
  @Input() applyChangesButton: boolean;
  @Input() deleteButton: boolean;
  @Input() newButton: boolean;
  @Input() actionButton: boolean;
  @Input() addButton: boolean;
  @Input() globalSearch: boolean;
  @Input() changeHeightButton: boolean;
  @Input() defaultHeight: any;
  @Input() themeGrid: any;
  @Input() singleSelection: boolean;
  @Input() nonEditable: boolean;
  @Input() title: string;
  @Input() hideExportButton: boolean;
  @Input() hideDuplicateButton: boolean;
  @Input() hideSearchReplaceButton: boolean;
  @Input() addFieldRestriction: any;


  @Output() remove: EventEmitter<any[]>;
  @Output() new: EventEmitter<number>;
  @Output() add: EventEmitter<number>;
  @Output() discardChanges: EventEmitter<any[]>;
  @Output() sendChanges: EventEmitter<any[]>;
  @Output() duplicate: EventEmitter<any[]>;
  @Output() getSelectedRows: EventEmitter<any[]>;
  @Output() getAllRows: EventEmitter<any[]>;
  @Output() getAgGridState: EventEmitter<any[]>;
  @Output() gridModified: EventEmitter<boolean>;


  constructor(public dialog: MatDialog,
    public translate: TranslateService,
    private elRef: ElementRef) {
    this.translate = translate;

    this.frameworkComponents = {
      btnEditRendererComponent: BtnEditRenderedComponent,
      btnCheckboxRendererComponent: BtnCheckboxRenderedComponent,
      btnCheckboxFilterComponent: BtnCheckboxFilterComponent
    };

    this.components = {
      datePicker: this.getDatePicker()
    };


    this.remove = new EventEmitter();
    this.new = new EventEmitter();
    this.add = new EventEmitter();
    this.discardChanges= new EventEmitter();
    this.sendChanges = new EventEmitter();
    this.getSelectedRows = new EventEmitter();
    this.duplicate = new EventEmitter();
    this.getAllRows = new EventEmitter();
    this.gridModified = new EventEmitter();
    this.changeCounter = 0;
    this.previousChangeCounter = 0;
    this.redoCounter = 0;
    this.gridOptions = {
      defaultColDef: {
        sortable: true,
        flex: 1,
        filter: true,
        editable: !this.nonEditable,
        suppressMenu: true,
        resizable: true,
        cellStyle: (params) => {
          if(params.value && params.colDef.editable){
            if(this.changesMap.has(params.node.id) && this.changesMap.get(params.node.id).has(params.colDef.field)){
              return {'background-color': '#E8F1DE'};
            }
            else{
              return {'background-color': 'white'};
            }
          }
          else {
            return {'background-color': 'white'};
          }
        } ,
      },
      rowSelection: 'multiple',
      singleClickEdit: true,
      // suppressHorizontalScroll: true,
      localeTextFunc: (key: string, defaultValue: string) => {
        const data = this.translate.instant(key);
        return data === key ? defaultValue : data;
      }

    }


  }


  ngOnInit() {

    if (this.eventRefreshSubscription) {
      this._eventRefreshSubscription = this.eventRefreshSubscription.subscribe(() => {
        this.changesMap.clear();
        this.someStatusHasChangedToDelete=false;
        this.changeCounter = 0;
        this.previousChangeCounter = 0;
        this.redoCounter = 0;
        this.getElements();
      });
    }
    if (this.eventGetSelectedRowsSubscription) {
      this._eventGetSelectedRowsSubscription = this.eventGetSelectedRowsSubscription.subscribe(() => {
        this.emitSelectedRows();
      });
    }
    if (this.eventGetAllRowsSubscription) {
      this._eventGetAllRowsSubscription = this.eventGetAllRowsSubscription.subscribe(() => {
        this.emitAllRows();
      });
    }

    if (this.eventSaveAgGridStateSubscription) {
      this._eventSaveAgGridStateSubscription = this.eventSaveAgGridStateSubscription.subscribe(() => {
        this.saveAgGridState();
      });
    }

    if (this.eventAddItemsSubscription) {
      this.eventAddItemsSubscription.subscribe(
        (items: any) => {
          this.addItems(items);
        }
      )
    }
  }


  firstDataRendered(): void {
    if (localStorage.agGridState != undefined) {
      let agGridState = JSON.parse(localStorage.agGridState)
      if (agGridState.idAgGrid != undefined && agGridState.idAgGrid == this.id) {
        this.gridApi.setFilterModel(agGridState.filterState);
        this.gridColumnApi.setColumnState(agGridState.colState);
        this.gridApi.setSortModel(agGridState.sortState);
        this.searchValue = agGridState.valueSearchGeneric;
        this.quickSearch();
        this.removeAgGridState();
      } else if (this.id != undefined) {
        this.removeAgGridState();
      }
    }
  }

  onGridReady(params): void {
    if (this.singleSelection) { this.gridOptions.rowSelection = 'single' }
    // if (this.nonEditable) {this.gridOptions.defaultColDef.editable = false}
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    for (const col of this.columnDefs) {
      if(!this.someColumnIsEditable && col.editable) { this.someColumnIsEditable = true}
      if (col.field === 'status') {
        this.statusColumn = true;
      }
    }
    this.getElements();
    console.log(this.columnDefs);
    if (this.defaultColumnSorting) {
      const sortModel = [
        { colId: this.defaultColumnSorting, sort: 'asc' }
      ];
      this.gridApi.setSortModel(sortModel);
    }
    if(this.defaultHeight != null && this.defaultHeight != undefined){
      this.changeHeight(this.defaultHeight)
    }
  }


  getDatePicker() {
    function Datepicker() {}
    Datepicker.prototype.init = function (params) {
      this.eInput = document.createElement('input');
      this.eInput.value = params.value;
      this.eInput.classList.add('ag-input');
      this.eInput.style.height = '100%';
      $(this.eInput).datepicker({ dateFormat: 'mm/dd/yy' });
    };
    Datepicker.prototype.getGui = function () {
      return this.eInput;
    };
    Datepicker.prototype.afterGuiAttached = function () {
      this.eInput.focus();
      this.eInput.select();
    };
    Datepicker.prototype.getValue = function () {
      return this.eInput.value;
    };
    Datepicker.prototype.destroy = function () {};
    Datepicker.prototype.isPopup = function () {
      return false;
    };
    return Datepicker;
  }

  areRowsSelected(): Boolean {
    return (this.gridApi != null && this.gridApi.getSelectedNodes().length > 0)? true: false;
    // if (this.gridApi != null && this.gridApi.getSelectedNodes().length > 0) {
    //   return true
    // } else {
    //   return false
    // }
  }


  emitSelectedRows(): void {
    const selectedNodes = this.gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    this.getSelectedRows.emit(selectedData);
  }

  emitAllRows(): void {
    let rowData = [];
    this.gridApi.forEachNode(node => rowData.push(node.data));
    this.getAllRows.emit(rowData);
  }

  saveAgGridState(): void {
    let agGridState = {
      idAgGrid: this.id,
      colState: this.gridColumnApi.getColumnState(),
      filterState: this.gridApi.getFilterModel(),
      sortState: this.gridApi.getSortModel(),
      valueSearchGeneric: this.searchValue
    };

    localStorage.setItem("agGridState", JSON.stringify(agGridState));

  }
  removeAgGridState(): void {
    localStorage.removeItem("agGridState")
  }

  getColumnKeysAndHeaders(columnkeys: Array<any>): String {
    let header: Array<any> = [];
    if (this.columnDefs.length == 0) { return '' };

    let allColumnKeys = this.gridOptions.columnApi.getAllDisplayedColumns();
    // console.log(allColumnKeys);
    allColumnKeys.forEach(element => {
      if (element.userProvidedColDef.headerName !== '') {
        columnkeys.push(element.userProvidedColDef.field);
        header.push(element.userProvidedColDef.headerName);
      }


    });

    return header.join(",");
  }


  exportData(): void {
    let columnkeys: Array<any> = [];
    let customHeader: String = '';
    customHeader = this.getColumnKeysAndHeaders(columnkeys)
    let params = {
      onlySelected: true,
      columnKeys: columnkeys,
      customHeader: customHeader,
      skipHeader: true
    };
    this.gridApi.exportDataAsCsv(params);
  }

  quickSearch(): void {
    this.gridApi.setQuickFilter(this.searchValue);
  }

  getElements(): void {
    this.getAll()
      .subscribe((items) => {
        if(this.statusColumn){
          items.forEach(element => {
            element.status='statusOK'
          });
        }
        this.rowData = items;
        this.gridApi.setRowData(this.rowData);
        this.setSize()
        // this.gridApi.sizeColumnsToFit()
        console.log(this.rowData);

      });
  }

  setSize() {

    var allColumnIds = [];
    let columns = this.gridOptions.columnApi.getAllColumns();
    columns.forEach(function (column) {
      allColumnIds.push(column.colId);
    });

    this.gridOptions.columnApi.autoSizeColumns(allColumnIds);

    let grid = this.gridOptions.api
    let availableWidth = grid.gridPanel.eBodyViewport.clientWidth;

    let usedWidth = grid.gridPanel.columnController.getWidthOfColsInList(columns);

    if (usedWidth < availableWidth) {
      grid.sizeColumnsToFit();
    }

  }

  addItems(newItems: any[]): void {
    console.log(newItems);
    let itemsToAdd: Array<any> = [];
    let condition = (this.addFieldRestriction)? this.addFieldRestriction: 'id';

    newItems.forEach(item => {

      if (item[condition] == undefined || (this.rowData.find(element => element[condition] == item[condition])) == undefined) {
        if (this.statusColumn) {
          item.status = 'pendingCreation'
          item.newItem = true;
        }
        itemsToAdd.push(item);
        this.rowData.push(item);
      }
      else {
        console.log(`Item with the ${condition} ${item[condition]} already exists`)
      }
    });
    this.gridApi.updateRowData({ add: itemsToAdd });

    console.log(this.columnDefs);
    // params.oldValue!=undefined
  }


  changeHeight(value) {
    let pixels = "";
    if (value === '5') {
      pixels = "200px"
    } else if (value === '10') {
      pixels = "315px"
    } else if (value === '20') {
      pixels = "630px"
    } else {
      pixels = "1550px"
    }
    this.elRef.nativeElement.parentElement.style.height = pixels;
  }

  removeData(): void {
    this.gridApi.stopEditing(false);
    const selectedNodes = this.gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    this.remove.emit(selectedData);

    if (this.statusColumn) {
      const selectedRows = selectedNodes.map(node => node.id);
      if(selectedRows.length>0) {this.someStatusHasChangedToDelete=true;}
      for (const id of selectedRows) {
        this.gridApi.getRowNode(id).data.status = 'pendingDelete';
      }
      this.gridOptions.api.refreshCells();
    }
    this.gridOptions.api.deselectAll();
  }

  newData(): void {
    this.gridApi.stopEditing(false);
    this.new.emit(-1);
  }

  onAddButtonClicked(): void {
    this.gridApi.stopEditing(false);
    this.add.emit(-1);
  }

  onDuplicateButtonClicked(): void {
    this.gridApi.stopEditing(false);
    if (this.changeCounter > 0) {
      const dialogRef = this.dialog.open(DialogMessageComponent);
      dialogRef.componentInstance.title = this.translate.instant('caution')
      dialogRef.componentInstance.message = this.translate.instant('duplicateMessage')
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (result.event === 'Accept') {
            const selectedNodes = this.gridApi.getSelectedNodes();
            const selectedData = selectedNodes.map(node => node.data);
            this.duplicate.emit(selectedData);
          }
        }
      });

    }
    else {
      const selectedNodes = this.gridApi.getSelectedNodes();
      const selectedData = selectedNodes.map(node => node.data);
      this.duplicate.emit(selectedData);
    }
  }


  applyChanges(): void {
    const itemsChanged: any[] = [];
    this.gridApi.stopEditing(false);
    for (const key of this.changesMap.keys()) {
      itemsChanged.push(this.gridApi.getRowNode(key).data);
    }
    this.sendChanges.emit(itemsChanged);
    this.gridModified.emit(false);
    this.changesMap.clear();
    this.changeCounter = 0;
    this.previousChangeCounter = 0;
    this.redoCounter = 0;
    this.someStatusHasChangedToDelete=false;
    // this.params.colDef.cellStyle = { backgroundColor: '#FFFFFF' };
    this.gridApi.redrawRows();
  }



  deleteChanges(): void {
    this.gridApi.stopEditing(false);

    while (this.changeCounter > 0) {
      this.undo();
    }

    this.changesMap.clear();
    //this.previousChangeCounter = 0;
    this.redoCounter = 0;

    if(this.statusColumn && !this.discardNonReverseStatus)
    {
      let rowsWithStatusModified = [];
      this.gridApi.forEachNode(function(node) { 
        if(node.data.status === 'pendingModify' || node.data.status === 'pendingDelete') {
          if(node.data.status === 'pendingDelete'){
            rowsWithStatusModified.push(node.data);
          }
          if(node.data.newItem){
            node.data.status='pendingCreation'
          }
          else{
            node.data.status='statusOK'
          }
        }
        
        console.log(node)
    });
    this.someStatusHasChangedToDelete=false;
    this.discardChanges.emit(rowsWithStatusModified);
    this.gridModified.emit(false);
  }
  this.gridApi.redrawRows();

    //this.params.colDef.cellStyle =  {backgroundColor: '#FFFFFF'};
    //this.gridApi.redrawRows();
  }


  onFilterModified(): void {

    this.deleteChanges();

  }


  undo(): void {
    this.gridApi.stopEditing(false);
    this.gridApi.undoCellEditing();
    this.changeCounter -= 1;
    if(this.changeCounter == 0) { this.gridModified.emit(false)}
    this.redoCounter += 1;
  }

  redo(): void {
    this.gridApi.stopEditing(false);
    this.gridApi.redoCellEditing();
    this.changeCounter += 1;
    this.redoCounter -= 1;
  }


  onCellEditingStopped(e) {
    if (this.modificationChange) {
      this.changeCounter++;
      if(this.changeCounter == 1) { this.gridModified.emit(true)}
      this.redoCounter = 0;
      this.onCellValueChanged(e);
      this.modificationChange = false;
    }
  }


  onCellValueChanged(params): void {
    this.params = params;
    if (this.changeCounter > this.previousChangeCounter)
    // True if we have edited some cell or we have done a redo 
    {

      if (params.oldValue !== params.value && !(params.oldValue == null && params.value === '')) {

        if (!this.changesMap.has(params.node.id)) // If it's firts edit of a cell, we add it to the map and we paint it
        {
          const addMap: Map<string, number> = new Map<string, number>();
          addMap.set(params.colDef.field, 1)
          this.changesMap.set(params.node.id, addMap);
          if (this.statusColumn) {
            if (this.gridApi.getRowNode(params.node.id).data.status !== 'pendingCreation') {
              this.gridApi.getRowNode(params.node.id).data.status = 'pendingModify'
            }
          }
        }
        else {
          if (!this.changesMap.get(params.node.id).has(params.colDef.field)) {

            this.changesMap.get(params.node.id).set(params.colDef.field, 1);
          }

          else {
            // We already had edited this cell, so we only increment number of changes of it on the map 
            const currentChanges = this.changesMap.get(params.node.id).get(params.colDef.field);
            this.changesMap.get(params.node.id).set(params.colDef.field, (currentChanges + 1));
          }

        }
        this.paintCells(params, this.changesMap); //We paint the row of the edited cell 
        this.previousChangeCounter++; //We match the current previousChangeCounter with changeCounter
      }

    }
    else if (this.changeCounter < this.previousChangeCounter) { // True if we have done an undo
      let currentChanges = -1;
      if (this.changesMap.has(params.node.id)) { currentChanges = this.changesMap.get(params.node.id).get(params.colDef.field); }

      if (currentChanges === 1) { //Once the undo it's done, cell is in his initial status

        this.changesMap.get(params.node.id).delete(params.colDef.field);
        if (this.changesMap.get(params.node.id).size === 0) { // No more modifications in this row
          this.changesMap.delete(params.node.id);
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);
          if (this.statusColumn) {
            if (this.gridApi.getRowNode(params.node.id).data.status !== 'pendingCreation') {
              this.gridApi.getRowNode(params.node.id).data.status ='statusOK'
            }
          };
          // We paint it white
          this.gridApi.redrawRows({ rowNodes: [row] });

        }
        else {
          this.paintCells(params, this.changesMap);
        }

      }
      else if (currentChanges > 1) // The cell isn't in his initial state yet
      {                                 //We can't do else because we can be doing an undo without changes 
        this.changesMap.get(params.node.id).set(params.colDef.field, (currentChanges - 1));

        this.paintCells(params, this.changesMap);//Not initial state -> green background

      }
      this.previousChangeCounter--;  //We decrement previousChangeCounter because we have done undo
    }
    else { // Control of modifications without changes
      if (!(params.oldValue == null && params.value === '')) {
        let newValue: string;
        if (params.value == null) { newValue = '' }
        else { newValue = params.value.toString() }

        if ((params.oldValue != undefined && params.oldValue != null && params.oldValue.toString() !== newValue.toString())
          || ((params.oldValue == undefined || params.oldValue == null) && newValue != null)) {

          this.modificationChange = true;
          if (params.colDef.cellRenderer == "btnCheckboxRendererComponent") {
            var undoRedoActions = {
              cellValueChanges: this.gridApi.undoRedoService.cellValueChanges
            };
            this.gridApi.undoRedoService.pushActionsToUndoStack(undoRedoActions);
            this.gridApi.undoRedoService.isFilling = false;
            this.onCellEditingStopped(params);
          }
        }
        else { this.modificationWithoutChanges(params) }

      }
      else { this.modificationWithoutChanges(params) }
    }
  }

  modificationWithoutChanges(params: any) {

    if (this.changesMap.has(params.node.id)) //Modification without changes in en edited cell
    {
      if (!this.undoNoChanges) {
        this.gridApi.undoCellEditing(); // Undo to delete the change without changes internally 
        this.undoNoChanges = true;
        this.paintCells(params, this.changesMap);  //The cell has modifications yet -> green background 
      }
      else { this.undoNoChanges = false; }


    }
    else {
      //With the internally undo will enter at this function, so we have to control when done the undo or not 
      if (!this.undoNoChanges) {
        this.gridApi.undoCellEditing(); // Undo to delete the change internally
        this.undoNoChanges = true;
      }
      else { this.undoNoChanges = false; }
    }

  }

  getColumnIndexByColId(api: ColumnApi, colId: string): number {
    return api.getAllColumns().findIndex(col => col.getColId() === colId);
  }
  paintCells(params: any, changesMap: Map<number, Map<string, number>>,) {
    const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);

    // this.changeCellStyleColumns(params, changesMap, '#E8F1DE');
    this.gridApi.redrawRows({ rowNodes: [row] });
    // this.changeCellStyleColumns(params, changesMap, '#FFFFFF');
    // We will define cellStyle white to future modifications (like filter)
  }

  // changeCellStyleColumns(params: any, changesMap: Map<number, Map<string, number>>, color: string) {

  //   for (const key of changesMap.get(params.node.id).keys()) {
  //     const columnNumber = this.getColumnIndexByColId(this.gridColumnApi, key);
  //     this.gridColumnApi.columnController.gridColumns[columnNumber].colDef.cellStyle = { backgroundColor: color };
  //   }


  // }

}
