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
  statusColumn = false;
  map: Map<number, number> = new Map<number, number>(); // Guardaremos el id de las celas modificadas i el nº de ediciones hechas sobre estas
  private params; //Parametros del grid en la ultima modificacion hecha (por si hacemos apply changes)
  rowData: any[];
  changeCounter: number; // Numero de ediciones hechas sobre las celas
  previousChangeCounter: number; //  Numero de ediciones que habia antes de hacer la ultima modificacion (changeCounter)
  redoCounter: number; // Numero de redo que podemos hacer
  modificationChange = false;
  gridOptions;
  @Input() frameworkComponents: any;
  @Input() columnDefs: any[];
  @Input() getAll: () => Observable<any>;
  @Input() discardChangesButton: boolean;
  @Input() undoButton: boolean;
  @Input() redoButton: boolean;
  @Input() applyChangesButton: boolean;
  @Input() deleteButton: boolean;
  @Input() newButton: boolean;
  @Input() globalSearch: boolean;



  @Output() remove: EventEmitter<any[]>;
  @Output() new: EventEmitter<number>;
  @Output() sendChanges: EventEmitter<any[]>;


  constructor() {

    this.remove = new EventEmitter();
    this.new = new EventEmitter();
    this.sendChanges = new EventEmitter();
    this.changeCounter = 0;
    this.previousChangeCounter = 0;
    this.redoCounter = 0;
    this.gridOptions = {
      defaultColDef: {
        sortable: true,
        flex: 1,
        filter: true,
        editable: true,
        cellStyle: {backgroundColor: '#FFFFFF'},
        sortable: true
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
        this.statusColumn = true;
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

    if(this.statusColumn)
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
    this.changeCounter = 0;
    this.previousChangeCounter = 0;
    this.redoCounter = 0;
    this.params.colDef.cellStyle =  {backgroundColor: '#FFFFFF'};
    this.gridApi.redrawRows();
  }



  deleteChanges(): void
  {
    for (let i = 0; i < this.changeCounter; i++)
    {
      this.gridApi.undoCellEditing();
    }
    this.map.clear();
    this.previousChangeCounter = 0;
    this.changeCounter = 0;
    this.redoCounter = 0;
    this.params.colDef.cellStyle =  {backgroundColor: '#FFFFFF'};
    this.gridApi.redrawRows();
  }


  onFilterModified(): void{
    this.deleteChanges();
  }


  undo(): void {
    this.gridApi.stopEditing(false);
    this.gridApi.undoCellEditing();
    this.changeCounter -= 1;
    this.redoCounter += 1;
  }

  redo(): void {
    this.gridApi.stopEditing(false);
    this.gridApi.redoCellEditing();
    this.changeCounter += 1;
    this.redoCounter -= 1;
  }


  onCellEditingStopped(e)
  {
      if (this.modificationChange)
      {
        this.changeCounter++;
        this.redoCounter = 0;
        this.onCellValueChanged(e);
        this.modificationChange = false;
      }
  }



  onCellValueChanged(params): void{
    this.params = params; // Guardaremos los parametros por si hay que hacer un apply changes

    if (this.changeCounter > this.previousChangeCounter)
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
            const currentChanges = this.map.get(params.node.id);
            this.map.set(params.node.id, (currentChanges + 1));
          }
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex); // Com ha estado modificada la linia, la pintamos de verde
          params.colDef.cellStyle = {backgroundColor: '#E8F1DE'};
          this.gridApi.redrawRows({rowNodes: [row]});
          params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Definiremos el cellStyle blanco para futuras modificaciones internas (ej: filtro)
          this.previousChangeCounter++;
        }

      }
    else if (this.changeCounter < this.previousChangeCounter){ // Entrará aquí si hemos hecho un undo
        
        const currentChanges = this.map.get(params.node.id);
        
        if (currentChanges === 1) {
          // Si solo tiene una modificacion, quiere decir que la cela está en su estado inicial, por lo que la pintamos de blanco
          this.map.delete(params.node.id);
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);
          params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Li posarem un altre cop el background blanc
          this.gridApi.redrawRows({rowNodes: [row]});
        }
        else if (currentChanges >1) // La cela aún no está en su estado inicial, por lo que segguirá verde
        {                                 // No podemos hacer else por si hacemos un undo de una cela sin cambios
          this.map.set(params.node.id, (currentChanges - 1));
          const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex); // Como aun tiene cambios, el background tiene que seguir verde
          params.colDef.cellStyle = {backgroundColor: '#E8F1DE'};
          this.gridApi.redrawRows({rowNodes: [row]});
          params.colDef.cellStyle = {backgroundColor: '#FFFFFF'}; // Definirem el cellStyle blanc per proximes celes
        }
        this.previousChangeCounter--;  // Com veniem d'undo, hem de decrementar el comptador de canvisAnterior
    }
    else{
      console.log(params);
      if(params.oldValue !== params.value && !(params.oldValue == null && params.value === '') )
      {
        this.modificationChange = true;
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
          this.previousChangeCounter++; // Como al hacer undo volverá a entrar a esta misma función, hay que enviarlo a su if correspondiente
          this.gridApi.undoCellEditing(); //Undo para deshacer el cambio sin modificaciones internamente
        }

      }

    }
  }
}
