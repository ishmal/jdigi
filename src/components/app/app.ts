import {Component} from 'angular2/core';

import {Tuner} from '../tuner/tuner';
import {Input} from '../input/input';
import {Output} from '../output/output';
import {Status} from '../status/status';

@Component({
    selector: 'jdigi-app',
    directives: [ Tuner, Input, Output, Status ],
    templateUrl: './components/app/app.html'
})
export class AppComponent {



}
