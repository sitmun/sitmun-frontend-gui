import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-btn-edit-rendered',
  templateUrl: './btn-edit-rendered.component.html',
  styleUrls: ['./btn-edit-rendered.component.scss']
})
export class BtnEditRenderedComponent implements ICellRendererAngularComp, OnDestroy {

  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return true;
  }

  btnClickedHandler($event) {
    this.params.clicked(this.params.value);
  }

  getParams(){
    return this.params;
  }

  ngOnDestroy() {
    // no need to remove the button click handler 
  }

}
