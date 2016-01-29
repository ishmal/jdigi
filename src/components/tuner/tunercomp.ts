import {Component, Directive, ElementRef} from 'angular2/core';

import {DigiService} from '../../services/digiservice';
import {Digi} from '../../lib/digi';
import {Tuner, TunerImpl} from '../../lib/tuner';

@Directive({
    selector: '[jdigiTuner]'
})
export class TunerComponent {

  _digi: Digi;
  _tuner: Tuner;

  constructor(digiService: DigiService, elementRef: ElementRef) {
    this._digi = digiService.digi;
    let canvas = <HTMLCanvasElement>elementRef.nativeElement;
    this._tuner = new TunerImpl(this._digi, canvas);
    this._digi.tuner = this._tuner;
  }


}
