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
'use strict';

import {FskBase} from './fsk';
import {Properties} from './mode';


const NUL = 0x2b;
const SPACE = 0x1d;
const CR = 0x0f;
const LF = 0x1b;
const LTRS = 0x2d;
const FIGS = 0x36;
const ALPHA = 0x78;
const BETA = 0x66;
const SYNC = 0x00;
const REPEAT = 0x33;

function createCCIR() {
    let t = [];
    t[0x3a] = ['Q', '1'];
    /*0111010*/
    t[0x72] = ['W', '2'];
    /*1110010*/
    t[0x35] = ['E', '3'];
    /*0110101*/
    t[0x55] = ['R', '4'];
    /*1010101*/
    t[0x17] = ['T', '5'];
    /*0010111*/
    t[0x6a] = ['Y', '6'];
    /*1101010*/
    t[0x39] = ['U', '7'];
    /*0111001*/
    t[0x59] = ['I', '8'];
    /*1011001*/
    t[0x47] = ['O', '9'];
    /*1000111*/
    t[0x5a] = ['P', '0'];
    /*1011010*/
    t[0x71] = ['A', '-'];
    /*1110001*/
    t[0x69] = ['S', '\''];
    /*1101001*/
    t[0x65] = ['D', '$'];
    /*1100101*/
    t[0x6c] = ['F', '!'];
    /*1101100*/
    t[0x56] = ['G', '&'];
    /*1010110*/
    t[0x4b] = ['H', '#'];
    /*1001011*/
    t[0x74] = ['J', 7];
    /*1110100*/
    t[0x3c] = ['K', '['];
    /*0111100*/
    t[0x53] = ['L', ']'];
    /*1010011*/
    t[0x63] = ['Z', '+'];
    /*1100011*/
    t[0x2e] = ['X', '/'];
    /*0101110*/
    t[0x5c] = ['C', ':'];
    /*1011100*/
    t[0x1e] = ['V', '='];
    /*0011110*/
    t[0x27] = ['B', '?'];
    /*0100111*/
    t[0x4d] = ['N', ','];
    /*1001101*/
    t[0x4e] = ['M', '.'];
    /*1001110*/
    t[0x1d] = [' ', ' '];
    t[0x0f] = ['\n', '\n']; // actually \r
    t[0x1b] = ['\n', '\n'];
    return t;
}

const CCIR = createCCIR();

function ccirValid(code: number): boolean {
    return (CCIR[code] !== undefined) ||
        code === NUL ||
        code === LTRS ||
        code === FIGS ||
        code === ALPHA ||
        code === BETA ||
        code === SYNC ||
        code === REPEAT;
}


const RxSync1 = 0;
const RxSync2 = 1;
const RxData = 2;

const ResultOk = 0;
const ResultSoft = 1;
const ResultFail = 2;
const ResultEom = 3;

function reverse(v, len) {
    let a = v;
    let b = 0;
    for (let i = 0; i < len; i++) {
        b = (b << 1) + (a & 1);
        a >>= 1;
    }
    return b;
}


/**
 *
 * @see http:// en.wikipedia.org/wiki/Asynchronous_serial_communication
 *
 */
export class NavtexMode extends FskBase {


    _unshiftOnSpace: boolean;
    _state: number;
    _bitcount: number;
    _code: number;
    _parityBit: boolean;
    _bitMask: number;
    _errs: number;
    _sync1: number;
    _sync2: number;
    _sync3: number;
    _sync4: number;
    _shifted: boolean;
    _dxMode: boolean;
    _q1: number;
    _q2: number;
    _q3: number;
    _lastChar: string;

    constructor(par) {
        super(par);
        this._unshiftOnSpace = false;
        this.shift = 170.0;
        this.rate = 100.0;
        this._state = RxSync1;
        this._bitcount = 0;
        this._code = 0;
        this._parityBit = false;
        this._bitMask = 0;

        /**
         * Since there is no start or stop bit, we must sync ourselves.
         * But syncing is very simple.  We shift the bits through four 7-bit
         * shift registers.  When all four have valid characters, we consider
         * it to be synced.
         */
        this._errs = 0;
        this._sync1 = 0;
        this._sync2 = 0;
        this._sync3 = 0;
        this._sync4 = 0;

        this._shifted = false;
        // Sitor-B is in either DX (data) or RX (repeat) mode
        this._dxMode = true;

        this._q3 = 0;
        this._q2 = 0;
        this._q1 = 0;

        this._lastChar = '@';

        this._properties = {
            name: 'navtex',
            tooltip: 'international naval teleprinter',
            controls: [
                {
                    name: 'inv',
                    type: 'boolean',
                    get value(): boolean {
                        return this.inverted;
                    },
                    set value(v: boolean) {
                        this.inverted = v;
                    }
                },
                {
                    name: 'UoS',
                    type: 'boolean',
                    get value():boolean {
                        return this.unshiftOnSpace;
                    },
                    set value(v: boolean) {
                        this.unshiftOnSpace = v;
                    }
                }
            ]
        };
    }

