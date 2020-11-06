import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {HttpClientModule, HttpClient, HTTP_INTERCEPTORS} from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

//import * as ol from 'openlayers';
import {TranslateModule, TranslateLoader,TranslateService} from '@ngx-translate/core';


import { AngularHalModule } from '@sitmun/frontend-core';


import { ReactiveFormsModule } from '@angular/forms';

import {SitmunFrontendCoreModule} from '@sitmun/frontend-core';
import { DataGridComponent } from './data-grid/data-grid.component';
import { AgGridModule } from '@ag-grid-community/angular';




/** SITMUN plugin core module */
@NgModule({
  imports: [
    RouterModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    NoopAnimationsModule,
    AngularHalModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AgGridModule.withComponents([]),
    SitmunFrontendCoreModule,
 
  ],
  declarations: [
    DataGridComponent
  ],
  entryComponents: [
  ],
  providers: [
  ],
  exports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    NoopAnimationsModule,
    AngularHalModule,
    TranslateModule,
    ReactiveFormsModule,
    DataGridComponent,
    SitmunFrontendCoreModule
  ]
})
export class SitmunFrontendGuiModule {
}
