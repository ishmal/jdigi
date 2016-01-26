import {bootstrap}    from 'angular2/platform/browser'
import {Component, View} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {TAB_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import {Tuner} from '../tuner/tuner';
import {Input} from '../input/input';
import {Output} from '../output/output';
import {Status} from '../status/status';

@Component({
    selector: 'app',
    directives: [ Tuner, Input, Output, Status, TAB_DIRECTIVES ],
    templateUrl: './components/app/app.html'
})
export class AppComponent {
}

bootstrap(AppComponent);
