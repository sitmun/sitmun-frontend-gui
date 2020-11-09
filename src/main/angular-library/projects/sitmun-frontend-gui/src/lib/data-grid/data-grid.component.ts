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

  @Output() remove: EventEmitter<any[]>;
  @Output() new: EventEmitter<boolean>;


  constructor() {
    this.remove = new EventEmitter();
    this.new = new EventEmitter();
  }

  ngOnInit() {
  }

  onGridReady(params){
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.rowHeight = 100;
    this.getElements();
    params.api.sizeColumnsToFit();

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

  removeData() {
    let selectedNodes = this.gridApi.getSelectedNodes();
  	let selectedData = selectedNodes.map(node => node.data);
    console.log(selectedData);
    this.remove.emit(selectedData);
}

  newData()
  {
    this.new.emit(true);
  }


}
