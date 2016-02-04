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
/* jslint node: true */

import {Digi} from '../digi';
import {Complex} from '../complex';
import {Nco, NcoCreate} from '../nco';
import {Constants} from '../constants';
import {Filter, Biquad} from '../filter';

export interface Option {
  name: string;
  value: any;
}

export interface Control {
  name: string;
  type: string;
  tooltip?: string;
  value: any;
  options?: Option[];
}

export interface Properties {
  name: string;
  tooltip: string;
  controls: Control[];
}


export class Mode {

  par: Digi;
  _frequency: number;
  _afcFilter: Filter;
  _loBin: number;
  _freqBin: number;
  _hiBin: number;
  _useAfc: boolean;
  _rate: number;
  _nco: Nco;
  _obuf: Float32Array;
  _optr: number;
  _ibuf: number[];
  _ilen: number;
  _iptr: number;
  /**
   * We must set this property once at construction, and always
   * return the same object in the getter, in order to avoid
   * this issue in Angukar2:
   * https:// github.com/angular/angular/issues/5950
   */
  _properties: Properties;



    constructor(par: Digi) {
        this.par = par;
        this._frequency = 1000;
        this._afcFilter = Biquad.lowPass(1.0, 100.0);
        this._loBin = 0;
        this._freqBin = 0;
        this._hiBin = 0;
        this.adjustAfc();
        this._useAfc = false;
        this._rate = 31.25;
        this._nco = NcoCreate(this._frequency, par.sampleRate);
        this._properties = {
          name: 'mode',
          tooltip: 'Base mode class.  Please override this method',
          controls: []
        };
    }

    /**
     * Override this
     */
    get properties(): Properties {
      return this._properties;
    }

    set frequency(freq: number) {
        this._frequency = freq;
        this._nco.setFrequency(freq);
        this.adjustAfc();
    }

    get frequency(): number {
        return this._frequency;
    }

    get bandwidth() {
        return 0;
    }

    adjustAfc() {
        let freq = this._frequency;
        let fs = this.par.sampleRate;
        let bw = this.bandwidth;
        let binWidth = fs * 0.5 / Constants.BINS;
        this._loBin = ((freq - bw * 0.707) / binWidth) | 0;
        this._freqBin = (freq / binWidth) | 0;
        this._hiBin = ((freq + bw * 0.707) / binWidth) | 0;
        // console.log('afc: ' + loBin + ',' + freqBin + ',' + hiBin);
    }

    get useAfc(): boolean {
      return this._useAfc;
    }

    set useAfc(v: boolean) {
      this._useAfc = v;
    }

    computeAfc(ps) {
        let sum = 0;
        let loBin = this._loBin;
        let freqBin = this._freqBin;
        let hiBin = this._hiBin;
        for (let i = loBin, j = hiBin; i < freqBin; i++, j--) {
            if (ps[j] > ps[i]) {
              sum++;
            } else if (ps[i] > ps[j]) {
              sum--;
            }
        }
        let filtered = this._afcFilter.update(sum);
        this._nco.setError(filtered);
    }

    status(msg) {
        this.par.status(this.properties.name + ' : ' + msg);
    }

    /**
     * There is a known bug in Typescript that will not allow
     * calling a super property setter.  The work around is to delegate
     * the setting to s parent class method, and override that.  This
     * works in ES6.
     */
    _setRate(v: number) {
      this._rate = v;
      this.adjustAfc();
      this.status('Fs: ' + this.par.sampleRate + ' rate: ' + v +
          ' sps: ' + this.samplesPerSymbol);
    }

    set rate(v: number) {
      this._setRate(v);
    }

    get rate(): number {
        return this._rate;
    }


    get samplesPerSymbol(): number {
        return this.par.sampleRate / this._rate;
    }


    // #######################
    // # R E C E I V E
    // #######################

    receiveFft(ps: number[]): void {
        if (this._useAfc) {
            this.computeAfc(ps);
        }
    }


    receiveData(v: number): void {
        let cs = this._nco.next();
        this.receive({r:v * cs.r, i:-v * cs.i});
    }


    /**
     * Overload this for each mode.
     */
    receive(v: Complex): void {
    }


    // #######################
    // # T R A N S M I T
    // #######################


    getTransmitData() {

        /*
        // output buffer empty?
        if (this.optr >= this.decimation) {
            // input buffer empty?
            if (this.iptr >= this.ilen) {
                this.ibuf = this.getBasebandData();
                this.ilen = this.ibuf.length;
                if (this.ilen === 0) {
                    this.ilen = 1;
                    this.ibuf = [0];
                }
                this.iptr = 0;
            }
            let v = this.ibuf[this.iptr++];
            this.interpolator.interpolatex(v, this.interpbuf);
            this.optr = 0;
        }
        let cx = this.obuf[this.optr];
        let upmixed = this.nco.mixNext(cx);
        return upmixed.abs();
        */
    }

}
