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
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Constants} from "./constants";

const BINS = Constants.BINS;

function trace(msg) {
    if (typeof console !== "undefined")
        console.log("Tuner: " + msg);
}

function error(msg) {
    if (typeof console !== "undefined")
        console.log("Tuner error : " + msg);
}

class Tuner {

  set frequency(freq) {

  }

  get frequency() {

  }

  showScope(data) {

  }

  update(data) {

  }

}


/**
 * Provides a Waterfall display and tuning interactivity
 * @param par the parent Digi of this waterfall
 * @canvas the canvas to use for drawing
 */
class TunerImpl extends Tuner {

    constructor(par, canvas) {
      window.requestAnimationFrame =
          window.requestAnimationFrame ||
          window.msRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame;

      this._par = par;
      this._canvas = canvas;

      this._MAX_FREQ = par.sampleRate * 0.5;

      this._dragging = false;
      this._frequency = 1000;
      this._indices = null;
      this._width= 100;
      this._height = 100;
      this._ctx = null;
      this._imgData = null;
      this._imglen = null;
      this._buf8 = null;
      this._rowsize = null;
      this._lastRow = null;
      this._scopeData = [];

      this.resize();

      canvas.setAttribute("tabindex", "1");

      this._palette = this.makePalette();

      this.setupEvents(canvas);
  }

    //note that this is different from the public method
    set frequency(freq) {
        this._frequency = freq;
        this._par.frequency = freq;
    }

    get frequency() {
      return this._frequency;
    }

    createIndices(targetsize, sourcesize) {
        let xs = new Array(targetsize);
        let ratio = sourcesize / targetsize;
        for (let i = 0; i < targetsize; i++) {
            xs[i] = Math.floor(i * ratio);
        }
        return xs;
    }


    resize() {
        let canvas = this._canvas;
        let width = canvas.width;
        let height = canvas.height;
        let indices = this.createIndices(width, BINS);
        let ctx = canvas.getContext('2d');
        let imgData = ctx.createImageData(width, height);
        let imglen = imgData.data.length;
        let buf8 = new Uint8ClampedArray(imglen);
        for (let i = 0; i < imglen;) {
            buf8[i++] = 0;
            buf8[i++] = 0;
            buf8[i++] = 0;
            buf8[i++] = 255;
        }
        imgData.data.set(buf8);
        ctx.putImageData(imgData, 0, 0);
        let rowsize = imglen / height;
        let lastRow = imglen - rowsize;

        this._width = width;
        this._height = height;
        this._indices = indices;
        this._ctx = ctx;
        this._imgData = imgData;
        this._imglen = imglen;
        this._buf8 = buf8;
        this._rowsize = rowsize;
        this._lastRow = lastRow;
    }

    //####################################################################
    //#   MOUSE and KEY EVENTS
    //####################################################################

