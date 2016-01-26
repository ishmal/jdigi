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
System.register(["../nco", "../constants", "../filter"], function(exports_1) {
    "use strict";
    var nco_1, constants_1, filter_1;
    var Mode;
    return {
        setters:[
            function (nco_1_1) {
                nco_1 = nco_1_1;
            },
            function (constants_1_1) {
                constants_1 = constants_1_1;
            },
            function (filter_1_1) {
                filter_1 = filter_1_1;
            }],
        execute: function() {
            Mode = (function () {
                function Mode(par, props) {
                    this.par = par;
                    this.properties = props(this);
                    this._frequency = 1000;
                    this._afcFilter = filter_1.Biquad.lowPass(1.0, 100.0);
                    this._loBin = 0;
                    this._freqBin = 0;
                    this._hiBin = 0;
                    this.adjustAfc();
                    this._useAfc = false;
                    this._rate = 31.25;
                    this._nco = nco_1.NcoCreate(this._frequency, par.sampleRate);
                }
                Object.defineProperty(Mode.prototype, "frequency", {
                    get: function () {
                        return this._frequency;
                    },
                    set: function (freq) {
                        this._frequency = freq;
                        this._nco.setFrequency(freq);
                        this.adjustAfc();
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Mode.prototype, "bandwidth", {
                    get: function () {
                        return 0;
                    },
                    enumerable: true,
                    configurable: true
                });
                Mode.prototype.adjustAfc = function () {
                    var freq = this._frequency;
                    var fs = this.par.sampleRate;
                    var bw = this.bandwidth;
                    var binWidth = fs * 0.5 / constants_1.Constants.BINS;
                    this._loBin = ((freq - bw * 0.707) / binWidth) | 0;
                    this._freqBin = (freq / binWidth) | 0;
                    this._hiBin = ((freq + bw * 0.707) / binWidth) | 0;
                    //console.log("afc: " + loBin + "," + freqBin + "," + hiBin);
                };
                Object.defineProperty(Mode.prototype, "useAfc", {
                    get: function () {
                        return this._useAfc;
                    },
                    set: function (v) {
                        this._useAfc = v;
                    },
                    enumerable: true,
                    configurable: true
                });
                Mode.prototype.computeAfc = function (ps) {
                    var sum = 0;
                    var loBin = this._loBin;
                    var freqBin = this._freqBin;
                    var hiBin = this._hiBin;
                    for (var i = loBin, j = hiBin; i < freqBin; i++, j--) {
                        if (ps[j] > ps[i])
                            sum++;
                        else if (ps[i] > ps[j])
                            sum--;
                    }
                    var filtered = this._afcFilter.update(sum);
                    this._nco.setError(filtered);
                };
                Mode.prototype.status = function (msg) {
                    this.par.status(this.properties.name + " : " + msg);
                };
                /**
                 * There is a known bug in Typescript that will not allow
                 * calling a super property setter.  The work around is to delegate
                 * the setting to s parent class method, and override that.  This
                 * works in ES6.
                 */
                Mode.prototype._setRate = function (v) {
                    this._rate = v;
                    this.adjustAfc();
                    this.status("Fs: " + this.par.sampleRate + " rate: " + v +
                        " sps: " + this.samplesPerSymbol);
                };
                Object.defineProperty(Mode.prototype, "rate", {
                    get: function () {
                        return this._rate;
                    },
                    set: function (v) {
                        this._setRate(v);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Mode.prototype, "samplesPerSymbol", {
                    get: function () {
                        return this.par.sampleRate / this._rate;
                    },
                    enumerable: true,
                    configurable: true
                });
                //#######################
                //# R E C E I V E
                //#######################
                Mode.prototype.receiveFft = function (ps) {
                    if (this._useAfc) {
                        this.computeAfc(ps);
                    }
                };
                Mode.prototype.receiveData = function (v) {
                    var cs = this._nco.next();
                    this.receive({ r: v * cs.r, i: -v * cs.i });
                };
                /**
                 * Overload this for each mode.
                 */
                Mode.prototype.receive = function (v) {
                };
                //#######################
                //# T R A N S M I T
                //#######################
                Mode.prototype.getTransmitData = function () {
                    /*
                    //output buffer empty?
                    if (this.optr >= this.decimation) {
                        //input buffer empty?
                        if (this.iptr >= this.ilen) {
                            this.ibuf = this.getBasebandData();
                            this.ilen = this.ibuf.length;
                            if (this.ilen === 0) {
                                this.ilen = 1;
                                this.ibuf = [0];
                            }
                            this.iptr = 0;
                        }
                        var v = this.ibuf[this.iptr++];
                        this.interpolator.interpolatex(v, this.interpbuf);
                        this.optr = 0;
                    }
                    var cx = this.obuf[this.optr];
                    var upmixed = this.nco.mixNext(cx);
                    return upmixed.abs();
                    */
                };
                return Mode;
            }());
            exports_1("Mode", Mode);
        }
    }
});
//# sourceMappingURL=mode.js.map