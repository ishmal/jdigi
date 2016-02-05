import {Component, ElementRef} from 'angular2/core';

import {DigiService} from '../../services/digiservice';
import {Digi, OutText} from '../../lib/digi';

@Component({
    selector: 'jdigi-output',
    template: '<textarea readonly class=\'console-area col-md-12\'>{{text}}</textarea>',
    styles: [
      `
      .console-area {
         overflow-y: scroll;
         height: 70px;
         resize: none;
         background-color: #aaeeaa;
      }
      `
    ]
})
export class OutputComponent extends OutText {

  _digi: Digi;
  _text: string;
  _elem: HTMLTextAreaElement;

  constructor(digiService: DigiService, elementRef: ElementRef) {
    super();
    this._digi = digiService.digi;
    this._text = '';
    this._digi.outText = this;
    this._elem = elementRef.nativeElement;
  }

  get text(): string {
    return this._text;
  }

  /**
   * @Override OutputText
   */
  clear():void {
    this._text = '';
  }

  /**
   * @Override OutputText
   */
  putText(str: string) {
    let area = this._elem;
    this._text += str;
    area.scrollTop = area.scrollHeight;
  }


}
