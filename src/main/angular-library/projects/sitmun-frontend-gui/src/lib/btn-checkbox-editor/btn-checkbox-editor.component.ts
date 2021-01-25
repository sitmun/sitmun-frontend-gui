import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'app-btn-checkbox-editor',
  templateUrl: './btn-checkbox-editor.component.html',
  styleUrls: ['./btn-checkbox-editor.component.css']
})
export class BtnCheckboxEditorComponent implements ICellEditorAngularComp, AfterViewInit  {

  private params: any;

  @ViewChild('container', { read: ViewContainerRef }) public container;
  public happy: boolean = false;

  // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
  ngAfterViewInit() {
    window.setTimeout(() => {
      this.container.element.nativeElement.focus();
    });
  }

  agInit(params: any): void {
    this.params = params;
    this.setHappy(params.value === 'Happy');
  }

  getValue(): any {
    return this.happy ? 'Happy' : 'Sad';
  }

  isPopup(): boolean {
    return true;
  }

  setHappy(happy: boolean): void {
    this.happy = happy;
  }

  toggleMood(): void {
    this.setHappy(!this.happy);
  }

  onClick(happy: boolean) {
    this.setHappy(happy);
    this.params.api.stopEditing();
  }

  onKeyDown(event): void {
    let key = event.which || event.keyCode;
    if (
      key == 37 || // left
      key == 39
    ) {
      // right
      this.toggleMood();
      event.stopPropagation();
    }
  }

}
