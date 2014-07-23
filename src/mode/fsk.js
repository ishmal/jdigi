/**
 * Jdigi
 *
 * Copyright 2014, Bob Jamison
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

import {Mode} from "./mode";
import {Biquad,FIR} from "../filter";


/**
 * This is a base class for all two-tone FSK modes.
 * @see http://en.wikipedia.org/wiki/Asynchronous_serial_communication
 */
function FskBase(par, props, sampleRateHint) {
    Mode.call(this, par, props, sampleRateHint);
    var self = this;

    var shiftval = 170.0;

    this.getShift = function() {
        return shiftval;
    };

    this.setShift = function(v) {
        shiftval = v;
        adjust();
    };
    
    var inverted = false;
    this.setInverted = function(v) {
        inverted = v;
    };
    
    this.getInverted = function() {
        return inverted;
    };

    this.getBandwidth = function() { return shiftval; };

    var twopi = Math.PI * 2.0;
    var symbollen, halfsym; 
    var sf, mf; //mark and space filter
    var dataFilter;

    //var avgFilter = Iir2.lowpass(rate / 100, this.sampleRate);

    var super_setRate = this.setRate;
    this.setRate = function(rate) {
        super_setRate(rate);
        adjust();
    };

    this.setRate(45.0); //makes all rate/shift dependent vars initialize

    function adjust() {
        sf = FIR.bandpass(13, -0.75 * shiftval, -0.25 * shiftval, self.getSampleRate());
        mf = FIR.bandpass(13,  0.25 * shiftval,  0.75 * shiftval, self.getSampleRate());
        dataFilter = FIR.boxcar((self.getSamplesPerSymbol() * 0.7)|0 );
        //dataFilter = FIR.lowpass(13, self.getRate() * 0.5, self.getSampleRate());
        //dataFilter = Biquad.lowPass(self.getRate() * 0.5, self.getSampleRate());
        symbollen = Math.round(self.getSamplesPerSymbol());
        halfsym = symbollen >> 1;
    }


    var loHys = -2.0;
    var hiHys =  2.0;
    var bit = false;
    var lastr = 0;
    var lasti = 0;
    var bitsum = 0;

    /**
     * note: multiplying one complex sample of an
     * FM signal with the conjugate of the previous
     * value gives the instantaneous frequency change of
     * the signal.  This is called a polar discrminator.
     */
    this.receive = function(isample) {
        var space = sf.updatex(isample);
        var mark  = mf.updatex(isample);
        var r     = space.r + mark.r;
        var i     = space.i + mark.i;
        var x     = r*lastr - i*lasti;
        var y     = r*lasti + i*lastr;
        lastr     = r; //save the conjugate
        lasti     = -i;
        var angle = Math.atan2(y, x);  //arg
        var comp  = (angle>0) ? -10.0 : 10.0;
        var sig   = dataFilter.update(comp);
        //trace("sig:" + sig + "  comp:" + comp)

        scopeOut(sig);

        //trace("sig:" + sig)
        if (sig > hiHys) {
            bit = false;
        } else if (sig < loHys) {
            bit = true;
        }
        
        bit = bit ^ inverted; //user-settable
        
        self.processBit(bit);
    };

    
    this.processBit = function(bit, parms) {
    };
    
    
    var samplesSinceChange = 0;
    var lastbit = false;
    
    /**
     * Used for modes without start/stop. Test if the current bit is the middle
     * of where a symbol is expected to be.
     */
    this.isMiddleBit = function(bit) {
        samplesSinceChange = (bit===lastbit) ? samplesSinceChange+1 : 0;
        lastbit = bit;
        var middleBit = (samplesSinceChange%symbollen === halfsym);
        return middleBit;
    };

    var SSIZE = 200;
    var scopedata = new Array(SSIZE);
    var scnt = 0;
    var sx = -1;
    function scopeOut(v) {
        var sign = (v>0) ? 1 : -1;
        var scalar = Math.log(Math.abs(v) + 1)*0.25;
        scopedata[scnt++] = [sx, sign * scalar];
        sx += 0.01;
        if (scnt >= SSIZE) {
            scnt = 0;
            sx = -1;
            par.showScope(scopedata);
            scopedata = new Array(SSIZE);
        }
    }

}// FskBase

export {FskBase};

