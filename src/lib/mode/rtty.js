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
System.register(["./fsk"], function(exports_1) {
    "use strict";
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var fsk_1;
    var Baudot, NUL, SPACE, CR, LF, LTRS, FIGS, NRBITS, ParityNone, ParityOne, ParityZero, ParityOdd, ParityEven, RxIdle, RxStart, RxData, RxStop, RxParity, RttyMode;
    return {
        setters:[
            function (fsk_1_1) {
                fsk_1 = fsk_1_1;
            }],
        execute: function() {
            /**
             * These are the ITU codes for 5-bit Baudot code and 7-bit SITOR
             * in the same table
             */
            Baudot = [
                [null, null],
                ['E', '3'],
                ['\n', '\n'],
                ['A', '-'],
                [' ', ' '],
                ['S', '\''],
                ['I', '8'],
                ['U', '7'],
                ['\n', '\n'],
                ['D', '$'],
                ['R', '4'],
                ['J', '\07'],
                ['N', ','],
                ['F', '!'],
                ['C', ':'],
                ['K', '['],
                ['T', '5'],
                ['Z', '+'],
                ['L', ']'],
                ['W', '2'],
                ['H', '#'],
                ['Y', '6'],
                ['P', '0'],
                ['Q', '1'],
                ['O', '9'],
                ['B', '?'],
                ['G', '&'],
                [null, null],
                ['M', '.'],
                ['X', '/'],
                ['V', '='],
                [null, null] // 0x1f LTRS
            ];
            NUL = 0x00;
            SPACE = 0x04;
            CR = 0x08;
            LF = 0x02;
            LTRS = 0x1f;
            FIGS = 0x1b;
            NRBITS = 5;
            /**
             * Enumerations for parity types
             */
            ParityNone = 0;
            ParityOne = 1;
            ParityZero = 2;
            ParityOdd = 3;
            ParityEven = 4;
            RxIdle = 0;
            RxStart = 1;
            RxData = 2;
            RxStop = 3;
            RxParity = 4;
            /**
             * Mode for Radio teletype.  Sends a standard
             * async code with a start bit, 5 data bits and
             * a stop bit.  Whether a parity bit is sent or
             * interpreted should be adjustable.
             *
             * @see http://en.wikipedia.org/wiki/Radioteletype
             * @see http://en.wikipedia.org/wiki/Asynchronous_serial_communication
             *
             */
            RttyMode = (function (_super) {
                __extends(RttyMode, _super);
                function RttyMode(par) {
                    _super.call(this, par, RttyMode.props);
                    this._unshiftOnSpace = false;
                    this._symbollen = 0;
                    this._halfsym = 0;
                    this._symarray = [];
                    this._symptr = 0;
                    this.rate = 45.45;
                    this._parityType = ParityNone;
                    this._state = RxIdle;
                    this._bitcount = 0;
                    this._code = 0;
                    this._parityBit = false;
                    this._counter = 0;
                    this._msbit = 1 << (NRBITS - 1);
                    this._shifted = false;
                }
                RttyMode.props = function (self) {
                    return {
                        name: "rtty",
                        tooltip: "radio teletype",
                        controls: [
                            {
                                name: "rate",
                                type: "choice",
                                tooltip: "rtty baud rate",
                                get value() {
                                    return self.rate;
                                },
                                set value(v) {
                                    self.rate = parseFloat(v);
                                },
                                values: [
                                    { name: "45", value: 45.45 },
                                    { name: "50", value: 50.00 },
                                    { name: "75", value: 75.00 },
                                    { name: "100", value: 100.00 }
                                ]
                            },
                            {
                                name: "shift",
                                type: "choice",
                                tooltip: "frequency distance between mark and space",
                                get value() {
                                    return self.shift;
                                },
                                set value(v) {
                                    self.shift = parseFloat(v);
                                },
                                values: [
                                    { name: "85", value: 85.0 },
                                    { name: "170", value: 170.0 },
                                    { name: "450", value: 450.0 },
                                    { name: "850", value: 850.0 }
                                ]
                            },
                            {
                                name: "inv",
                                type: "boolean",
                                get value() {
                                    return self.inverted;
                                },
                                set value(v) {
                                    self.inverted = v;
                                }
                            },
                            {
                                name: "UoS",
                                type: "boolean",
                                get value() {
                                    return self.unshiftOnSpace;
                                },
                                set value(v) {
                                    self.unshiftOnSpace = v;
                                }
                            }
                        ]
                    };
                };
                RttyMode.prototype.setRate = function (v) {
                    _super.prototype._setRate.call(this, v);
                    this._symbollen = Math.round(this.samplesPerSymbol);
                    this._halfsym = this._symbollen >> 1;
                    this._symarray = new Array(this._symbollen);
                    for (var pp = 0; pp < this._symbollen; pp++) {
                        this._symarray[pp] = false;
                    }
                };
                RttyMode.countbits = function (n) {
                    var c = 0;
                    while (n) {
                        n &= n - 1;
                        c++;
                    }
                    return c;
                };
                RttyMode.prototype.parityOf = function (c) {
                    switch (this._parityType) {
                        case ParityOdd:
                            return false; // FIXME!! (this.countbits(c) & 1) !== 0;
                        case ParityEven:
                            return false; //FIXME!!  (this.countbits(c) & 1) === 0;
                        case ParityZero:
                            return false;
                        case ParityOne:
                            return true;
                        default:
                            return false; //None or unknown
                    }
                };
                /**
                 * We wish to sample data at the end of a symbol period, with
                 * Use a cirsular delay line to check if we have a mark-to-space transition,
                 * then get a correction so that we align on symbol centers.  Once we do that,
                 * we are hopefully aligned on a trailing edge, then we can sense a mark or
                 * space by which has the most bits.
                 *
                 * |<-----symbollen ---->| Now
                 *
                 * ----3----|
                 *          |
                 *          |-----3------
                 *
                 *          |<---corr-->|
                 *
                 *
                 *
                 * While reading bits, are most of the bits set? Then it's
                 * a mark, else a space.
                 *
                 * |<-----symbollen ---->| Now
                 *  |------------------|
                 *  |                  |
                 * -|                  |-
                 *
                 */
                RttyMode.prototype.processBit = function (bit) {
                    this._symarray[this._symptr++] = bit;
                    this._symptr %= this._symbollen;
                    var last = this._symarray[this._symptr];
                    var isMarkToSpace = false;
                    var corr = 0;
                    var ptr = this._symptr;
                    var sum = 0;
                    for (var pp = 0; pp < this._symbollen; pp++) {
                        if (this._symarray[ptr++])
                            sum++;
                        ptr %= this._symbollen;
                    }
                    var isMark = (sum > this._halfsym);
                    if (last && !bit) {
                        if (Math.abs(this._halfsym - sum) < 6) {
                            isMarkToSpace = true;
                            corr = sum;
                        }
                    }
                    switch (this._state) {
                        case RxIdle:
                            //console.log("RxIdle");
                            if (isMarkToSpace) {
                                this._state = RxStart;
                                this._counter = corr; //lets us re-center
                            }
                            break;
                        case RxStart:
                            //console.log("RxStart");
                            if (--this._counter <= 0) {
                                if (!isMark) {
                                    this._state = RxData;
                                    this._code = 0 | 0;
                                    this._parityBit = false;
                                    this._bitcount = 0;
                                    this._counter = this._symbollen;
                                }
                                else {
                                    this._state = RxIdle;
                                }
                            }
                            break;
                        case RxData:
                            //console.log("RxData");
                            if (--this._counter <= 0) {
                                this._counter = this._symbollen;
                                //code = (code<<1) + isMark; //msb
                                this._code = ((this._code >>> 1) + ((isMark) ? this._msbit : 0)) | 0; //lsb
                                if (++this._bitcount >= NRBITS) {
                                    this._state = (this._parityType === ParityNone) ? RxStop : RxParity;
                                }
                            }
                            break;
                        case RxParity:
                            //console.log("RxParity");
                            if (--this._counter <= 0) {
                                this._state = RxStop;
                                this._parityBit = isMark;
                            }
                            break;
                        case RxStop:
                            //console.log("RxStop");
                            if (--this._counter <= 0) {
                                if (isMark) {
                                    this.outCode(this._code);
                                }
                                this._state = RxIdle;
                            }
                            break;
                    }
                }; // processBit
                RttyMode.prototype.reverse = function (v, size) {
                    var a = v;
                    var b = 0;
                    while (size--) {
                        b += a & 1;
                        b <<= 1;
                        a >>= 1;
                    }
                    return b;
                };
                RttyMode.prototype.outCode = function (rawcode) {
                    //println("raw:" + rawcode)
                    //rawcode = reverse(rawcode, 5);
                    var code = rawcode & 0x1f;
                    if (code === NUL) {
                    }
                    else if (code === FIGS) {
                        this._shifted = true;
                    }
                    else if (code === LTRS) {
                        this._shifted = false;
                    }
                    else if (code === SPACE) {
                        this.par.putText(" ");
                        if (this._unshiftOnSpace)
                            this._shifted = false;
                    }
                    else if (code === CR || code === LF) {
                        this.par.putText("\n");
                        if (this._unshiftOnSpace)
                            this._shifted = false;
                    }
                    else {
                        var v = Baudot[code];
                        if (v) {
                            var c = (this._shifted) ? v[1] : v[0];
                            if (c)
                                this.par.putText(c);
                        }
                    }
                };
                return RttyMode;
            }(fsk_1.FskBase)); // RttyMode
            exports_1("RttyMode", RttyMode);
        }
    }
});
//# sourceMappingURL=rtty.js.map