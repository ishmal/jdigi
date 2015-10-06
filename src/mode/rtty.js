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

import {FskBase} from "./fsk";
import {FIR} from "../filter";


/**
 * These are the ITU codes for 5-bit Baudot code and 7-bit SITOR
 * in the same table
 */
const Baudot = {

    t: [
        [0, 0], // 0x00 NUL
        ['E', '3'], // 0x01
        ['\n', '\n'], // 0x02 LF
        ['A', '-'], // 0x03
        [' ', ' '], // 0x04 SPACE
        ['S', '\''], // 0x05
        ['I', '8'], // 0x06
        ['U', '7'], // 0x07
        ['\n', '\n'], // 0x08 CR
        ['D', '$'], // 0x09
        ['R', '4'], // 0x0a
        ['J', 7], // 0x0b 7=bell
        ['N', ','], // 0x0c
        ['F', '!'], // 0x0d
        ['C', ':'], // 0x0e
        ['K', '['], // 0x0f
        ['T', '5'], // 0x10
        ['Z', '+'], // 0x11
        ['L', ']'], // 0x12
        ['W', '2'], // 0x13
        ['H', '#'], // 0x14
        ['Y', '6'], // 0x15
        ['P', '0'], // 0x16
        ['Q', '1'], // 0x17
        ['O', '9'], // 0x18
        ['B', '?'], // 0x19
        ['G', '&'], // 0x1a
        [0, 0], // 0x1b FIGS
        ['M', '.'], // 0x1c
        ['X', '/'], // 0x1d
        ['V', '='], // 0x1e
        [0, 0]  // 0x1f LTRS
    ],
    NUL: 0x00,
    SPACE: 0x04,
    CR: 0x08,
    LF: 0x02,
    LTRS: 0x1f,
    FIGS: 0x1b
};

const NRBITS = 5;

/**
 * Enumerations for parity types
 */
const ParityNone = 0;
const ParityOne = 1;
const ParityZero = 2;
const ParityOdd = 3;
const ParityEven = 4;

const RxIdle = 0;
const RxStart = 1;
const RxData = 2;
const RxStop = 3;
const RxParity = 4;


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
class RttyMode extends FskBase {

    static props(self) {
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
                        {name: "45", value: 45.45},
                        {name: "50", value: 50.00},
                        {name: "75", value: 75.00},
                        {name: "100", value: 100.00}
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
                        {name: "85", value: 85.0},
                        {name: "170", value: 170.0},
                        {name: "450", value: 450.0},
                        {name: "850", value: 850.0}
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
    }

    constructor(par) {
        super(par, RttyMode.props, 1000.0);
        this.unshiftOnSpace = false;
        this.symbollen = 0;
        this.halfsym = 0;
        this.symarray = 0;
        this.symptr = 0;
        this.rate = 45.45;
        this.parityType = ParityNone;
        this.state = RxIdle;
        this.bitcount = 0;
        this.code = 0;
        this.parityBit = false;
        this.counter = 0;
        this.msbit = 1 << (NRBITS - 1);
        this.shifted = false;
    }


    setRate(v) {
        super.rate = v;
        this.symbollen = Math.round(this.samplesPerSymbol);
        this.halfsym = this.symbollen >> 1;
        this.symarray = new Array(this.symbollen);
        for (let pp = 0; pp < this.symbollen; pp++) {
            this.symarray[pp] = false;
        }
    }


    static countbits(n) {
        let c = 0;
        while (n) {
            n &= n - 1;
            c++;
        }
        return c;
    }

