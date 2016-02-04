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

import {Mode} from './mode';
import {Digi} from '../digi';
import {Filter, Biquad, FIR} from '../filter';

const SSIZE = 200;

/**
 * This is a base class for all two-tone FSK modes.
 * @see http:// en.wikipedia.org/wiki/Asynchronous_serial_communication
 */
export class FskBase extends Mode {

    _shift: number;
    _inverted: boolean;
    _samplesSinceChange: number;
    _lastBit: boolean;
    _loHys: number;
    _hiHys: number;
    _bit: boolean;
    _lastr: number;
    _lasti: number;
    _bitsum: number;
    _scopeData: number[][];
    _scnt: number;
    _sx: number;

    _sf: Filter;
    _mf: Filter;
    _dataFilter: Filter;
    _symbollen: number;
    _halfsym: number;

    constructor(par: Digi) {
        super(par);
        this._shift = 170.0;
        this._inverted = false;
        this.rate = 45.0;
        this._samplesSinceChange = 0;
        this._lastBit = false;

        // receive
        this._loHys = -1.0;
        this._hiHys = 1.0;
        this._bit = false;
        this._lastr = 0;
        this._lasti = 0;
        this._bitsum = 0;


        // scope
        this._scopeData = new Array<number[]>(SSIZE);
        this._scnt = 0;
        this._sx = -1;
    }

    get shift() {
        return this._shift;
    }

    set shift(v) {
        this._shift = v;
        this.adjust();
    }

    get bandwidth() {
        return this._shift;
    }

    /**
     * @see Mode._setRate for an explanation of this
     */
    _setRate(v: number) {
        super._setRate(v);
        this.adjust();
    }

    get inverted(): boolean {
      return this._inverted;
    }

    set inverted(v:boolean) {
      this._inverted = v;
    }

    adjust() {
        this._sf = FIR.bandpass(13, -0.75 * this.shift, -0.25 * this.shift, this.par.sampleRate);
        this._mf = FIR.bandpass(13, 0.25 * this.shift, 0.75 * this.shift, this.par.sampleRate);
        // dataFilter = FIR.boxcar((self.samplesPerSymbol * 0.7)|0 );
        this._dataFilter = FIR.raisedcosine(13, 0.5, this.rate, this.par.sampleRate);
        // dataFilter = FIR.lowpass(13, this.rate * 0.5, this.sampleRate);
        // dataFilter = Biquad.lowPass(this.rate * 0.5, this.sampleRate);
        this._symbollen = Math.round(this.samplesPerSymbol);
        this._halfsym = this._symbollen >> 1;
    }

    /**
     * note: multiplying one complex sample of an
     * FM signal with the conjugate of the previous
     * value gives the instantaneous frequency change of
     * the signal.  This is called a polar discrminator.
     */
    receive(isample) {
        let lastr = this._lastr;
        let lasti = this._lasti;

        let space = this._sf.updatex(isample);
        let mark = this._mf.updatex(isample);
        let r = space.r + mark.r;
        let i = space.i + mark.i;
        let x = r * lastr - i * lasti;
        let y = r * lasti + i * lastr;
        this._lastr = r; // save the conjugate
        this._lasti = -i;
        let angle = Math.atan2(y, x);  // arg
        let comp = (angle > 0) ? -10.0 : 10.0;
        let sig = this._dataFilter.update(comp);
        // console.log('sig:' + sig + '  comp:' + comp)

        this.scopeOut(sig);

        let bit = this._bit;

        // trace('sig:' + sig)
        if (sig > this._hiHys) {
            bit = false;
        } else if (sig < this._loHys) {
            bit = true;
        }

        bit = bit !== this._inverted; // user-settable

        this.processBit(bit);
        this._bit = bit;
    }


    processBit(bit: boolean, parms?: any) {
    }


    /**
     * Used for modes without start/stop. Test if the current bit is the middle
     * of where a symbol is expected to be.
     */
    isMiddleBit(bit) {
        this._samplesSinceChange = (bit === this._lastBit) ? this._samplesSinceChange + 1 : 0;
        this._lastBit = bit;
        let middleBit = (this._samplesSinceChange % this._symbollen === this._halfsym);
        return middleBit;
    }


    scopeOut(v) {
        let sign = (v > 0) ? 1 : -1;
        let scalar = Math.log(Math.abs(v) + 1) * 0.25;
        this._scopeData[this._scnt++] = [this._sx, sign * scalar];
        this._sx += 0.01;
        if (this._scnt >= SSIZE) {
            this._scnt = 0;
            this._sx = -1;
            this.par.showScope(this._scopeData);
            this._scopeData = new Array(SSIZE);
        }
    }

}//  FskBase
