import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { ExternalConfigurationService } from './ExternalConfigurationService';
import { AngularHalModule } from '@sitmun/frontend-core';
import { HomeComponent } from './home/home.component';
import { SitmunFrontendCoreModule} from '@sitmun/frontend-core';
import { SitmunFrontendGuiModule } from 'sitmun-frontend-gui';
import { registerLocaleData } from '@angular/common';
import localeCa from '@angular/common/locales/ca';
import localeEs from '@angular/common/locales/es';
import {HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';



registerLocaleData(localeCa, 'ca');
registerLocaleData(localeEs, 'es');

/** Load translation assets */
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/** Demo app routes configuration*/
const appRoutes: Routes = [
    {
        path: '',
        component: HomeComponent
    }
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        SitmunFrontendCoreModule,
        SitmunFrontendGuiModule,
        AgGridModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDialogModule,
        AngularHalModule,
        RouterModule.forRoot(appRoutes)
    ],
    entryComponents: [

    ],
    providers: [
        { provide: 'ExternalConfigurationService', useClass: ExternalConfigurationService },
    ],
    bootstrap: [AppComponent]
})
/** Demo app module*/
export class AppModule { }
