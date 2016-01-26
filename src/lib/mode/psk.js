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
System.register(["./mode", "../filter", '../complex'], function(exports_1) {
    "use strict";
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var mode_1, filter_1, complex_1;
    var descriptions, encodeTable, decodeTable, SSIZE, diffScale, TWOPI, HALFPI, PskMode, LOG, PskMode2;
    function createDecodeTable() {
        var dec = {};
        for (var i = 0; i < descriptions.length; i++) {
            var key = parseInt(descriptions[i], 2);
            dec[key] = i;
        }
        return dec;
    }
    function printTables() {
        console.log("Encode Table =================");
        for (var i = 0; i < encodeTable.length; i++) {
            console.log("" + i + " : " + encodeTable[i].join(","));
        }
        console.log("Decode Table =================");
        for (var key in decodeTable) {
            var asc = decodeTable[key];
            console.log(key.toString(2) + " : " + asc);
        }
    }
    function createEarlyLate(samplesPerSymbol) {
        var size = samplesPerSymbol | 0;
        var half = size >> 1;
        var buf = new Float32Array(size);
        var bitclk = 0.0;
        function update(z, f) {
            var idx = bitclk | 0;
            var sum = 0.0;
            var ampsum = 0.0;
            var mag = complex_1.ComplexOps.mag(z);
            buf[idx] = 0.8 * buf[idx] + 0.2 * mag;
            for (var i = 0; i < half; i++) {
                sum += (buf[i] - buf[i + half]);
                ampsum += (buf[i] + buf[i + half]);
            }
            var err = (ampsum === 0.0) ? 0.0 : sum / ampsum * 0.2;
            bitclk += (1.0 - err);
            if (bitclk < 0)
                bitclk += size;
            else if (bitclk >= size) {
                bitclk -= size;
                f(z);
            }
        }
        return {
            update: update
        };
    }
    return {
        setters:[
            function (mode_1_1) {
                mode_1 = mode_1_1;
            },
            function (filter_1_1) {
                filter_1 = filter_1_1;
            },
            function (complex_1_1) {
                complex_1 = complex_1_1;
            }],
        execute: function() {
            /**
             * This contains the definitions of the bit patterns for the Varicode set
             * of characters.
             *
             * A "from" and a "to" table are also provided.
             */
            descriptions = [
                "1010101011",
                "1011011011",
                "1011101101",
                "1101110111",
                "1011101011",
                "1101011111",
                "1011101111",
                "1011111101",
                "1011111111",
                "11101111",
                "11101",
                "1101101111",
                "1011011101",
                "11111",
                "1101110101",
                "1110101011",
                "1011110111",
                "1011110101",
                "1110101101",
                "1110101111",
                "1101011011",
                "1101101011",
                "1101101101",
                "1101010111",
                "1101111011",
                "1101111101",
                "1110110111",
                "1101010101",
                "1101011101",
                "1110111011",
                "1011111011",
                "1101111111",
                "1",
                "111111111",
                "101011111",
                "111110101",
                "111011011",
                "1011010101",
                "1010111011",
                "101111111",
                "11111011",
                "11110111",
                "101101111",
                "111011111",
                "1110101",
                "110101",
                "1010111",
                "110101111",
                "10110111",
                "10111101",
                "11101101",
                "11111111",
                "101110111",
                "101011011",
                "101101011",
                "110101101",
                "110101011",
                "110110111",
                "11110101",
                "110111101",
                "111101101",
                "1010101",
                "111010111",
                "1010101111",
                "1010111101",
                "1111101",
                "11101011",
                "10101101",
                "10110101",
                "1110111",
                "11011011",
                "11111101",
                "101010101",
                "1111111",
                "111111101",
                "101111101",
                "11010111",
                "10111011",
                "11011101",
                "10101011",
                "11010101",
                "111011101",
                "10101111",
                "1101111",
                "1101101",
                "101010111",
                "110110101",
                "101011101",
                "101110101",
                "101111011",
                "1010101101",
                "111110111",
                "111101111",
                "111111011",
                "1010111111",
                "101101101",
                "1011011111",
                "1011",
                "1011111",
                "101111",
                "101101",
                "11",
                "111101",
                "1011011",
                "101011",
                "1101",
                "111101011",
                "10111111",
                "11011",
                "111011",
                "1111",
                "111",
                "111111",
                "110111111",
                "10101",
                "10111",
                "101",
                "110111",
                "1111011",
                "1101011",
                "11011111",
                "1011101",
                "111010101",
                "1010110111",
                "110111011",
                "1010110101",
                "1011010111",
                "1110110101" //127  7F  DEL  Delete
            ];
            /**
             * this is a table of index->bit seqs.  Ex: 116('t') is Seq(true, false, true)
             */
            encodeTable = descriptions.map(function (s) {
                var chars = s.split("");
                var bools = chars.map(function (c) {
                    return (c === '1');
                });
                return bools;
            });
            decodeTable = createDecodeTable();
            SSIZE = 200;
            diffScale = 255.0 / Math.PI;
            TWOPI = Math.PI * 2.0;
            HALFPI = Math.PI * 0.5;
            /**
             * Phase Shift Keying mode.
             */
            PskMode = (function (_super) {
                __extends(PskMode, _super);
                function PskMode(par) {
                    _super.call(this, par, PskMode.props);
                    this._timer = createEarlyLate(this.samplesPerSymbol);
                    this._bpf = filter_1.FIR.bandpass(13, -0.7 * this.rate, 0.7 * this.rate, this.par.sampleRate);
                    this._scopedata = new Array(SSIZE);
                    this._sctr = 0;
                    this._qpskMode = false;
                    //decoding
                    this._code = 0;
                    this._lastv = 0.0;
                    this._count = 0;
                    this._lastBit = false;
                    //transmit
                    this._txBuf = [];
                    this._txPtr = 0;
                }
                PskMode.props = function (self) {
                    return {
                        name: "psk",
                        tooltip: "phase shift keying",
                        controls: [
                            {
                                name: "rate",
                                type: "choice",
                                tooltip: "PSK data rate",
                                get value() {
                                    return self.rate;
                                },
                                set value(v) {
                                    self.rate = parseFloat(v);
                                },
                                values: [
                                    { name: "31", value: 31.25 },
                                    { name: "63", value: 62.50 },
                                    { name: "125", value: 125.00 }
                                ]
                            },
                            {
                                name: "qpsk",
                                type: "boolean",
                                tooltip: "not yet implemented",
                                get value() {
                                    return self.qpskMode;
                                },
                                set value(v) {
                                    self.qpskMode = v;
                                }
                            }
                        ]
                    };
                };
                PskMode.prototype._setRate = function (v) {
                    _super.prototype._setRate.call(this, v);
                    this._timer = createEarlyLate(this.samplesPerSymbol);
                    this._bpf = filter_1.FIR.bandpass(13, -0.7 * v, 0.7 * v, this.par.sampleRate);
                };
                Object.defineProperty(PskMode.prototype, "bandwidth", {
                    get: function () {
                        return this.rate;
                    },
                    enumerable: true,
                    configurable: true
                });
                PskMode.prototype.receive = function (v) {
                    var _this = this;
                    var z = this._bpf.updatex(v);
                    this.scopeOut(z);
                    this._timer.update(z, function (vv) { return _this.processSymbol(vv); });
                };
                PskMode.prototype.scopeOut = function (z) {
                    this._scopedata[this._sctr++] = [Math.log(z.r + 1) * 30, Math.log(z.i + 1) * 30];
                    if (this._sctr >= SSIZE) {
                        this.par.showScope(this._scopedata);
                        this._sctr = 0;
                        this._scopedata = new Array(SSIZE);
                    }
                };
                PskMode.prototype.angleDiff = function (a, b) {
                    var diff = a - b;
                    while (diff > Math.PI)
                        diff -= TWOPI;
                    while (diff < -Math.PI)
                        diff += TWOPI;
                    //println("%f %f %f".format(a, b, diff))
                    return diff;
                };
                /**
                 * Return the scaled distance of the angle v from "from".
                 * Returns a positive value 0..255  for
                 * 0 radians to +- pi
                 */
                PskMode.prototype.distance = function (v, from) {
                    var diff = Math.PI - Math.abs(Math.abs(v - from) - Math.PI);
                    return Math.floor(diff * diffScale);
                };
                PskMode.prototype.processSymbol = function (v) {
                    var vn, dv, d00, d01, d10, d11;
                    if (this._qpskMode) {
                        /**/
                        vn = v.arg();
                        dv = this.angleDiff(vn, this._lastv);
                        d00 = this.distance(dv, Math.PI);
                        d01 = this.distance(dv, HALFPI);
                        d10 = this.distance(dv, -HALFPI);
                        d11 = this.distance(dv, 0.0);
                        var bm = [d00, d01, d10, d11];
                        //println("%6.3f %6.3f %6.3f  :  %3d %3d %3d %3d".format(lastv, vn, dv, d00, d01, d10, d11))
                        var bits = null; // FIXME!!! this._decoder.decodeOne(bm);
                        var len = bits.length;
                        for (var i = 0; i < len; i++)
                            this.processBit(bits[i]);
                        this._lastv = vn;
                    }
                    else {
                        /**/
                        vn = v.arg();
                        dv = this.angleDiff(vn, this._lastv);
                        d00 = this.distance(dv, Math.PI);
                        d11 = this.distance(dv, 0.0);
                        //println("%6.3f %6.3f %6.3f  :  %3d %3d".format(lastv, vn, dv, d00, d11))
                        var bit = d11 < d00;
                        this._lastv = vn;
                        /**/
                        this.processBit(bit);
                    }
                };
                PskMode.prototype.processBit = function (bit) {
                    //println("bit: " + bit)
                    if ((!bit) && (!this._lastBit)) {
                        this._code >>= 1; //remove trailing 0
                        if (this._code !== 0) {
                            //println("code:" + Varicode.toString(code))
                            var ascii = decodeTable[this._code];
                            if (ascii) {
                                var chr = ascii;
                                if (chr == 10 || chr == 13)
                                    this.par.putText("\n");
                                else
                                    this.par.putText(String.fromCharCode(chr));
                                this._code = 0;
                            }
                        }
                        this._code = 0;
                    }
                    else {
                        this._code <<= 1;
                        if (bit)
                            this._code += 1;
                    }
                    this._lastBit = bit;
                };
                //###################
                //# transmit
                //###################
                PskMode.prototype.getNextTransmitBuffer = function () {
                    //let ch = this.par.getText();
                    return [];
                };
                PskMode.prototype.transmit = function () {
                    if (this._txPtr >= this._txBuf.length) {
                        this._txBuf = this.getNextTransmitBuffer();
                        this._txPtr = 0;
                    }
                    var txv = this._txBuf[this._txPtr++];
                    return txv;
                };
                return PskMode;
            }(mode_1.Mode)); // PskMode
            LOG = Math.log;
            /**
             * Phase Shift Keying mode.
             */
            PskMode2 = (function (_super) {
                __extends(PskMode2, _super);
                function PskMode2(par) {
                    _super.call(this, par, PskMode2.props);
                    this._ilp = null;
                    this._qlp = null;
                    this._symbollen = 0;
                    this._halfSym = 0;
                    //receive
                    this._lastSign = -1;
                    this._samples = 0;
                    //scope
                    this._scopedata = new Array(SSIZE);
                    this._sctr = 0;
                    this._ssctr = 0;
                    this._qpskMode = false;
                    this._code = 0;
                    this._lastv = 0.0;
                    this._count = 0;
                    this._lastBit = false;
                    //transmit
                    this._txBuf = [];
                    this._txPtr = 0;
                    this.rate = 31.25;
                }
                PskMode2.props = function (self) {
                    return {
                        name: "psk",
                        tooltip: "phase shift keying",
                        controls: [
                            {
                                name: "rate",
                                type: "choice",
                                get value() {
                                    return self.rate;
                                },
                                set value(v) {
                                    self.rate = parseFloat(v);
                                },
                                values: [
                                    { name: "31", value: 31.25 },
                                    { name: "63", value: 62.50 },
                                    { name: "125", value: 125.00 }
                                ]
                            },
                            {
                                name: "qpsk",
                                type: "boolean",
                                get value() {
                                    return self.qpskMode;
                                },
                                set value(v) {
                                    self.qpskMode = v;
                                }
                            }
                        ]
                    };
                };
                Object.defineProperty(PskMode2.prototype, "bandwidth", {
                    get: function () {
                        return this.rate;
                    },
                    enumerable: true,
                    configurable: true
                });
                PskMode2.prototype._setRate = function (v) {
                    _super.prototype._setRate.call(this, v);
                    this._ilp = filter_1.Biquad.lowPass(v * 0.5, this.par.sampleRate);
                    this._qlp = filter_1.Biquad.lowPass(v * 0.5, this.par.sampleRate);
                    //bpf = FIR.bandpass(13, -0.7*this.getRate(), 0.7*this.getRate(), this.getSampleRate());
                    this._symbollen = this.samplesPerSymbol | 0;
                    this._halfSym = this._symbollen >> 1;
                };
                PskMode2.prototype.receive = function (z) {
                    var i = this._ilp.update(z.r);
                    var q = this._qlp.update(z.i);
                    this.scopeOut(i, q);
                    var sign = (i > 0) ? 1 : -1; //Math.sign() not on Chrome
                    if (sign != this._lastSign) {
                        this._samples = 0;
                    }
                    else {
                        this._samples++;
                    }
                    if ((this._samples % this._symbollen) === this._halfSym) {
                        this.processSymbol(i, q);
                    }
                    this._lastSign = sign;
                };
                PskMode2.prototype.scopeOut = function (i, q) {
                    if (!(++this._ssctr & 1))
                        return; //skip items
                    this._scopedata[this._sctr++] = [LOG(i + 1) * 30.0, LOG(q + 1) * 30.0];
                    if (this._sctr >= SSIZE) {
                        this.par.showScope(this._scopedata);
                        this._sctr = 0;
                        this._scopedata = new Array(SSIZE);
                    }
                };
                PskMode2.prototype.angleDiff = function (a, b) {
                    var diff = a - b;
                    while (diff > Math.PI)
                        diff -= TWOPI;
                    while (diff < -Math.PI)
                        diff += TWOPI;
                    //println("%f %f %f".format(a, b, diff))
                    return diff;
                };
                /**
                 * Return the scaled distance of the angle v from "from".
                 * Returns a positive value 0..255  for
                 * 0 radians to +- pi
                 */
                PskMode2.prototype.distance = function (v, from) {
                    var diff = Math.PI - Math.abs(Math.abs(v - from) - Math.PI);
                    return Math.floor(diff * diffScale);
                };
                PskMode2.prototype.processSymbol = function (i, q) {
                    var dv, d00, d01, d10, d11;
                    var vn = Math.atan2(q, i);
                    if (this._qpskMode) {
                        /**/
                        dv = this.angleDiff(vn, this._lastv);
                        d00 = this.distance(dv, Math.PI);
                        d01 = this.distance(dv, HALFPI);
                        d10 = this.distance(dv, -HALFPI);
                        d11 = this.distance(dv, 0.0);
                        var bm = [d00, d01, d10, d11];
                        //println("%6.3f %6.3f %6.3f  :  %3d %3d %3d %3d".format(lastv, vn, dv, d00, d01, d10, d11))
                        var bits = null; // FIXME!!  this._decoder.decodeOne(bm);
                        var len = bits.length;
                        for (var idx = 0; idx < len; idx++)
                            this.processBit(bits[idx]);
                        this._lastv = vn;
                    }
                    else {
                        /**/
                        dv = this.angleDiff(vn, this._lastv);
                        d00 = this.distance(dv, Math.PI);
                        d11 = this.distance(dv, 0.0);
                        //println("%6.3f %6.3f %6.3f  :  %3d %3d".format(lastv, vn, dv, d00, d11))
                        var bit = d11 < d00;
                        this._lastv = vn;
                        /**/
                        this.processBit(bit);
                    }
                };
                PskMode2.prototype.processBit = function (bit) {
                    //println("bit: " + bit)
                    if ((!bit) && (!this._lastBit)) {
                        this._code >>= 1; //remove trailing 0
                        if (this._code !== 0) {
                            //println("code:" + Varicode.toString(code))
                            var ascii = decodeTable[this._code];
                            if (ascii) {
                                var chr = ascii;
                                if (chr == 10 || chr == 13)
                                    this.par.putText("\n");
                                else
                                    this.par.putText(String.fromCharCode(chr));
                                this._code = 0;
                            }
                        }
                        this._code = 0;
                    }
                    else {
                        this._code <<= 1;
                        if (bit)
                            this._code += 1;
                    }
                    this._lastBit = bit;
                };
                //###################
                //# transmit
                //###################
                PskMode2.prototype.getNextTransmitBuffer = function () {
                    var ch = this.par.getText();
                    return [];
                };
                PskMode2.prototype.transmit = function () {
                    if (this._txPtr >= this._txBuf.length) {
                        this._txBuf = this.getNextTransmitBuffer();
                        this._txPtr = 0;
                    }
                    var txv = this._txBuf[this._txPtr++];
                    return txv;
                };
                return PskMode2;
            }(mode_1.Mode)); // PskMode2
            exports_1("PskMode", PskMode);
            exports_1("PskMode2", PskMode2);
        }
    }
});
//# sourceMappingURL=psk.js.map