    shift7(bit) {
        let a = (bit) ? 1 : 0;
        let b = (this._sync1 >> 6) & 1;
        this._sync1 = ((this._sync1 << 1) + a) & 0x7f;
        a = b;
        b = (this._sync2 >> 6) & 1;
        this._sync2 = ((this._sync2 << 1) + a) & 0x7f;
        a = b;
        b = (this._sync3 >> 6) & 1;
        this._sync3 = ((this._sync3 << 1) + a) & 0x7f;
        a = b;
        this._sync4 = ((this._sync4 << 1) + a) & 0x7f;
    }


    processBit(bit) {

        if (!this.isMiddleBit(bit)) {
            return;
        }

        switch (this._state) {
            case RxSync1 :
                // trace('RxSync1')
                this._state = RxSync2;
                this._bitcount = 0;
                this._code = 0;
                this._errs = 0;
                this._sync1 = 0;
                this._sync2 = 0;
                this._sync3 = 0;
                this._sync4 = 0;
                break;
            case RxSync2 :
                // trace('Rxthis.sync2')
                this.shift7(bit);
                // trace(this.sync1.toHexString + ', '+  this.sync2.toHexString + ', ' +
                //      this.sync3.toHexString + ', ' + this.sync4.toHexString);
                // trace('bit: ' + bit);
                if (ccirValid(this._sync1) && ccirValid(this._sync2) &&
                    ccirValid(this._sync3) && ccirValid(this._sync4)) {
                    this.processCode(this._sync1);
                    this.processCode(this._sync2);
                    this.processCode(this._sync3);
                    this.processCode(this._sync4);
                    this._state = RxData;
                }
                break;
            case RxData :
                // trace('RxData');
                this._code = ((this._code << 1) + ((bit) ? 1 : 0)) & 0x7f;
                // trace('code: ' + code);
                if (++this._bitcount >= 7) {
                    if (this.processCode(this._code) !== ResultFail) { // we want Ok or Soft
                        // stay in RxData.  ready for next code
                        this._code = 0;
                        this._bitcount = 0;
                    } else {
                        this._code = 0;
                        this._bitcount = 0;
                        this._errs++;
                        if (this._errs > 3) {
                            this._state = RxSync1;
                            // trace('return to sync')
                        }
                    }
                }
                break;
            default:
        }// switch
    }


    qadd(v) {
        this._q3 = this._q2;
        this._q2 = this._q1;
        this._q1 = v;
    }

    processCode(code) {
        // trace('code: ' + code.toHexString + ' mode: ' + dxMode)
        let res = ResultOk;
        if (this._code === REPEAT) {
            this.qadd(this._code);
            this._shifted = false;
            this._dxMode = false;
        } else if (this._code === ALPHA) {
            this._shifted = false;
            this._dxMode = true;
        } else {
            if (this._dxMode) {
                if (!ccirValid(this._code)) {
                    res = ResultSoft;
                }
                this.qadd(code); // dont think.  just queue it
                this._dxMode = false; // for next time
            } else { // symbol
                if (ccirValid(this._code)) {
                    this.processCode2(this._code);
                } else {
                    if (ccirValid(this._q3)) {
                        let c = this.processCode2(this._q3);
                        this.par.status('FEC replaced :' + c);
                        res = ResultSoft;
                    } else {
                        this.processCode2(-1);
                        res = ResultFail;
                    }
                }
                this._dxMode = true; //  next time
            }// rxmode
        }// symbol
        return res;
    }


    processCode2(code) {
        let res = '@';
        if (code === 0) {
            // shouldnt happen
        } else if (code < 0) {
            // par.puttext('_');
            res = '_';
        } else if (code === ALPHA || code === REPEAT) {
            // shouldnt be here
        } else if (code === LTRS) {
            this._shifted = false;
        } else if (code === FIGS) {
            this._shifted = true;
        } else {
            let v = CCIR[code];
            if (v !== undefined) {
                let c = (this._shifted) ? v[1] : v[0];
                this.par.putText(c);
                res = c;
            }
        }
        this._lastChar = res;
        return res;
    }

}//  NavtexMode
