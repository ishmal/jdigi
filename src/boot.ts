import {bootstrap} from 'angular2/platform/browser'

import {AppComponent} from './components/app/app'
import {DigiService} from './services/digiservice';

bootstrap(AppComponent, [DigiService]);