    setupEvents(canvas) {
      function mouseFreq(event) {
          let pt = getMousePos(canvas, event);
          let freq = MAX_FREQ * pt.x / width;
          frequency = freq;
      }

      function getMousePos(canvas, evt) {
          let rect = canvas.getBoundingClientRect();
          return {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
      }

      canvas.onclick = function (event) {
          mouseFreq(event);
      };
      canvas.onmousedown = function (event) {
          dragging = true;
      };
      canvas.onmouseup = function (event) {
          dragging = false;
      };
      canvas.onmousemove = (event) => {
          if (this._dragging) mouseFreq(event);
      };
      //fine tuning, + or - one hertz
      canvas.onkeydown = (evt) => {
          let key = evt.which;
          if (key === 37 || key === 40) {
              this.frequency += 1;
          } else if (key === 38 || key === 39) {
              this.frequency -= 1;
          }
          evt.preventDefault();
          return false;
      };

      canvas.onmousewheel = (evt) => {
          let delta = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1;
          this.frequency += (delta * 1); //or other increments here
          evt.preventDefault();
          return false;
      };

      canvas.addEventListener("DOMMouseScroll", handleWheel, false);
    }

    //####################################################################
    //#  R E N D E R I N G
    //####################################################################

    /**
     * Make a palette. tweak this often
     * TODO:  consider using an HSV heat map
     */
    makePalette() {
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

        //ctx.fillStyle = 'red';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
        //ctx.lineWidth = 1;
        ctx.beginPath();
        let base = height >> 1; //move this around
        ctx.moveTo(0, base);
        let log = Math.log;
        for (let x = 0; x < width; x++) {
            let v = log(1.0 + data[indices[x]]) * 12.0;
            let y = base - v;
            //trace("x:" + x + " y:" + y);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(width - 1, base);
        for (x = width - 1; x >= 0; x--) {
            let v = log(1.0 + data[indices[x]]) * 12.0;
            let y = base + v;
            //trace("x:" + x + " y:" + y);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(0, base);
        ctx.closePath();
        //var bbox = ctx.getBBox();
        ctx.fill();
    }


    drawWaterfall(data) {
        let buf8 = this._buf8;
        let rowsize = this._rowsize;
        let imglen = this._imglen;
        let imgData = this._imgData;
        let width = this._width;

        buf8.set(buf8.subarray(rowsize, imglen)); //<-cool, if this works
        //trace("data:" + data[50]);

        let idx = this._lastRow;
        for (let x = 0; x < width; x++) {
            let v = data[indices[x]];
            let pix = palette[v & 255];
            //if (x==50)trace("p:" + p + "  pix:" + pix.toString(16));
            buf8[idx++] = pix[0];
            buf8[idx++] = pix[1];
            buf8[idx++] = pix[2];
            buf8[idx++] = pix[3];
        }
        imgData.data.set(buf8);
        ctx.putImageData(imgData, 0, 0);
    }

    drawWaterfall2(data) {
        let width = this.width;
        let lastRow = this.lastRow;
        let palette = this._palette;
        let buf8 = this._buf8;
        let rowsize = this._rowsize;
        let imgData = this._imgData;

        buf8.set(buf8.subarray(rowsize, imglen)); //<-cool, if this works
        let idx = lastRow;
        let abs = Math.abs;
        let log = Math.log;
        for (let x = 0; x < width; x++) {
            let v = abs(data[indices[x]]);
            //if (x==50) trace("v:" + v);
            let p = log(1.0 + v) * 30;
            //if (x==50)trace("x:" + x + " p:" + p);
            let pix = palette[p & 255];
            //if (x==50)trace("p:" + p + "  pix:" + pix.toString(16));
            buf8[idx++] = pix[0];
            buf8[idx++] = pix[1];
            buf8[idx++] = pix[2];
            buf8[idx++] = pix[3];
        }
        imgData.data.set(buf8);
        ctx.putImageData(imgData, 0, 0);
    }


    drawTuner() {
        let MAX_FREQ = this.MAX_FREQ;
        let width = this.width;
        let height = this.height;
        let frequency = this.frequency;
        let ctx = this._ctx;

        let pixPerHz = 1 / MAX_FREQ * width;

        let x = frequency * pixPerHz;
        let bw = par.bandwidth;
        let bww = bw * pixPerHz;
        let bwlo = (frequency - bw * 0.5) * pixPerHz;

        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(bwlo, 0, bww, height);
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        let top = height - 15;

        for (let hz = 0; hz < MAX_FREQ; hz += 100) {
            if ((hz % 1000) === 0) {
                ctx.strokeStyle = "red";
                ctx.beginPath();
                x = hz * pixPerHz;
                ctx.moveTo(x, top);
                ctx.lineTo(x, height);
                ctx.stroke();
            } else {
                ctx.strokeStyle = "white";
                ctx.beginPath();
                x = hz * pixPerHz;
                ctx.moveTo(x, top + 10);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }

        ctx.fillStyle = "gray";
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
        if (len < 1)
            return;
        let ctx = this._ctx;
        let boxW = 100;
        let boxH = 100;
        let boxX = width - boxW;
        let boxY = 0;
        let centerX = boxX + (boxW >> 1);
        let centerY = boxY + (boxH >> 1);

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "white";
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

        ctx.strokeStyle = "yellow";
        ctx.beginPath();
        var pt = _scopeData[0];
        var x = centerX + pt[0] * 50.0;
        var y = centerY + pt[1] * 50.0;
        ctx.moveTo(x, y);
        for (var i = 1; i < len; i++) {
            pt = _scopeData[i];
            x = centerX + pt[0] * 50.0;
            y = centerY + pt[1] * 50.0;
            //console.log("pt:" + x + ":" + y);
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        //all done
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

} //Tuner

export {
  Tuner,
  TunerImpl
};
