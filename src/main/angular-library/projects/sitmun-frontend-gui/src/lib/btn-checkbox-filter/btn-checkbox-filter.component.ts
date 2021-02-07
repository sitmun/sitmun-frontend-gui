import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {
  IAfterGuiAttachedParams,
  IDoesFilterPassParams,
  IFilterParams,
  RowNode,
  IFloatingFilter,
  NumberFilter,
  NumberFilterModel,
  IFloatingFilterParams,
} from '@ag-grid-community/all-modules';
import { AgFrameworkComponent } from '@ag-grid-community/angular';
import { IFilterAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'app-btn-checkbox-filter',
  templateUrl: './btn-checkbox-filter.component.html',
  styleUrls: ['./btn-checkbox-filter.component.scss'],
  host: {'class': 'hostClass'}
})
export class BtnCheckboxFilterComponent implements IFloatingFilter, AgFrameworkComponent<IFloatingFilterParams>   {
  private params: IFloatingFilterParams;
  private valueGetter: (rowNode: RowNode) => any;
  public text: string = '';
  public currentValue: number;
  @ViewChild('input', { read: ViewContainerRef }) public input;

  agInit(params: IFloatingFilterParams): void {
    this.params = params;
    this.valueGetter = params.filterParams.valueGetter;
    this.params.suppressFilterButton=true;
  }

  isFilterActive(): boolean {
    return this.text != null && this.text !== '';
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    return this.text
      .toLowerCase()
      .split(' ')
      .every(
        (filterWord) =>
          this.valueGetter(params.node)
            .toString()
            .toLowerCase()
            .indexOf(filterWord) >= 0
      );
  }

  getModel(): any {
    return { value: this.text };
  }

  setModel(model: any): void {
    this.text = model ? model.value : '';
  }


 onChange(newValue): void {
    this.params.parentFilterInstance(function (instance) {
      (<NumberFilter>instance).onFloatingFilterChanged(
        'contains',
        newValue
      );
    });
  }

  onParentModelChanged(parentModel: any): void {
    if (!parentModel) {
      this.currentValue = 0;
    } else {
      // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
      // so just read off the value and use that
      this.currentValue = parentModel.filter;
    }
  }
}
