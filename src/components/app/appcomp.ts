import {bootstrap} from 'angular2/platform/browser'
import {Component, View} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/common';
import {BUTTON_DIRECTIVES, TAB_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import {Digi} from '../../lib/digi';
import {TunerComponent} from '../tuner/tunercomp';
import {InputComponent} from '../input/inputcomp';
import {OutputComponent} from '../output/outputcomp';
import {StatusComponent} from '../status/statuscomp';
import {DigiService} from '../../services/digiservice';
import {Mode} from '../../lib/mode/mode';

@Component({
    selector: 'app',
    directives: [ TunerComponent, InputComponent, OutputComponent,
       StatusComponent, CORE_DIRECTIVES, BUTTON_DIRECTIVES, TAB_DIRECTIVES,
       NgSwitch, NgSwitchWhen, NgSwitchDefault ],
    templateUrl: './components/app/app.html',
    styleUrls: ['./components/app/app.css']
})
export class AppComponent {

  _digi: Digi;

  constructor(digiService: DigiService) {
    this._digi = digiService.digi;
    this._digi.start();
  }

  get modes(): Mode[] {
    return this._digi.modes;
  }

  get modeNames(): string[] {
    return this._digi.modes.map(_ => _.properties.name);
  }


}

bootstrap(AppComponent, [DigiService]);
