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
  canviAmbModificacions = false;
  gridOptions;
  @Input() frameworkComponents: any;
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
  @Output() new: EventEmitter<number>;
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
    this.gridOptions.api.deselectAll();
  }





  newData(): void
  {
    this.gridApi.stopEditing(false);
    this.new.emit(-1);
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
      if (this.canviAmbModificacions)
      {
        this.comptadorCanvis++;
        this.comptadorRedo = 0;
        this.onCellValueChanged(e);
        this.canviAmbModificacions = false;
      }
  }



  onCellValueChanged(params): void{
    this.params = params; // Guardaremos los parametros por si hay que hacer un apply changes

    if (this.comptadorCanvis > this.comptadorCanvisAnterior)
      // Esta condición será cierta si venimos de editar la cela o de hacer un redo
      {
        if (params.oldValue !== params.value && !(params.oldValue == null && params.value === ''))
        {
          if (! this.map.has(params.node.id)) // Si no habiamos editado la cela con anterioridad, la añadimos al map y la pintamos de verde
          {
            this.map.set(params.node.id, 1);
          }
          else{
             // Si ya habíamos modificado la cela, aumentamos el numero de cambios en esta
            const modificacionsActuals = this.map.get(params.node.id);
            this.map.set(params.node.id, (modificacionsActuals + 1));
          }
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex); // Com ha estado modificada la linia, la pintamos de verde
          params.colDef.cellStyle = {backgroundColor: '#E8F1DE'};
          this.gridApi.redrawRows({rowNodes: [row]});
          params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Definiremos el cellStyle blanco para futuras modificaciones internas (ej: filtro)
          this.comptadorCanvisAnterior++;
        }

      }
    else if (this.comptadorCanvis < this.comptadorCanvisAnterior){ // Entrará aquí si hemos hecho un undo
        
        const modificacionsActuals = this.map.get(params.node.id);
        
        if (modificacionsActuals === 1) {
          // Si solo tiene una modificacion, quiere decir que la cela está en su estado inicial, por lo que la pintamos de blanco
          this.map.delete(params.node.id);
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);
          params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Li posarem un altre cop el background blanc
          this.gridApi.redrawRows({rowNodes: [row]});
        }
        else if (modificacionsActuals >1) // La cela aún no está en su estado inicial, por lo que segguirá verde
        {                                 // No podemos hacer else por si hacemos un undo de una cela sin cambios
          this.map.set(params.node.id, (modificacionsActuals - 1));
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex); // Como aun tiene cambios, el background tiene que seguir verde
          params.colDef.cellStyle = {backgroundColor: '#E8F1DE'};
          this.gridApi.redrawRows({rowNodes: [row]});
          params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Definirem el cellStyle blanc per proximes celes
        }
        this.comptadorCanvisAnterior--;  // Com veniem d'undo, hem de decrementar el comptador de canvisAnterior
    }
    else{
      console.log(params);
      if(params.oldValue !== params.value && !(params.oldValue == null && params.value === '') )
      {
        this.canviAmbModificacions = true;
      }
      else{
        if ( this.map.has(params.node.id))
        {
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex); // Com encara te modificacions, ha de tenir el background verd
          params.colDef.cellStyle = {backgroundColor: '#E8F1DE'};
          this.gridApi.redrawRows({rowNodes: [row]});
          params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Definiremos el cellStyle blanco para futuras modificaciones internas (ej: filtro)

        }
        else {
          this.comptadorCanvisAnterior++; // Como al hacer undo volverá a entrar a esta misma función, hay que enviarlo a su if correspondiente
          this.gridApi.undoCellEditing(); //Undo para deshacer el cambio sin modificaciones internamente
        }

      }

    }
  }
}
