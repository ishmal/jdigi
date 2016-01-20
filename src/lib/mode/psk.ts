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

import {Mode} from "./mode";
import {FIR, Biquad} from "../filter";


/**
 * This contains the definitions of the bit patterns for the Varicode set
 * of characters.
 *
 * A "from" and a "to" table are also provided.
 */
var Varicode = (function () {

    var description = [
        "1010101011",  //  0  00  NUL Null character
        "1011011011",  //  1  01  SOH Start of Header
        "1011101101",  //  2  02  STX Start of Text
        "1101110111",  //  3  03  ETX End of Text
        "1011101011",  //  4  04  EOT End of Transmission
        "1101011111",  //  5  05  ENQ Enquiry
        "1011101111",  //  6  06  ACK Acknowledgment
        "1011111101",  //  7  07  BEL Bell
        "1011111111",  //  8  08  BS  Backspace
        "11101111",    //  9  09  HT  Horizontal Tab
        "11101",       // 10  0A  LF  Line feed
        "1101101111",  // 11  0B  VT  Vertical Tab
        "1011011101",  // 12  0C  FF  Form feed
        "11111",       // 13  0D  CR  Carriage return
        "1101110101",  // 14  0E  SO  Shift Out
        "1110101011",  // 15  0F  SI  Shift In
        "1011110111",  // 16  10  DLE Data Link Escape
        "1011110101",  // 17  11  DC1 Device Control 1 (XON)
        "1110101101",  // 18  12  DC2 Device Control 2
        "1110101111",  // 19  13  DC3 Device Control 3 (XOFF)
        "1101011011",  // 20  14  DC4 Device Control 4
        "1101101011",  // 21  15  NAK Negative Acknowledgement
        "1101101101",  // 22  16  SYN Synchronous Idle
        "1101010111",  // 23  17  ETB End of Trans. Block
        "1101111011",  // 24  18  CAN Cancel
        "1101111101",  // 25  19  EM  End of Medium
        "1110110111",  // 26  1A  SUB Substitute
        "1101010101",  // 27  1B  ESC Escape
        "1101011101",  // 28  1C  FS  File Separator
        "1110111011",  // 29  1D  GS  Group Separator
        "1011111011",  // 30  1E  RS  Record Separator
        "1101111111",  // 31  1F  US  Unit Separator
        "1",           // 32  20  SP
        "111111111",   // 33  21  !
        "101011111",   // 34  22  "
        "111110101",   // 35  23  #
        "111011011",   // 36  24  $
        "1011010101",  // 37  25  %
        "1010111011",  // 38  26  &
        "101111111",   // 39  27  '
        "11111011",    // 40  28  (
        "11110111",    // 41  29  )
        "101101111",   // 42  2A  *
        "111011111",   // 43  2B  +
        "1110101",     // 44  2C  ",
        "110101",      // 45  2D  -
        "1010111",     // 46  2E  .
        "110101111",   // 47  2F  /
        "10110111",    // 48  30  0
        "10111101",    // 49  31  1",  //
        "11101101",    // 50  32  2
        "11111111",    // 51  33  3
        "101110111",   // 52  34  4
        "101011011",   // 53  35  5
        "101101011",   // 54  36  6
        "110101101",   // 55  37  7
        "110101011",   // 56  38  8
        "110110111",   // 57  39  9
        "11110101",    // 58  3A  :
        "110111101",   // 59  3B  ;
        "111101101",   // 60  3C  <
        "1010101",     // 61  3D  =
        "111010111",   // 62  3E  >
        "1010101111",  // 63  3F  ?
        "1010111101",  // 64  40  @
        "1111101",     // 65  41  A
        "11101011",    // 66  42  B
        "10101101",    // 67  43  C
        "10110101",    // 68  44  D
        "1110111",     // 69  45  E
        "11011011",    // 70  46  F
        "11111101",    // 71  47  G
        "101010101",   // 72  48  H
        "1111111",     // 73  49  I
        "111111101",   // 74  4A  J
        "101111101",   // 75  4B  K
        "11010111",    // 76  4C  L
        "10111011",    // 77  4D  M
        "11011101",    // 78  4E  N
        "10101011",    // 79  4F  O
        "11010101",    // 80  50  P
        "111011101",   // 81  51  Q
        "10101111",    // 82  52  R
        "1101111",     // 83  53  S
        "1101101",     // 84  54  T
        "101010111",   // 85  55  U
        "110110101",   // 86  56  V
        "101011101",   // 87  57  W
        "101110101",   // 88  58  X
        "101111011",   // 89  59  Y
        "1010101101",  // 90  5A  Z
        "111110111",   // 91  5B  [
        "111101111",   // 92  5C  \
        "111111011",   // 93  5D  ]
        "1010111111",  // 94  5E  ^
        "101101101",   // 95  5F  _
        "1011011111",  // 96  60  `
        "1011",        // 97  61  a
        "1011111",     // 98  62  b
        "101111",      // 99  63  c
        "101101",      //100  64  d
        "11",          //101  65  e
        "111101",      //102  66  f
        "1011011",     //103  67  g
        "101011",      //104  68  h
        "1101",        //105  69  i
        "111101011",   //106  6A  j
        "10111111",    //107  6B  k
        "11011",       //108  6C  l
        "111011",      //109  6D  m
        "1111",        //110  6E  n
        "111",         //111  6F  o
        "111111",      //112  70  p
        "110111111",   //113  71  q
        "10101",       //114  72  r
        "10111",       //115  73  s
        "101",         //116  74  t
        "110111",      //117  75  u
        "1111011",     //118  76  v
        "1101011",     //119  77  w
        "11011111",    //120  78  x
        "1011101",     //121  79  y
        "111010101",   //122  7A  z
        "1010110111",  //123  7B  {
        "110111011",   //124  7C  |
        "1010110101",  //125  7D  }
        "1011010111",  //126  7E  ~
        "1110110101"   //127  7F  DEL  Delete
    ];


    var cls = {

        /**
         * this is a table of index->bit seqs.  Ex: 116('t') is Seq(true, false, true)
         */
        encodeTable: description.map(function (s) {
            var chars = s.split("");
            var bools = chars.map(function (c) {
                return (c === '1');
            });
            return bools;
        }),


        decodeTable: (function () {
            var dec = {};
            for (var i = 0; i < description.length; i++) {
                var key = parseInt(description[i], 2);
                dec[key] = i;
            }
            return dec;
        })(),

        printTables: function () {

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
    };//cls

    return cls;

})(); // Varicode


function EarlyLate(samplesPerSymbol) {
    var size = samplesPerSymbol | 0;
    var half = size >> 1;
    var buf = new Float32Array(size);
    var bitclk = 0.0;

    this.update = function (z, f) {
        var idx = bitclk | 0;
        var sum = 0.0;
        var ampsum = 0.0;
        var mag = z.mag();
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

    };
}


const SSIZE = 200;
const diffScale = 255.0 / Math.PI;
const TWOPI = Math.PI * 2.0;
const HALFPI = Math.PI * 0.5;

/**
 * Phase Shift Keying mode.
 */
class PskMode extends Mode {

    static props(self) {
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
                        {name: "31", value: 31.25},
                        {name: "63", value: 62.50},
                        {name: "125", value: 125.00}
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
    }

    constructor(par) {
        super(par, PskMode.props, 2000);
        this.timer = new EarlyLate(this.samplesPerSymbol);
        this.bpf = FIR.bandpass(13, -0.7 * this.rate, 0.7 * this.rate, this.sampleRate);

        this.scopedata = new Array(SSIZE);
        this.sctr = 0;
        this.qpskMode = false;

        //decoding
        this.code = 0;
        this.lastv = 0.0;
        this.count = 0;
        this.lastBit = false;

        //transmit
        this.txBuf = [];
        this.txPtr = 0;

    }


    set rate(v) {
        super.rate = v;
        this.timer = new EarlyLate(this.samplesPerSymbol);
        this.bpf = FIR.bandpass(13, -0.7 * v, 0.7 * v, this.sampleRate);
    }

    get rate() {
        return super.rate;
    }

    get bandwidth () {
        return this.rate;
    }

    receive(v) {
        let z = bpf.updatex(v);
        this.scopeOut(z);
        this.timer.update(z, vv => this.processSymbol(vv));
    }


    scopeOut(z) {
        this.scopedata[this.sctr++] = [log(z.r + 1) * 30, log(z.i + 1) * 30];
        if (this.sctr >= SSIZE) {
            this.par.showScope(this.scopedata);
            this.sctr = 0;
            this.scopedata = new Array(SSIZE);
        }
    }


    angleDiff(a, b) {
        let diff = a - b;
        while (diff > Math.PI)
            diff -= TWOPI;
        while (diff < -Math.PI)
            diff += TWOPI;
        //println("%f %f %f".format(a, b, diff))
        return diff;
    }



    /**
     * Return the scaled distance of the angle v from "from".
     * Returns a positive value 0..255  for
     * 0 radians to +- pi
     */
    distance(v, from) {
        var diff = Math.PI - Math.abs(Math.abs(v - from) - Math.PI);
        return Math.floor(diff * diffScale);
    }




    processSymbol(v) {

        var vn, dv, d00, d01, d10, d11;

        if (this.qpskMode) {
            /**/
            vn = v.arg();
            dv = this.angleDiff(vn, this.lastv);
            d00 = this.distance(dv, Math.PI);
            d01 = this.distance(dv, halfpi);
            d10 = this.distance(dv, -halfpi);
            d11 = this.distance(dv, 0.0);
            let bm = [d00, d01, d10, d11];
            //println("%6.3f %6.3f %6.3f  :  %3d %3d %3d %3d".format(lastv, vn, dv, d00, d01, d10, d11))
            let bits = this.decoder.decodeOne(bm);
            let len = bits.length;
            for (let i = 0; i < len; i++)
                this.processBit(bits[i]);
            this.lastv = vn;
            /**/
        } else { //bpsk
            /**/
            vn = v.arg();
            dv = this.angleDiff(vn, this.lastv);
            d00 = this.distance(dv, Math.PI);
            d11 = this.distance(dv, 0.0);
            //println("%6.3f %6.3f %6.3f  :  %3d %3d".format(lastv, vn, dv, d00, d11))
            let bit = d11 < d00;
            this.lastv = vn;
            /**/
            this.processBit(bit);
        }
    }


    processBit(bit) {
        //println("bit: " + bit)
        if ((!bit) && (!this.lastBit)) {
            this.code >>= 1;   //remove trailing 0
            if (this.code !== 0) {
                //println("code:" + Varicode.toString(code))
                var ascii = Varicode.decodeTable[code];
                if (ascii) {
                    var chr = ascii;
                    if (chr == 10 || chr == 13)
                        this.par.puttext("\n");
                    else
                        this.par.puttext(String.fromCharCode(chr));
                    this.code = 0;
                }
            }
            this.code = 0;
        }
        else {
            this.code <<= 1;
            if (bit) this.code += 1;
        }
        this.lastBit = bit;
    }

    //###################
    //# transmit
    //###################


    getNextTransmitBuffer() {
        let ch = par.gettext();
        if (tx < 0) {

        } else {


        }

    }

     transmit() {

        if (this.txPtr >= this.txBuf.length) {
            this.txBuf = getNextTransmitBuffer();
            this.txPtr = 0;
        }
        let txv = this.txBuf[tthis.xPtr++];
        return txv;
    }

}// PskMode




/**
 * Phase Shift Keying mode.
 */
class PskMode2 extends Mode {

    static props(self) {
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
                        {name: "31", value: 31.25},
                        {name: "63", value: 62.50},
                        {name: "125", value: 125.00}
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
    }


    constructor(par) {
        super(par, PskMode2.props, 1000);
        this.ilp = null;
        this.qlp = null;
        this.symbollen = 0;
        this.halfSym = 0;

        //receive
        this.lastSign = -1;
        this.samples = 0;

        //scope
        this.scopedata = new Array(SSIZE);
        this.sctr = 0;
        this.log = Math.log;
        this.ssctr = 0;

        this.qpskMode = false;

        this.code = 0;
        this.lastv = 0.0;
        this.count = 0;
        this.lastBit = false;

        //transmit
        this.txBuf = [];
        this.txPtr = 0;

        this.rate = 31.25;
    }


    get bandwidth () {
        return this.rate;
    }


    set rate(v) {
        super.rate = v;
        this.ilp = Biquad.lowPass(v * 0.5, this.sampleRate);
        this.qlp = Biquad.lowPass(v * 0.5, this.sampleRate);
        //bpf = FIR.bandpass(13, -0.7*this.getRate(), 0.7*this.getRate(), this.getSampleRate());
        this.symbollen = this.samplesPerSymbol | 0;
        this.halfSym = this.symbollen >> 1;
    }

    get rate() {
        return super.rate;
    }


    receive(z) {
        let i = this.ilp.update(z.r);
        let q = this.qlp.update(z.i);
        this.scopeOut(i, q);
        let sign = (i > 0) ? 1 : -1; //Math.sign() not on Chrome
        if (sign != this.lastSign) {
            this.samples = 0;
        } else {
            this.samples++;
        }
        if ((this.samples % this.symbollen) === this.halfSym) {
            processSymbol(i, q);
            //processBit(sign>0);
        }
        this.lastSign = sign;
    }


    scopeOut(i, q) {
        if (!(++ssctr & 1)) return; //skip items
        this.scopedata[this.sctr++] = [log(i + 1) * 30.0, log(q + 1) * 30.0];
        if (this.sctr >= SSIZE) {
            this.par.showScope(this.scopedata);
            this.sctr = 0;
            this.scopedata = new Array(SSIZE);
        }
    }



     angleDiff(a, b) {
        let diff = a - b;
        while (diff > Math.PI)
            diff -= TWOPI;
        while (diff < -Math.PI)
            diff += TWOPI;
        //println("%f %f %f".format(a, b, diff))
        return diff;
    }

    /**
     * Return the scaled distance of the angle v from "from".
     * Returns a positive value 0..255  for
     * 0 radians to +- pi
     */
    distance(v, from) {
        let diff = Math.PI - Math.abs(Math.abs(v - from) - Math.PI);
        return Math.floor(diff * diffScale);
    }



    processSymbol(i, q) {

        let dv, d00, d01, d10, d11;

        let vn = Math.atan2(q, i);

        if (this.qpskMode) {
            /**/
            dv = this.angleDiff(vn, lastv);
            d00 = this.distance(dv, Math.PI);
            d01 = this.distance(dv, halfpi);
            d10 = this.distance(dv, -halfpi);
            d11 = this.distance(dv, 0.0);
            let bm = [d00, d01, d10, d11];
            //println("%6.3f %6.3f %6.3f  :  %3d %3d %3d %3d".format(lastv, vn, dv, d00, d01, d10, d11))
            let bits = this.decoder.decodeOne(bm);
            let len = bits.length;
            for (let idx = 0; idx < len; idx++)
                this.processBit(bits[idx]);
            this.lastv = vn;
            /**/
        } else { //bpsk
            /**/
            dv = this.angleDiff(vn, this.lastv);
            d00 = this.distance(dv, Math.PI);
            d11 = this.distance(dv, 0.0);
            //println("%6.3f %6.3f %6.3f  :  %3d %3d".format(lastv, vn, dv, d00, d11))
            let bit = d11 < d00;
            this.lastv = vn;
            /**/
            this.processBit(bit);
        }
    }


    processBit(bit) {
        //println("bit: " + bit)
        if ((!bit) && (!this.lastBit)) {
            this.code >>= 1;   //remove trailing 0
            if (this.code !== 0) {
                //println("code:" + Varicode.toString(code))
                let ascii = Varicode.decodeTable[code];
                if (ascii) {
                    let chr = ascii;
                    if (chr == 10 || chr == 13)
                        par.puttext("\n");
                    else
                        par.puttext(String.fromCharCode(chr));
                    this.code = 0;
                }
            }
            this.code = 0;
        }
        else {
            this.code <<= 1;
            if (bit) this.code += 1;
        }
        this.lastBit = bit;
    }

    //###################
    //# transmit
    //###################


    getNextTransmitBuffer() {
        let ch = this.par.gettext();
        if (tx < 0) {

        } else {


        }

    }


    transmit() {

        if (this.txPtr >= this.txBuf.length) {
            this.txBuf = getNextTransmitBuffer();
            this.txPtr = 0;
        }
        let txv = this.txBuf[this.txPtr++];
        return txv;
    }

}// PskMode2


export {PskMode,PskMode2};

