/**
 * Jdigi
 *
 * Copyright 2015, Bob Jamison
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http:// www.gnu.org/licenses/>.
 */

import {Constants} from './constants';
import {Digi} from './digi';

const BINS = Constants.BINS;

function trace(msg) {
    if (typeof console !== 'undefined') {
        console.log('Tuner: ' + msg);
    }
}

function error(msg) {
    if (typeof console !== 'undefined') {
        console.log('Tuner error : ' + msg);
    }
}

export interface Tuner {

  frequency: number;

  showScope(data: number): void;

  update(data: number): void;

}

export class TunerDummy implements Tuner {
  constructor() {

  }

  get frequency(): number { return 0; }

  showScope(data:number):void {}

  update(data: number): void {}
}


/**
 * Provides a Waterfall display and tuning interactivity
 * @param par the parent Digi of this waterfall
 * @canvas the canvas to use for drawing
 */
export class TunerImpl implements Tuner {

  _par:  Digi;
  _canvas: HTMLCanvasElement;
  _MAX_FREQ: number;
  _dragging: boolean;
  _frequency: number;
  _indices: number[];
  _width: number;
  _height: number;
  _ctx: CanvasRenderingContext2D;
  _imgData: ImageData;
  _imglen: number;
  _buf8: Uint8ClampedArray;
  _rowsize: number;
  _lastRow: number;
  _scopeData: number[];
  _palette: number[];

    constructor(par: Digi, canvas: HTMLCanvasElement) {

      window.requestAnimationFrame = window.requestAnimationFrame
          || window.msRequestAnimationFrame;
          //  || window.mozRequestAnimationFrame
          //  || window.webkitRequestAnimationFrame;

      this._par = par;
      this._canvas = canvas;
      this._MAX_FREQ = par.sampleRate * 0.5;
      this._dragging = false;
      this._frequency = 1000;
      this._indices = null;
      this._width = 100;
      this._height = 100;
      this._ctx = null;
      this._imgData = null;
      this._imglen = null;
      this._buf8 = null;
      this._rowsize = null;
      this._lastRow = null;
      this._scopeData = [];

      this.resize();

      canvas.setAttribute('tabindex', '1');

      this._palette = this.makePalette();

      this.setupEvents(canvas);
  }

    // note that this is different from the public method
    set frequency(freq: number) {
        this._frequency = freq;
        this._par.frequency = freq;
    }

    get frequency(): number {
      return this._frequency;
    }

    createIndices(targetsize: number, sourcesize: number): number[] {
        let xs = new Array(targetsize);
        let ratio = sourcesize / targetsize;
        for (let i = 0; i < targetsize; i++) {
            xs[i] = Math.floor(i * ratio);
        }
        return xs;
    }


    resize(): void {
        let canvas = this._canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this._width = canvas.width;
        this._height = canvas.height;
        // this._par.status('resize w:' + this._width + '  h:' + this._height);
        this._indices = this.createIndices(this._width, BINS);
        this._ctx = canvas.getContext('2d');
        let imgData = this._imgData = this._ctx.createImageData(this._width, this._height);
        let imglen = this._imglen = imgData.data.length;
        let buf8 = this._buf8 = imgData.data;
        for (let i = 0; i < imglen; ) {
            buf8[i++] = 0;
            buf8[i++] = 0;
            buf8[i++] = 0;
            buf8[i++] = 255;
        }
        // imgData.data.set(buf8);
        this._ctx.putImageData(imgData, 0, 0);
        this._rowsize = imglen / this._height;
        this._lastRow = imglen - this._rowsize;
    }

    // ####################################################################
    // #   MOUSE and KEY EVENTS
    // ####################################################################

