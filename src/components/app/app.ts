import {bootstrap}    from 'angular2/platform/browser'
import {Component, View} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {TAB_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import {Digi} from '../../lib/digi';
import {Tuner} from '../tuner/tuner';
import {Input} from '../input/input';
import {Output} from '../output/output';
import {Status} from '../status/status';
import {DigiService} from '../../services/digiservice';
import {Mode} from '../../lib/mode/mode';

@Component({
    selector: 'app',
    directives: [ Tuner, Input, Output, Status,
       CORE_DIRECTIVES, TAB_DIRECTIVES ],
    templateUrl: './components/app/app.html'
})
export class AppComponent {

  _digi: Digi;
  public modes: Mode[];

  constructor(digiService: DigiService) {
    this._digi = digiService.digi;
    this.modes = this._digi.modes;
  }

  getModes(): Mode[] {
    return this._digi.modes;
  }

  get modeNames(): string[] {
    return this._digi.modes.map(_ => _.properties.name);
  }


}

bootstrap(AppComponent, [DigiService]);