    parityOf(c) {
        switch (this.parityType) {
            case ParityOdd  :
                return (countbits(c) & 1) !== 0;
            case ParityEven :
                return (countbits(c) & 1) === 0;
            case ParityZero :
                return false;
            case ParityOne  :
                return true;
            default         :
                return false;   //None or unknown
        }
    }


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
    processBit(bit) {

        symarray[symptr++] = bit;
        symptr %= symbollen;
        this.last = symarray[symptr];
        this.isMarkToSpace = false;
        this.corr = 0;
        this.ptr = symptr;
        this.sum = 0;
        for (this.pp = 0; pp < symbollen; pp++) {
            sum += symarray[ptr++];
            ptr %= symbollen;
        }
        this.isMark = (sum > halfsym);
        if (last && !bit) {
            if (Math.abs(halfsym - sum) < 6) {
                isMarkToSpace = true;
                corr = sum;
            }
        }

        switch (state) {

            case RxIdle :
                //console.log("RxIdle");
                if (isMarkToSpace) {
                    state = RxStart;
                    counter = corr; //lets us re-center
                }
                break;
            case RxStart :
                //console.log("RxStart");
                if (--counter <= 0) {
                    if (!isMark) {
                        state = RxData;
                        code = 0 | 0;
                        parityBit = false;
                        bitcount = 0;
                        counter = symbollen;
                    } else {
                        state = RxIdle;
                    }
                }
                break;
            case RxData :
                //console.log("RxData");
                if (--counter <= 0) {
                    counter = symbollen;
                    //code = (code<<1) + isMark; //msb
                    code = ((code >>> 1) + ((isMark) ? msbit : 0)) | 0; //lsb
                    if (++bitcount >= NRBITS) {
                        state = (parityType === ParityNone) ? RxStop : RxParity;
                    }
                }
                break;
            case RxParity :
                //console.log("RxParity");
                if (--counter <= 0) {
                    state = RxStop;
                    parityBit = isMark;
                }
                break;
            case RxStop :
                //console.log("RxStop");
                if (--counter <= 0) {
                    if (isMark) {
                        outCode(code);
                    }
                    state = RxIdle;
                }
                break;
        }
    } // processBit


    reverse(v, size) {
        let a = v;
        let b = 0;
        while (size--) {
            b += a & 1;
            b <<= 1;
            a >>= 1;
        }
        return b;
    }

    outCode(rawcode) {
        //println("raw:" + rawcode)
        //rawcode = reverse(rawcode, 5);
        this.code = rawcode & 0x1f;
        if (code === Baudot.NUL) {
        } else if (code === Baudot.FIGS) {
            this.shifted = true;
        } else if (code === Baudot.LTRS) {
            this.shifted = false;
        } else if (code === Baudot.SPACE) {
            this.par.puttext(" ");
            if (this.unshiftOnSpace)
                this.shifted = false;
        } else if (code === Baudot.CR || code === Baudot.LF) {
            this.par.puttext("\n");
            if (this.unshiftOnSpace)
                this.shifted = false;
        } else {
            this.v = Baudot.t[code];
            if (v) {
                this.c = (this.shifted) ? v[1] : v[0];
                if (c !== 0)
                    this.par.puttext(c);
            }
        }
    }

    //################################################
    //# T R A N S M I T
    //################################################
    /*
     this.txShifted = false;
     function txencode(str) {
     this.buf = [];
     this.chars = str.split("");
     this.len = chars.length;
     for (this.cn=0 ; cn<len ; cn++) {
     this.c = chars[cn];
     if (c === ' ')
     buf.push(SPACE);
     else if (c === '\n')
     buf.push(LF);
     else if (c === '\r')
     buf.push(CR);
     else {
     this.uc = c.toUpper;
     this.code = Baudot.baudLtrsToCode[uc];
     if (code) {
     if (txShifted) {
     txShifted = false;
     buf.push(LTRS);
     }
     buf.push(code)
     } else {
     code = Baudot.baudFigsToCode[uc];
     if (code) {  //check for zero?
     if (!txShifted) {
     txShifted = true;
     buf.push(FIGS);
     }
     buf.push(code);
     }
     }
     }
     }
     return buf;
     }

     function txnext() {
     //this.str = "the quick brown fox 1a2b3c4d"
     this.str = par.gettext;
     this.codes = txencode(str);
     return codes;
     }


     this.desiredOutput = 4096;

     */
    /**
     * Overridden from Mode.  This method is called by
     * the audio interface when it needs a fresh buffer
     * of sampled audio data at its sample rate.  If the
     * mode has no current data, then it should send padding
     * in the form of what is considered to be an "idle" signal
     */
    /*
     this.transmit = function() {

     this.symbollen = samplesPerSymbol;
     this.buf = [];
     this.codes = txnext();
     this.len = codes.length;
     for (this.idx = 0 ; idx < len ; idx++) {
     this.code = codes[i];
     for (this.s=0 ; s<symbollen ; s++) buf.push(spaceFreq);
     this.mask = 1;
     for (this.ib=0 ; ib < 5 ; ib++) {
     this.bit = (code & mask) === 0;
     this.f = (bit) ? spaceFreq : markFreq;
     for (j=0 ; j < symbollen ; j++) buf.push(f);
     mask <<= 1;
     }
     for (this.s2=0 ; s2<symbollen ; s2++) buf.push(spaceFreq);
     }

     this.pad = desiredOutput - buf.length;
     while (pad--)
     buf.push(spaceFreq);
     //this.res = buf.toArray.map(txlpf.update)
     //todo
     };
     */

}// RttyMode


export {RttyMode};
