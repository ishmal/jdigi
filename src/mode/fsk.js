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


var Mode    = require("./mode").Mode;
var FIR     = require("../filter").FIR;
var Biquad  = require("../filter").Biquad;
var Complex = require("../math").Complex;





/**
 * This is a base class for all two-tone FSK modes.
 * @see http://en.wikipedia.org/wiki/Asynchronous_serial_communication
 */
function FskBase(par, sampleRateHint) {
    "use strict";
    Mode.call(this, par, sampleRateHint);
    var self = this;

    var shiftval = 170.0;

    this.getShift = function() {
        return shiftval;
    };

    this.setShift = function(v) {
        shiftval = v;
        adjust();
    };

    this.getBandwidth = function() { return shiftval; };

    var twopi = Math.PI * 2.0;
    var symbollen, halfSym; //timing recovery
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
        dataFilter = FIR.boxcar((self.getSamplesPerSymbol() * 1.4)|0 );
        //dataFilter = FIR.lowpass(13, self.getRate() * 0.5, self.getSampleRate());
        //dataFilter = Biquad.lowPass(self.getRate() * 0.5, self.getSampleRate());
        symbollen = self.getSamplesPerSymbol() | 0;
        halfSym = symbollen >> 1;
    }

    this.status("sampleRate: " + this.getSampleRate() + " samplesPerSymbol: " + this.getSamplesPerSymbol());

    var loHys = -2.0;
    var hiHys =  2.0;
    var bit = false;
    var lastBit = false;
    var lastval = new Complex(0,0);
    var samplesSinceChange = 0;

    /**
     * note: multiplying one complex sample of an
     * FM signal with the conjugate of the previous
     * value gives the instantaneous frequency change of
     * the signal.  This is called a polar discrminator.
     */
    this.receive = function(isample) {
        var space  = sf.updatex(isample);
        var mark   = mf.updatex(isample);
        var sample = space.add(mark);
        var prod   = sample.mul(lastval.conj());
        lastval    = sample;
        var demod  = prod.arg();
        var comp   = (demod<0) ? -10.0 : 10.0;
        var sig    = dataFilter.update(comp);
        //trace("sig:" + sig + "  comp:" + comp)

        scopeOut(sig);

        //trace("sig:" + sig)
        if (sig > hiHys) {
            bit = false;
        } else if (sig < loHys) {
            bit = true;
        }
        
        samplesSinceChange = (bit === lastBit) ? samplesSinceChange + 1 : 0;
        lastBit = bit;
        
        if ((samplesSinceChange % symbollen) === halfSym) {
            self.processBit(bit);
        }
    };
    
    this.processBit = function(bit) {
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

module.exports.FskBase = FskBase;
