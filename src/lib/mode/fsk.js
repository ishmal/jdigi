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
System.register(["./mode", "../filter"], function(exports_1) {
    "use strict";
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var mode_1, filter_1;
    var SSIZE, FskBase;
    return {
        setters:[
            function (mode_1_1) {
                mode_1 = mode_1_1;
            },
            function (filter_1_1) {
                filter_1 = filter_1_1;
            }],
        execute: function() {
            SSIZE = 200;
            /**
             * This is a base class for all two-tone FSK modes.
             * @see http://en.wikipedia.org/wiki/Asynchronous_serial_communication
             */
            FskBase = (function (_super) {
                __extends(FskBase, _super);
                function FskBase(par, props) {
                    _super.call(this, par, props);
                    this._shift = 170.0;
                    this._inverted = false;
                    this.rate = 45.0;
                    this._samplesSinceChange = 0;
                    this._lastBit = false;
                    //receive
                    this._loHys = -1.0;
                    this._hiHys = 1.0;
                    this._bit = false;
                    this._lastr = 0;
                    this._lasti = 0;
                    this._bitsum = 0;
                    //scope
                    this._scopeData = new Array(SSIZE);
                    this._scnt = 0;
                    this._sx = -1;
                }
                Object.defineProperty(FskBase.prototype, "shift", {
                    get: function () {
                        return this._shift;
                    },
                    set: function (v) {
                        this._shift = v;
                        this.adjust();
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(FskBase.prototype, "bandwidth", {
                    get: function () {
                        return this._shift;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * @see Mode._setRate for an explanation of this
                 */
                FskBase.prototype._setRate = function (v) {
                    _super.prototype._setRate.call(this, v);
                    this.adjust();
                };
                Object.defineProperty(FskBase.prototype, "inverted", {
                    get: function () {
                        return this._inverted;
                    },
                    set: function (v) {
                        this._inverted = v;
                    },
                    enumerable: true,
                    configurable: true
                });
                FskBase.prototype.adjust = function () {
                    this._sf = filter_1.FIR.bandpass(13, -0.75 * this.shift, -0.25 * this.shift, this.par.sampleRate);
                    this._mf = filter_1.FIR.bandpass(13, 0.25 * this.shift, 0.75 * this.shift, this.par.sampleRate);
                    //dataFilter = FIR.boxcar((self.samplesPerSymbol * 0.7)|0 );
                    this._dataFilter = filter_1.FIR.raisedcosine(13, 0.5, this.rate, this.par.sampleRate);
                    //dataFilter = FIR.lowpass(13, this.rate * 0.5, this.sampleRate);
                    //dataFilter = Biquad.lowPass(this.rate * 0.5, this.sampleRate);
                    this._symbollen = Math.round(this.samplesPerSymbol);
                    this._halfsym = this._symbollen >> 1;
                };
                /**
                 * note: multiplying one complex sample of an
                 * FM signal with the conjugate of the previous
                 * value gives the instantaneous frequency change of
                 * the signal.  This is called a polar discrminator.
                 */
                FskBase.prototype.receive = function (isample) {
                    var lastr = this._lastr;
                    var lasti = this._lasti;
                    var space = this._sf.updatex(isample);
                    var mark = this._mf.updatex(isample);
                    var r = space.r + mark.r;
                    var i = space.i + mark.i;
                    var x = r * lastr - i * lasti;
                    var y = r * lasti + i * lastr;
                    this._lastr = r; //save the conjugate
                    this._lasti = -i;
                    var angle = Math.atan2(y, x); //arg
                    var comp = (angle > 0) ? -10.0 : 10.0;
                    var sig = this._dataFilter.update(comp);
                    //console.log("sig:" + sig + "  comp:" + comp)
                    this.scopeOut(sig);
                    var bit = this._bit;
                    //trace("sig:" + sig)
                    if (sig > this._hiHys) {
                        bit = false;
                    }
                    else if (sig < this._loHys) {
                        bit = true;
                    }
                    bit = bit !== this._inverted; //user-settable
                    this.processBit(bit);
                    this._bit = bit;
                };
                FskBase.prototype.processBit = function (bit, parms) {
                };
                /**
                 * Used for modes without start/stop. Test if the current bit is the middle
                 * of where a symbol is expected to be.
                 */
                FskBase.prototype.isMiddleBit = function (bit) {
                    this._samplesSinceChange = (bit === this._lastBit) ? this._samplesSinceChange + 1 : 0;
                    this._lastBit = bit;
                    var middleBit = (this._samplesSinceChange % this._symbollen === this._halfsym);
                    return middleBit;
                };
                FskBase.prototype.scopeOut = function (v) {
                    var sign = (v > 0) ? 1 : -1;
                    var scalar = Math.log(Math.abs(v) + 1) * 0.25;
                    this._scopeData[this._scnt++] = [this._sx, sign * scalar];
                    this._sx += 0.01;
                    if (this._scnt >= SSIZE) {
                        this._scnt = 0;
                        this._sx = -1;
                        this.par.showScope(this._scopeData);
                        this._scopeData = new Array(SSIZE);
                    }
                };
                return FskBase;
            }(mode_1.Mode));
            exports_1("FskBase", FskBase); // FskBase
        }
    }
});
//# sourceMappingURL=fsk.js.map