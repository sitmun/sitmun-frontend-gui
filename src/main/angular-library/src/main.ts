import { enableProdMode , TRANSLATIONS, TRANSLATIONS_FORMAT} from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule} from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
/** require const*/
declare const require;
/** we use the webpack raw-loader to return the content as a string */
//const translations = require(`raw-loader!./locale/messages.ca.xlf`);

platformBrowserDynamic().bootstrapModule(AppModule, {
  providers: [
    //{provide: TRANSLATIONS, useValue: translations},
    {provide: TRANSLATIONS_FORMAT, useValue: 'xlf'}
  ]
})
  .catch(err => console.log(err));
