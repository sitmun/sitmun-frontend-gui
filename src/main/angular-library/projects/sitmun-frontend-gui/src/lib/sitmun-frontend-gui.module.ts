import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

//import * as ol from 'openlayers';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import { AngularHalModule } from '@sitmun/frontend-core';


import { ReactiveFormsModule } from '@angular/forms';
import localeCa from '@angular/common/locales/ca';
import localeEs from '@angular/common/locales/es';
import { SitmunFrontendCoreModule } from '@sitmun/frontend-core';
import { DataGridComponent } from './data-grid/data-grid.component';

import { AgGridModule } from '@ag-grid-community/angular';

import {MaterialModule} from './material-module';

import { BtnEditRenderedComponent } from './btn-edit-rendered/btn-edit-rendered.component';
import { BtnCheckboxRenderedComponent } from './btn-checkbox-rendered/btn-checkbox-rendered.component';
import { BtnCheckboxFilterComponent } from './btn-checkbox-filter/btn-checkbox-filter.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DialogGridComponent } from './dialog-grid/dialog-grid.component';
import { DialogFormComponent } from './dialog-form/dialog-form.component';
import { DialogMessageComponent } from './dialog-message/dialog-message.component';
import { DataTreeComponent } from './data-tree/data-tree.component';


registerLocaleData(localeCa, 'ca');
registerLocaleData(localeEs, 'es');

/** Load translation assets */
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}


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
    MaterialModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })

  ],
  declarations: [
    DataGridComponent,
    DataTreeComponent,
    BtnEditRenderedComponent,
    BtnCheckboxRenderedComponent,
    BtnCheckboxFilterComponent,
    DialogGridComponent,
    DialogFormComponent,
    DialogMessageComponent,
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
    DataTreeComponent,
    DialogGridComponent,
    DialogFormComponent,
    DialogMessageComponent,
    SitmunFrontendCoreModule
  ]
})
export class SitmunFrontendGuiModule {
}
