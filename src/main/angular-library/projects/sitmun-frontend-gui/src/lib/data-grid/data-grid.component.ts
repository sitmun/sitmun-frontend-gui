import { AgGridModule } from '@ag-grid-community/angular';
import { Component, OnInit, NgModule, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AllCommunityModules, Module } from '@ag-grid-community/all-modules';






@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css']
})
export class DataGridComponent implements OnInit {

  modules: Module[] = AllCommunityModules;
  searchValue: string;
  private gridApi;
  private gridColumnApi;
  @Input() columnDefs: any[];
  rowData: any[];
  @Input() getAll: () => Observable<any>;
  // @Input() removeFunction: (item: any) => Observable<any>;


  constructor() {
   let gridOptions = {
      defaultColDef: {
        editable: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        sortable: true,
        resizable: true,
        flex: 1,
        minWidth: 100,
      },
      suppressRowClickSelection: true,
      groupSelectsChildren: true,
      debug: true,
      rowSelection: 'multiple',
      rowGroupPanelShow: 'always',
      pivotPanelShow: 'always',
      pagination: false,
      enableRangeSelection: true,
    };

  

  }

  ngOnInit() {
  }

  onGridReady(params){
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.rowHeight = 100;
    // this.gridApi.setRowData(this.getAll);
    this.getElements();

  }

  quickSearch(){
      this.gridApi.setQuickFilter(this.searchValue);
  }

  getElements()
  {
    this.getAll()
    .subscribe((items) =>{
        console.log(items);
        this.rowData=items;
       // this.gridApi.setRowData(items);

    });
  }


  // removeElement()
  // {
  //   this.removeFunction(this.rowData[0])
  //   .subscribe((data) => {
  //     console.log(data);
  //   } )
  //   // this.getElements();
    
  // }
}