    setupEvents(canvas) {

      // hate to use 'self' here, but it's a safe way
      let self = this;

      let _checkResize = true;
      function checkResize() {
          if (_checkResize) {
             self.resize();
             _checkResize = false;
             setTimeout(function() {
                  _checkResize = true;
                  self.resize();
                }, 500);
            }
      }

      window.addEventListener('resize', checkResize);

      function mouseFreq(event) {
          let pt = getMousePos(canvas, event);
          let freq = self._MAX_FREQ * pt.x / self._width;
          self.frequency = freq;
      }

      function getMousePos(cnv, evt) {
          let rect = cnv.getBoundingClientRect();
          return {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
      }

      canvas.onclick = (event) => {
          mouseFreq(event);
      };
      canvas.onmousedown = (event) => {
          self._dragging = true;
      };
      canvas.onmouseup = (event) => {
          self._dragging = false;
      };
      canvas.onmousemove = (event) => {
          if (self._dragging) {
             mouseFreq(event);
          }
      };
      // fine tuning, + or - one hertz
      canvas.onkeydown = (evt) => {
          let key = evt.which;
          if (key === 37 || key === 40) {
              self.frequency += 1;
          } else if (key === 38 || key === 39) {
              self.frequency -= 1;
          }
          evt.preventDefault();
          return false;
      };

      function handleWheel(evt) {
          let delta = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1;
          self.frequency += (delta * 1); // or other increments here
          evt.preventDefault();
          return false;
      }

      canvas.onmousewheel = handleWheel;
      canvas.addEventListener('DOMMouseScroll', handleWheel, false);
    }

    // ####################################################################
    // #  R E N D E R I N G
    // ####################################################################

    /**
     * Make a palette. tweak this often
     * TODO:  consider using an HSV heat map
     */
    makePalette(): number[] {
        let xs = new Array(256);
        for (let i = 0; i < 256; i++) {
            let r = (i < 170) ? 0 : (i - 170) * 3;
            let g = (i < 85) ? 0 : (i < 170) ? (i - 85) * 3 : 255;
            let b = (i < 85) ? i * 3 : 255;
            let col = [r, g, b, 255];
            xs[i] = col;
        }
        return xs;
    }



    drawSpectrum(data) {
        let width = this._width;
        let height = this._height;

        let ctx = this._ctx;
        let indices = this._indices;

        // ctx.fillStyle = 'red';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
        // ctx.lineWidth = 1;
        ctx.beginPath();
        let base = height >> 1; // move this around
        ctx.moveTo(0, base);
        let log = Math.log;
        for (let x = 0; x < width; x++) {
            let v = log(1.0 + data[indices[x]]) * 12.0;
            let y = base - v;
            // trace('x:' + x + ' y:' + y);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(width - 1, base);
        for (let x = width - 1; x >= 0; x--) {
            let v = log(1.0 + data[indices[x]]) * 12.0;
            let y = base + v;
            // trace('x:' + x + ' y:' + y);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(0, base);
        ctx.closePath();
        // let bbox = ctx.getBBox();
        ctx.fill();
    }


    drawWaterfall(data) {
        let buf8 = this._buf8;
        let rowsize = this._rowsize;
        let imglen = this._imglen;
        let imgData = this._imgData;
        let width = this._width;
        let indices = this._indices;
        let palette = this._palette;

        buf8.set(buf8.subarray(rowsize, imglen)); // <-cool, if this works
        // trace('data:' + data[50]);

        let idx = this._lastRow;
        for (let x = 0; x < width; x++) {
            let v = data[indices[x]];
            let pix = palette[v & 255];
            // if (x==50)trace('p:' + p + '  pix:' + pix.toString(16));
            buf8[idx++] = pix[0];
            buf8[idx++] = pix[1];
            buf8[idx++] = pix[2];
            buf8[idx++] = pix[3];
        }
        imgData.data.set(buf8);
        this._ctx.putImageData(imgData, 0, 0);
    }

    drawWaterfall2(data) {
        let width = this._width;
        let lastRow = this._lastRow;
        let palette = this._palette;
        let buf8 = this._buf8;
        let rowsize = this._rowsize;
        let imgData = this._imgData;
        let indices = this._indices;
        let imglen = this._imglen;
        let ctx = this._ctx;

        buf8.set(buf8.subarray(rowsize, imglen)); // <-cool, if this works
        let idx = lastRow;
        let abs = Math.abs;
        let log = Math.log;
        for (let x = 0; x < width; x++) {
            let v = abs(data[indices[x]]);
            // if (x==50) trace('v:' + v);
            let p = log(1.0 + v) * 30;
            // if (x==50)trace('x:' + x + ' p:' + p);
            let pix = palette[p & 255];
            // if (x==50)trace('p:' + p + '  pix:' + pix.toString(16));
            buf8[idx++] = pix[0];
            buf8[idx++] = pix[1];
            buf8[idx++] = pix[2];
            buf8[idx++] = pix[3];
        }
        imgData.data.set(buf8);
        ctx.putImageData(imgData, 0, 0);
    }


    drawTuner() {
        let MAX_FREQ = this._MAX_FREQ;
        let width = this._width;
        let height = this._height;
        let frequency = this._frequency;
        let ctx = this._ctx;

        let pixPerHz = 1 / MAX_FREQ * width;

        let x = frequency * pixPerHz;
        let bw = this._par.bandwidth;
        let bww = bw * pixPerHz;
        let bwlo = (frequency - bw * 0.5) * pixPerHz;

        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(bwlo, 0, bww, height);
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        let top = height - 15;

        for (let hz = 0; hz < MAX_FREQ; hz += 100) {
            if ((hz % 1000) === 0) {
                ctx.strokeStyle = 'red';
                ctx.beginPath();
                x = hz * pixPerHz;
                ctx.moveTo(x, top);
                ctx.lineTo(x, height);
                ctx.stroke();
            } else {
                ctx.strokeStyle = 'white';
                ctx.beginPath();
                x = hz * pixPerHz;
                ctx.moveTo(x, top + 10);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }

        ctx.fillStyle = 'gray';
        for (let hz = 0; hz < MAX_FREQ; hz += 500) {
            x = hz * pixPerHz - 10;
            ctx.fillText(hz.toString(), x, top + 14);
        }
    }

    /**
     * Plot mode-specific decoder graph data.
     * This method expects the data to be an array of [x,y] coordinates,
     * with x and y ranging from -1.0 to 1.0.  It is up to the mode generating
     * this array to determine how to draw it, and what it means.
     */
    drawScope() {
        let len = this._scopeData.length;
        if (len < 1) {
            return;
        }
        let ctx = this._ctx;
        let boxW = 100;
        let boxH = 100;
        let boxX = this._width - boxW;
        let boxY = 0;
        let centerX = boxX + (boxW >> 1);
        let centerY = boxY + (boxH >> 1);

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.rect(boxX, boxY, boxW, boxH);
        ctx.stroke();
        ctx.clip();

        ctx.beginPath();
        ctx.moveTo(centerX, boxY);
        ctx.lineTo(centerX, boxY + boxH);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(boxX, centerY);
        ctx.lineTo(boxX + boxW, centerY);
        ctx.stroke();

        ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        let pt = this._scopeData[0];
        let x = centerX + pt[0] * 50.0;
        let y = centerY + pt[1] * 50.0;
        ctx.moveTo(x, y);
        for (let i = 1; i < len; i++) {
            pt = this._scopeData[i];
            x = centerX + pt[0] * 50.0;
            y = centerY + pt[1] * 50.0;
            // console.log('pt:' + x + ':' + y);
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        // all done
        ctx.restore();
    }

    updateData(data) {
        this.drawWaterfall2(data);
        this.drawSpectrum(data);
        this.drawTuner();
        this.drawScope();
    }

    showScope(data) {
        this._scopeData = data;
    }

    update(data) {
        requestAnimationFrame(() => {
            this.updateData(data);
        });
    }

} // Tuner
