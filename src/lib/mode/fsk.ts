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
/* jslint node: true */

import {Mode} from "./mode";
import {Biquad,FIR} from "../filter";

const SSIZE = 200;

/**
 * This is a base class for all two-tone FSK modes.
 * @see http://en.wikipedia.org/wiki/Asynchronous_serial_communication
 */
class FskBase extends Mode {


    constructor(par, props, sampleRateHint) {
        super(par, props, sampleRateHint);
        this._shift = 170.0;
        this.inverted = false;
        this.rate = 45.0;
        this.samplesSinceChange = 0;
        this.lastbit = false;

        //receive
        this.loHys = -1.0;
        this.hiHys = 1.0;
        this.bit = false;
        this.lastr = 0;
        this.lasti = 0;
        this.bitsum = 0;


        //scope
        this.scopedata = new Array(this.SSIZE);
        this.scnt = 0;
        this.sx = -1;
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

    set rate(v) {
        super.rate = v;
        this.adjust();
    }

    get rate() {
        return super.rate;
    }

    adjust() {
        this.sf = FIR.bandpass(13, -0.75 * this.shift, -0.25 * this.shift, this.sampleRate);
        this.mf = FIR.bandpass(13, 0.25 * this.shift, 0.75 * this.shift, this.sampleRate);
        //dataFilter = FIR.boxcar((self.samplesPerSymbol * 0.7)|0 );
        this.dataFilter = FIR.raisedcosine(13, 0.5, this.rate, this.sampleRate);
        //dataFilter = FIR.lowpass(13, this.rate * 0.5, this.sampleRate);
        //dataFilter = Biquad.lowPass(this.rate * 0.5, this.sampleRate);
        this.symbollen = Math.round(this.samplesPerSymbol);
        this.halfsym = this.symbollen >> 1;
    }

    /**
     * note: multiplying one complex sample of an
     * FM signal with the conjugate of the previous
     * value gives the instantaneous frequency change of
     * the signal.  This is called a polar discrminator.
     */
    receive(isample) {
        let lastr = this.lastr;
        let lasti = this.lasti;

        let space = this.sf.updatex(isample);
        let mark = this.mf.updatex(isample);
        let r = space.r + mark.r;
        let i = space.i + mark.i;
        let x = r * lastr - i * lasti;
        let y = r * lasti + i * lastr;
        this.lastr = r; //save the conjugate
        this.lasti = -i;
        let angle = Math.atan2(y, x);  //arg
        let comp = (angle > 0) ? -10.0 : 10.0;
        let sig = this.dataFilter.update(comp);
        //console.log("sig:" + sig + "  comp:" + comp)

        this.scopeOut(sig);

        let bit = this.bit;

        //trace("sig:" + sig)
        if (sig > this.hiHys) {
            bit = false;
        } else if (sig < loHys) {
            bit = true;
        }

        bit = bit ^ this.inverted; //user-settable

        this.processBit(bit);
        this.bit = bit;
    }


    processBit(bit, parms) {
    }


    /**
     * Used for modes without start/stop. Test if the current bit is the middle
     * of where a symbol is expected to be.
     */
    isMiddleBit(bit) {
        this.samplesSinceChange = (bit === this.lastbit) ? this.samplesSinceChange + 1 : 0;
        this.lastbit = bit;
        let middleBit = (this.samplesSinceChange % this.symbollen === this.halfsym);
        return middleBit;
    }


    scopeOut(v) {
        let sign = (v > 0) ? 1 : -1;
        let scalar = Math.log(Math.abs(v) + 1) * 0.25;
        this.scopedata[this.scnt++] = [this.sx, sign * scalar];
        this.sx += 0.01;
        if (this.scnt >= this.SSIZE) {
            this.scnt = 0;
            this.sx = -1;
            this.par.showScope(this.scopedata);
            this.scopedata = new Array(this.SSIZE);
        }
    }

}// FskBase

export {FskBase};

