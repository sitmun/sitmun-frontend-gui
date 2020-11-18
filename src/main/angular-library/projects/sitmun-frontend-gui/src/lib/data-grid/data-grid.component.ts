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
  columnaEstat = false;
  map: Map<number, number> = new Map<number, number>(); // Guardaremos el id de las celas modificadas i el nº de ediciones hechas sobre estas
  private params; //Parametros del grid en la ultima modificacion hecha (por si hacemos apply changes)
  rowData: any[];
  comptadorCanvis: number; // Numero de ediciones hechas sobre las celas
  comptadorCanvisAnterior: number; //  Numero de ediciones que habia antes de hacer la ultima modificacion (comptadorCanvis)
  comptadorRedo: number; // Numero de redo que podemos hacer
  gridOptions;
  @Input() columnDefs: any[];
  @Input() getAll: () => Observable<any>;
  @Input() botoDescartarCanvis: boolean;
  @Input() botoUndo: boolean;
  @Input() botoRedo: boolean;
  @Input() botoAplicarCanvis: boolean;
  @Input() botoElimina: boolean;
  @Input() botoNou: boolean;
  @Input() searchGeneral: boolean;



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
        cellStyle: {backgroundColor: '#FFFFFF'},
      },
      rowSelection: 'multiple',
      // suppressHorizontalScroll: true,

    };

  }



  onGridReady(params): void{
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.getElements();
    this.gridApi.sizeColumnsToFit();
    for (const col of this.columnDefs) {
      if (col.field === 'estat') {
        this.columnaEstat = true;
      }
    }
 
   

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
        setTimeout(()=>{this.gridApi.sizeColumnsToFit()}, 30);
    });
  }

  removeData(): void {
    this.gridApi.stopEditing(false);
    const selectedNodes = this.gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    this.remove.emit(selectedData);

    if(this.columnaEstat)
    {
      const selectedRows = selectedNodes.map(node => node.rowIndex);

      for (const id of selectedRows){
          this.gridApi.getRowNode(id).data.estat ='Eliminat';
        }
      this.gridOptions.api.refreshCells();
    }
  }





  newData(): void
  {
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


  onFilterModified(): void{
    this.deleteChanges();
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
    this.params = params; // Guardaremos los parametros actuales por si luego hay que hacer un applyChanges

    if (this.comptadorCanvis > this.comptadorCanvisAnterior)
      //Esta condición será cierta si hemos editado o hecho un redo, pero no si hemos hecho un undo

      {
        if (! this.map.has(params.node.id)) //Si no hemos editado la cela anteriormente, la añadimos al map i canviamos el background a verde
        {
          this.map.set(params.node.id, 1);
        }
        else{
           // Si ya la habíamos modificado, sumamos 1 al numero de modificaciones en el map
          const modificacionsActuals = this.map.get(params.node.id);
          this.map.set(params.node.id, (modificacionsActuals + 1));
        }
        const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex); // Com hemos modificado la linia, la pintamos de verde
        params.colDef.cellStyle = {backgroundColor: '#E8F1DE'};
        this.gridApi.redrawRows({rowNodes: [row]});
        params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Volveremos a definir el background blanco para futuras modificaciones de la tabla (ej: filtro)
        this.comptadorCanvisAnterior++;

      }
    if (this.comptadorCanvis < this.comptadorCanvisAnterior){ // Entrará aquí si hemos hecho un undo
        // Como venimos de undo, sabemos que la cela ya estaba modificada
        const modificacionsActuals = this.map.get(params.node.id);

        if (modificacionsActuals === 1) {
          // Si solo tiene una modificación, quiere decir que la hemos dejado en su estado inicial, por lo que la pintaremos de blanco y la borraremos del map
          this.map.delete(params.node.id);
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);
          params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; 
          this.gridApi.redrawRows({rowNodes: [row]});
        }
        else // La cela aun no está en su estado inicial, así que le restamos una modificacion en el map
        {
          this.map.set(params.node.id, (modificacionsActuals - 1));
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex); // Como aun tiene modificaciones, el background verde
          params.colDef.cellStyle = {backgroundColor: '#E8F1DE'};
          this.gridApi.redrawRows({rowNodes: [row]});
          params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Volveremos a definir el background blanco para futuras modificaciones de la tabla (ej: filtro)
        }
        this.comptadorCanvisAnterior--; // Como venimos de undo, hay que decrementar el contador de canvios anterior
      }
    }
}
