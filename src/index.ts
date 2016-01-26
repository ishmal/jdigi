import {bootstrap}    from 'angular2/platform/browser'
import {Component, View} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {Alert, Rating} from 'ng2-bootstrap/ng2-bootstrap';

@Component({
  selector: 'app'
})
@View({
  template: `
    <div></div>
    <alert type="info">Welcome to Angular2 Bootstrap starter pack!</alert>
    This is a webpack sample:
    <rating [(ngModel)]="rate" [max]="max" [readonly]="isReadonly" [titles]="['one','two','three']" ></rating>
  `,
  directives: [
    Alert,
    Rating,
    CORE_DIRECTIVES,
    FORM_DIRECTIVES
  ]
})
export class Home {
}

bootstrap(Home);
