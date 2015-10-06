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
"use strict";

import {FskBase} from "./fsk";

const CCIR = (function () {

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
    t[0x0f] = ['\n', '\n']; //actually \r
    t[0x1b] = ['\n', '\n'];

    let NUL = 0x2b;
    let SPACE = 0x1d;
    let CR = 0x0f;
    let LF = 0x1b;
    let LTRS = 0x2d;
    let FIGS = 0x36;
    let ALPHA = 0x78;
    let BETA = 0x66;
    let SYNC = 0x00;
    let REPEAT = 0x33;

    let cls = {
        NUL: NUL,
        SPACE: SPACE,
        CR: CR,
        LF: LF,
        LTRS: LTRS,
        FIGS: FIGS,
        ALPHA: ALPHA,
        BETA: BETA,
        SYNC: SYNC,
        REPEAT: REPEAT
    };
    cls.isValid = function (code) {
        return (t[code] !== undefined) ||
            code === NUL ||
            code === LTRS ||
            code === FIGS ||
            code === ALPHA ||
            code === BETA ||
            code === SYNC ||
            code === REPEAT;
    };
    cls.t = t;

    return cls;
})();


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
 * @see http://en.wikipedia.org/wiki/Asynchronous_serial_communication
 *
 */
class NavtexMode extends FskBase {

    static props(self) {
        return {
            name: "navtex",
            tooltip: "international naval teleprinter",
            controls: [
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
    }

    constructor(par) {
        super(par, NavtexMode.props, 1000.0);
        this.unshiftOnSpace = false;
        this.shift = 170.0;
        this.rate = 100.0;
        this.state = RxSync1;
        this.bitcount = 0;
        this.code = 0;
        this.parityBit = false;
        this.bitMask = 0;

        /**
         * Since there is no start or stop bit, we must sync ourselves.
         * But syncing is very simple.  We shift the bits through four 7-bit
         * shift registers.  When all four have valid characters, we consider
         * it to be synced.
         */
        this.errs = 0;
        this.sync1 = 0;
        this.sync2 = 0;
        this.sync3 = 0;
        this.sync4 = 0;

        this.shifted = false;
        //Sitor-B is in either DX (data) or RX (repeat) mode
        this.dxMode = true;

        this.q3 = 0;
        this.q2 = 0;
        this.q1 = 0;

        this.lastChar = '@';
    }


    shift7(bit) {
        let a = (bit) ? 1 : 0;
        let b = (this.sync1 >> 6) & 1;
        this.sync1 = ((this.sync1 << 1) + a) & 0x7f;
        a = b;
        b = (this.sync2 >> 6) & 1;
        this.sync2 = ((this.sync2 << 1) + a) & 0x7f;
        a = b;
        b = (this.sync3 >> 6) & 1;
        this.sync3 = ((this.sync3 << 1) + a) & 0x7f;
        a = b;
        this.sync4 = ((this.sync4 << 1) + a) & 0x7f;
    }


    processBit(bit) {

        if (!this.isMiddleBit(bit)) {
            return;
        }

        switch (this.state) {
            case RxSync1 :
                //trace("RxSync1")
                this.state = RxSync2;
                this.bitcount = 0;
                this.code = 0;
                this.errs = 0;
                this.sync1 = 0;
                this.sync2 = 0;
                this.sync3 = 0;
                this.sync4 = 0;
                break;
            case RxSync2 :
                //trace("Rxthis.sync2")
                this.shift7(bit);
                //trace(this.sync1.toHexString + ", "+  this.sync2.toHexString + ", " +
                //     this.sync3.toHexString + ", " + this.sync4.toHexString);
                //trace("bit: " + bit);
                if (CCIR.isValid(this.sync1) && CCIR.isValid(this.sync2) &&
                    CCIR.isValid(this.sync3) && CCIR.isValid(this.sync4)) {
                    this.processCode(this.sync1);
                    this.processCode(this.sync2);
                    this.processCode(this.sync3);
                    this.processCode(this.sync4);
                    this.state = RxData;
                }
                break;
            case RxData :
                //trace("RxData");
                this.code = ((this.code << 1) + ((bit) ? 1 : 0)) & 0x7f;
                //trace("code: " + code);
                if (++this.bitcount >= 7) {
                    if (this.processCode(this.code) != ResultFail) { //we want Ok or Soft
                        //stay in RxData.  ready for next code
                        this.code = 0;
                        this.bitcount = 0;
                    } else {
                        this.code = 0;
                        this.bitcount = 0;
                        this.errs++;
                        if (this.errs > 3) {
                            this.state = RxSync1;
                            //trace("return to sync")
                        }
                    }
                }
                break;
            default:
        }//switch
    }


    qadd(v) {
        this.q3 = this.q2;
        this.q2 = this.q1;
        this.q1 = v;
    }

    processCode(code) {
        //trace("code: " + code.toHexString + " mode: " + dxMode)
        var res = ResultOk;
        if (this.code === CCIR.REPEAT) {
            this.qadd(this.code);
            this.shifted = false;
            this.dxMode = false;
        } else if (this.code === CCIR.ALPHA) {
            this.shifted = false;
            this.dxMode = true;
        } else {
            if (this.dxMode) {
                if (!CCIR.isValid(this.code))
                    res = ResultSoft;
                this.qadd(code); //dont think.  just queue it
                this.dxMode = false; //for next time
            } else { //symbol
                if (CCIR.isValid(this.code)) {
                    this.processCode2(this.code);
                } else {
                    if (CCIR.isValid(this.q3)) {
                        var c = this.processCode2(this.q3);
                        this.par.status("FEC replaced :" + c);
                        res = ResultSoft;
                    } else {
                        this.processCode2(-1);
                        res = ResultFail;
                    }
                }
                this.dxMode = true; // next time
            }//rxmode
        }//symbol
        return res;
    }


    processCode2(code) {
        let res = '@';
        if (code === 0) {
            //shouldnt happen
        } else if (code < 0) {
            //par.puttext("_");
            res = '_';
        } else if (code === CCIR.ALPHA || code === CCIR.REPEAT) {
            //shouldnt be here
        } else if (code === CCIR.LTRS) {
            this.shifted = false;
        } else if (code === CCIR.FIGS) {
            this.shifted = true;
        } else {
            let v = CCIR.t[code];
            if (v !== undefined) {
                var c = (this.shifted) ? v[1] : v[0];
                this.par.puttext(c);
                res = c;
            }
        }
        this.lastChar = res;
        return res;
    }

}// NavtexMode


export {NavtexMode};
