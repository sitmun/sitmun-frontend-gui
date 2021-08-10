import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-btn-checkbox-rendered',
  templateUrl: './btn-checkbox-rendered.component.html',
  styleUrls: ['./btn-checkbox-rendered.component.scss']
})
export class BtnCheckboxRenderedComponent implements ICellRendererAngularComp, OnDestroy {

  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    
    return true;
  }

  public invokeParentMethod() {
    this.params.context.componentParent.methodFromParent(
      `Row: ${this.params.node.rowIndex}, Col: ${this.params.colDef.headerName}`
    );
  }

  btnCheckedHandler(event) {
    if(this.params.colDef.editable){
      let checked = !event.target.firstElementChild.checked;
      let colId = this.params.column.colId;
      this.params.value=checked;
      this.params.api.undoRedoService.isFilling=true;
      this.params.node.setDataValue(colId, checked);
    }
    else{
      event.preventDefault();
    }

    
  }

  getParams(){
    return this.params;
  }

  ngOnDestroy() {
    // no need to remove the button click handler 
  }

}
