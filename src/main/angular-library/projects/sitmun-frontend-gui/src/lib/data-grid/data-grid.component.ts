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
export class DataGridComponent {
 


  modules: Module[] = AllCommunityModules;
  searchValue: string;
  private gridApi;
  private gridColumnApi;
  map: Map<number, number> = new Map<number, number>(); // Guardarem l'id de les celes modificades i el nº d'edicions sobre aquestes
  private params; // Params del grid a l'última modificacio (per si fem apply changes)
  rowData: any[];
  comptadorCanvis: number; // Nombre d'edicions fetes sobre celes
  comptadorCanvisAnterior: number; // Nombre d'edicions anterior a l'actual (comptadorCanvis)
  comptadorRedo: number; // Nombre de redos que podem fer
  gridOptions;
  @Input() columnDefs: any[];
  @Input() getAll: () => Observable<any>;
  @Output() remove: EventEmitter<any[]>;
  @Output() new: EventEmitter<boolean>;
  @Output() sendChanges: EventEmitter<any[]>;


  constructor() {

    this.remove = new EventEmitter();
    this.new = new EventEmitter();
    this.sendChanges = new EventEmitter();
    this.comptadorCanvis = 0;
    this.comptadorCanvisAnterior = 0;
    this.comptadorRedo = 0;
    this.gridOptions = {
      defaultColDef: {
        flex: 1,
        filter: true,
        editable: true,
        minWidth: 100,
        cellStyle: {backgroundColor: '#FFFFFF'},
      },
      rowSelection: 'multiple',

    };

  }



  onGridReady(params): void{
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.rowHeight = 100;
    this.getElements();
    this.gridApi.sizeColumnsToFit();


  }

  quickSearch(): void{
      this.gridApi.setQuickFilter(this.searchValue);
  }

  getElements(): void
  {
    this.getAll()
    .subscribe((items) => {
        console.log(items);
        this.rowData = items;
    });
  }

  removeData(): void {
    this.gridApi.stopEditing(false);
    const selectedNodes = this.gridApi.getSelectedNodes();
  	 const selectedData = selectedNodes.map(node => node.data);
    console.log(selectedData);
    this.remove.emit(selectedData);
  }

  newData(): void
  {
    console.log(this.comptadorCanvis);
    this.gridApi.stopEditing(false);
    this.new.emit(true);
  }

  applyChanges(): void
  {
    const itemsChanged: any[] = [];
    this.gridApi.stopEditing(false);
    for (const key of this.map.keys())
    {
      itemsChanged.push(this.gridApi.getRowNode(key).data);
    }
    this.sendChanges.emit(itemsChanged);
    this.map.clear();
    this.comptadorCanvis = 0;
    this.comptadorCanvisAnterior = 0;
    this.comptadorRedo = 0;
    this.params.colDef.cellStyle =  {backgroundColor: '#FFFFFF'};
    this.gridApi.redrawRows();
  }



  deleteChanges(): void
  {
    console.log(this.comptadorCanvis);
    for (let i = 0; i < this.comptadorCanvis; i++)
    {
      this.gridApi.undoCellEditing();
    }
    this.map.clear();
    this.comptadorCanvisAnterior = 0;
    this.comptadorCanvis = 0;
    this.comptadorRedo = 0;
    this.params.colDef.cellStyle =  {backgroundColor: '#FFFFFF'};
    this.gridApi.redrawRows();
  }



  undo(): void {
    this.gridApi.stopEditing(false);
    this.gridApi.undoCellEditing();
    this.comptadorCanvis -= 1;
    this.comptadorRedo += 1;
  }

  redo(): void {
    this.gridApi.stopEditing(false);
    this.gridApi.redoCellEditing();
    this.comptadorCanvis += 1;
    this.comptadorRedo -= 1;
  }


  onCellEditingStopped(e)
  {
    this.comptadorCanvis++;
    this.comptadorRedo = 0;
    this.onCellValueChanged(e);
  }




  onCellValueChanged(params): void{
    this.params = params; // Guardarem els paramatres actuals per si hem de fer un apply changes

    if (this.comptadorCanvis > this.comptadorCanvisAnterior)
      // Aquesta condició serà certa si venim d'editar o de fer un redo (comptador canvis >), però no si venim d'un undo

      {
        if (! this.map.has(params.node.id)) // Si no hem editat la cela amb anterioritat, l'afegirem al map i canviarem el background a verd
        {
          this.map.set(params.node.id, 1);
        }
        else{
           // Si ja estava modificada, incrementarem el nombre de canvis d'aquesta cela al map
          const modificacionsActuals = this.map.get(params.node.id);
          this.map.set(params.node.id, (modificacionsActuals + 1));
        }
        const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex); // Com ha estat modificada la linea, la pintarem de verd
        params.colDef.cellStyle = {backgroundColor: '#E8F1DE'};
        this.gridApi.redrawRows({rowNodes: [row]});
        params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Definirem el cellStyle blanc per proximes celes
        this.comptadorCanvisAnterior++;

      }
    if (this.comptadorCanvis < this.comptadorCanvisAnterior){ // Entrarà aquí si venim d'un undo
        // Com sabem que ja haviem editat la cela, agafem el nombre de modificacions que l'hem fet
        const modificacionsActuals = this.map.get(params.node.id);

        if (modificacionsActuals === 1) {
          // Si només te una modificació, vol dir que amb l'undo hem deixat la cela com a l'estat inicial, pel que l'hem de borrar del map
          this.map.delete(params.node.id);
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);
          params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Li posarem un altre cop el background blanc
          this.gridApi.redrawRows({rowNodes: [row]});
        }
        else // La cela encara no està com a l'estat inicial, pel que nomes restem el nombre de modificacions al map
        {
          this.map.set(params.node.id, (modificacionsActuals - 1));
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex); // Com encara te modificacions, ha de tenir el background verd
          params.colDef.cellStyle = {backgroundColor: '#E8F1DE'};
          this.gridApi.redrawRows({rowNodes: [row]});
          params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Definirem el cellStyle blanc per proximes celes
        }
        this.comptadorCanvisAnterior--;  // Com veniem d'undo, hem de decrementar el comptador de canvisAnterior
      }
    }


}
