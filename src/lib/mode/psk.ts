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

import {Mode} from './mode';
import {Filter, FIR, Biquad} from '../filter';
import {Complex, ComplexOps} from '../complex';
import {Properties} from './mode';

/**
 * This contains the definitions of the bit patterns for the Varicode set
 * of characters.
 *
 * A 'from' and a 'to' table are also provided.
 */

 const descriptions = [
     '1010101011',  //   0  00  NUL Null character
     '1011011011',  //   1  01  SOH Start of Header
     '1011101101',  //   2  02  STX Start of Text
     '1101110111',  //   3  03  ETX End of Text
     '1011101011',  //   4  04  EOT End of Transmission
     '1101011111',  //   5  05  ENQ Enquiry
     '1011101111',  //   6  06  ACK Acknowledgment
     '1011111101',  //   7  07  BEL Bell
     '1011111111',  //   8  08  BS  Backspace
     '11101111',    //   9  09  HT  Horizontal Tab
     '11101',       //  10  0A  LF  Line feed
     '1101101111',  //  11  0B  VT  Vertical Tab
     '1011011101',  //  12  0C  FF  Form feed
     '11111',       //  13  0D  CR  Carriage return
     '1101110101',  //  14  0E  SO  Shift Out
     '1110101011',  //  15  0F  SI  Shift In
     '1011110111',  //  16  10  DLE Data Link Escape
     '1011110101',  //  17  11  DC1 Device Control 1 (XON)
     '1110101101',  //  18  12  DC2 Device Control 2
     '1110101111',  //  19  13  DC3 Device Control 3 (XOFF)
     '1101011011',  //  20  14  DC4 Device Control 4
     '1101101011',  //  21  15  NAK Negative Acknowledgement
     '1101101101',  //  22  16  SYN Synchronous Idle
     '1101010111',  //  23  17  ETB End of Trans. Block
     '1101111011',  //  24  18  CAN Cancel
     '1101111101',  //  25  19  EM  End of Medium
     '1110110111',  //  26  1A  SUB Substitute
     '1101010101',  //  27  1B  ESC Escape
     '1101011101',  //  28  1C  FS  File Separator
     '1110111011',  //  29  1D  GS  Group Separator
     '1011111011',  //  30  1E  RS  Record Separator
     '1101111111',  //  31  1F  US  Unit Separator
     '1',           //  32  20  SP
     '111111111',   //  33  21  !
     '101011111',   //  34  22  '
     '111110101',   //  35  23  #
     '111011011',   //  36  24  $
     '1011010101',  //  37  25  %
     '1010111011',  //  38  26  &
     '101111111',   //  39  27  '
     '11111011',    //  40  28  (
     '11110111',    //  41  29  )
     '101101111',   //  42  2A  *
     '111011111',   //  43  2B  +
     '1110101',     //  44  2C  ',
     '110101',      //  45  2D  -
     '1010111',     //  46  2E  .
     '110101111',   //  47  2F  /
     '10110111',    //  48  30  0
     '10111101',    //  49  31  1',  //
     '11101101',    //  50  32  2
     '11111111',    //  51  33  3
     '101110111',   //  52  34  4
     '101011011',   //  53  35  5
     '101101011',   //  54  36  6
     '110101101',   //  55  37  7
     '110101011',   //  56  38  8
     '110110111',   //  57  39  9
     '11110101',    //  58  3A  :
     '110111101',   //  59  3B  ;
     '111101101',   //  60  3C  <
     '1010101',     //  61  3D  =
     '111010111',   //  62  3E  >
     '1010101111',  //  63  3F  ?
     '1010111101',  //  64  40  @
     '1111101',     //  65  41  A
     '11101011',    //  66  42  B
     '10101101',    //  67  43  C
     '10110101',    //  68  44  D
     '1110111',     //  69  45  E
     '11011011',    //  70  46  F
     '11111101',    //  71  47  G
     '101010101',   //  72  48  H
     '1111111',     //  73  49  I
     '111111101',   //  74  4A  J
     '101111101',   //  75  4B  K
     '11010111',    //  76  4C  L
     '10111011',    //  77  4D  M
     '11011101',    //  78  4E  N
     '10101011',    //  79  4F  O
     '11010101',    //  80  50  P
     '111011101',   //  81  51  Q
     '10101111',    //  82  52  R
     '1101111',     //  83  53  S
     '1101101',     //  84  54  T
     '101010111',   //  85  55  U
     '110110101',   //  86  56  V
     '101011101',   //  87  57  W
     '101110101',   //  88  58  X
     '101111011',   //  89  59  Y
     '1010101101',  //  90  5A  Z
     '111110111',   //  91  5B  [
     '111101111',   //  92  5C  \
     '111111011',   //  93  5D  ]
     '1010111111',  //  94  5E  ^
     '101101101',   //  95  5F  _
     '1011011111',  //  96  60  `
     '1011',        //  97  61  a
     '1011111',     //  98  62  b
     '101111',      //  99  63  c
     '101101',      // 100  64  d
     '11',          // 101  65  e
     '111101',      // 102  66  f
     '1011011',     // 103  67  g
     '101011',      // 104  68  h
     '1101',        // 105  69  i
     '111101011',   // 106  6A  j
     '10111111',    // 107  6B  k
     '11011',       // 108  6C  l
     '111011',      // 109  6D  m
     '1111',        // 110  6E  n
     '111',         // 111  6F  o
     '111111',      // 112  70  p
     '110111111',   // 113  71  q
     '10101',       // 114  72  r
     '10111',       // 115  73  s
     '101',         // 116  74  t
     '110111',      // 117  75  u
     '1111011',     // 118  76  v
     '1101011',     // 119  77  w
     '11011111',    // 120  78  x
     '1011101',     // 121  79  y
     '111010101',   // 122  7A  z
     '1010110111',  // 123  7B  {
     '110111011',   // 124  7C  |
     '1010110101',  // 125  7D  }
     '1011010111',  // 126  7E  ~
     '1110110101'   // 127  7F  DEL  Delete
];

/**
 * this is a table of index->bit seqs.  Ex: 116('t') is Seq(true, false, true)
 */
const encodeTable = descriptions.map(s => {
      let chars = s.split('');
      let bools = chars.map(c => {
          return (c === '1');
      });
      return bools;
});


interface DecodeTable {
    [K: number]: number;
}

function createDecodeTable(): DecodeTable {
      let dec: DecodeTable = {};
      for (let i = 0; i < descriptions.length; i++) {
          let key = parseInt(descriptions[i], 2);
          dec[key] = i;
      }
      return dec;
}

const decodeTable: DecodeTable = createDecodeTable();

function printTables() {

      console.log('Encode Table =================');
      for (let i = 0; i < encodeTable.length; i++) {
          console.log('' + i + ' : ' + encodeTable[i].join(','));
      }
      console.log('Decode Table =================');
      let keys = Object.keys(decodeTable);
      keys.forEach(key => {
          let asc = decodeTable[key];
          console.log(key + ' : ' + asc);
      });
}


export interface Timer {
   update(z: Complex, f: (Complex) => void);
}

function createEarlyLate(samplesPerSymbol): Timer {
    let size = samplesPerSymbol | 0;
    let half = size >> 1;
    let buf = new Float32Array(size);
    let bitclk = 0.0;


    function update(z: Complex, f: (Complex) => void) {
        let idx = bitclk | 0;
        let sum = 0.0;
        let ampsum = 0.0;
        let mag = ComplexOps.mag(z);
        buf[idx] = 0.8 * buf[idx] + 0.2 * mag;

        for (let i = 0; i < half; i++) {
            sum += (buf[i] - buf[i + half]);
            ampsum += (buf[i] + buf[i + half]);
        }

        let err = (ampsum === 0.0) ? 0.0 : sum / ampsum * 0.2;

        bitclk += (1.0 - err);
        if (bitclk < 0) {
            bitclk += size;
        } else if (bitclk >= size) {
            bitclk -= size;
            f(z);
        }

    }

    return {
      update: update
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

    _timer: Timer;
    _bpf: Filter;
    _scopedata: number[][];
    _sctr: number;
    _qpskMode: boolean;
    _code: number;
    _lastv: number;
    _count: number;
    _lastBit: boolean;
    _txBuf: number[];
    _txPtr: number;

    constructor(par) {
        super(par);

        this._timer = createEarlyLate(this.samplesPerSymbol);
        this._bpf = FIR.bandpass(13, -0.7 * this.rate, 0.7 * this.rate, this.par.sampleRate);

        this._scopedata = new Array<number[]>(SSIZE);
        this._sctr = 0;
        this._qpskMode = false;

        // decoding
        this._code = 0;
        this._lastv = 0.0;
        this._count = 0;
        this._lastBit = false;

        // transmit
        this._txBuf = [];
        this._txPtr = 0;

        this._properties = {
            name: 'psk',
            tooltip: 'phase shift keying',
            controls: [
                {
                    name: 'rate',
                    type: 'choice',
                    tooltip: 'PSK data rate',
                    get value(): number {
                        return this.rate;
                    },
                    set value(v: number) {
                        this.rate = v;
                    },
                    options: [
                        {name: '31', value: 31.25},
                        {name: '63', value: 62.50},
                        {name: '125', value: 125.00}
                    ]
                },
                {
                    name: 'qpsk',
                    type: 'boolean',
                    tooltip: 'not yet implemented',
                    get value() {
                        return this.qpskMode;
                    },
                    set value(v) {
                        this.qpskMode = v;
                    }
                }
            ]
        };
    }

    _setRate(v) {
        super._setRate(v);
        this._timer = createEarlyLate(this.samplesPerSymbol);
        this._bpf = FIR.bandpass(13, -0.7 * v, 0.7 * v, this.par.sampleRate);
    }

    get bandwidth () {
        return this.rate;
    }

    receive(v) {
        let z = this._bpf.updatex(v);
        this.scopeOut(z);
        this._timer.update(z, vv => this.processSymbol(vv));
    }


    scopeOut(z) {
        this._scopedata[this._sctr++] = [Math.log(z.r + 1) * 30, Math.log(z.i + 1) * 30];
        if (this._sctr >= SSIZE) {
            this.par.showScope(this._scopedata);
            this._sctr = 0;
            this._scopedata = new Array(SSIZE);
        }
    }


    angleDiff(a, b) {
        let diff = a - b;
        while (diff > Math.PI) {
            diff -= TWOPI;
        }
        while (diff < -Math.PI) {
            diff += TWOPI;
        }
        return diff;
    }



    /**
     * Return the scaled distance of the angle v from 'from'.
     * Returns a positive value 0..255  for
     * 0 radians to +- pi
     */
    distance(v, from) {
        let diff = Math.PI - Math.abs(Math.abs(v - from) - Math.PI);
        return Math.floor(diff * diffScale);
    }




    processSymbol(v) {

        let vn, dv, d00, d01, d10, d11;

        if (this._qpskMode) {
            /**/
            vn = v.arg();
            dv = this.angleDiff(vn, this._lastv);
            d00 = this.distance(dv, Math.PI);
            d01 = this.distance(dv, HALFPI);
            d10 = this.distance(dv, -HALFPI);
            d11 = this.distance(dv, 0.0);
            let bm = [d00, d01, d10, d11];
            // println('%6.3f %6.3f %6.3f  :  %3d %3d %3d %3d'.format(lastv, vn, dv, d00, d01, d10, d11))
            let bits = null;  //  FIXME!!! this._decoder.decodeOne(bm);
            let len = bits.length;
            for (let i = 0; i < len; i++) {
                this.processBit(bits[i]);
            }
            this._lastv = vn;
            /**/
        } else { // bpsk
            /**/
            vn = v.arg();
            dv = this.angleDiff(vn, this._lastv);
            d00 = this.distance(dv, Math.PI);
            d11 = this.distance(dv, 0.0);
            // println('%6.3f %6.3f %6.3f  :  %3d %3d'.format(lastv, vn, dv, d00, d11))
            let bit = d11 < d00;
            this._lastv = vn;
            /**/
            this.processBit(bit);
        }
    }


    processBit(bit) {
        // println('bit: ' + bit)
        if ((!bit) && (!this._lastBit)) {
            this._code >>= 1;   // remove trailing 0
            if (this._code !== 0) {
                // println('code:' + Varicode.toString(code))
                let ascii = decodeTable[this._code];
                if (ascii) {
                    let chr = ascii;
                    if (chr === 10 || chr === 13) {
                        this.par.putText('\n');
                    } else {
                        this.par.putText(String.fromCharCode(chr));
                    }
                    this._code = 0;
                }
            }
            this._code = 0;
        } else {
            this._code <<= 1;
            if (bit) {
              this._code += 1;
            }
        }
        this._lastBit = bit;
    }

    // ###################
    // # transmit
    // ###################


    getNextTransmitBuffer(): number[] {
        // let ch = this.par.getText();
        return [];
    }

     transmit() {

        if (this._txPtr >= this._txBuf.length) {
            this._txBuf = this.getNextTransmitBuffer();
            this._txPtr = 0;
        }
        let txv = this._txBuf[this._txPtr++];
        return txv;
    }

}//  PskMode


const LOG = Math.log;

/**
 * Phase Shift Keying mode.
 */
class PskMode2 extends Mode {

    _ilp: Filter;
    _qlp: Filter;
    _symbollen: number;
    _halfSym: number;
    _lastSign: number;
    _samples: number;
    _scopedata: number[][];
    _sctr: number;
    _ssctr: number;
    _qpskMode: boolean;
    _code: number;
    _lastv: number;
    _count: number;
    _lastBit: boolean;
    _txBuf: number[];
    _txPtr: number;


    constructor(par) {
        super(par);
        this._ilp = null;
        this._qlp = null;
        this._symbollen = 0;
        this._halfSym = 0;

        // receive
        this._lastSign = -1;
        this._samples = 0;

        // scope
        this._scopedata = new Array(SSIZE);
        this._sctr = 0;
        this._ssctr = 0;

        this._qpskMode = false;

        this._code = 0;
        this._lastv = 0.0;
        this._count = 0;
        this._lastBit = false;

        // transmit
        this._txBuf = [];
        this._txPtr = 0;

        this.rate = 31.25;

        this._properties = {
            name: 'psk',
            tooltip: 'phase shift keying',
            controls: [
                {
                    name: 'rate',
                    type: 'choice',
                    get value(): number {
                        return this.rate;
                    },
                    set value(v: number) {
                        this.rate = v;
                    },
                    options: [
                        {name: '31', value: 31.25},
                        {name: '63', value: 62.50},
                        {name: '125', value: 125.00}
                    ]
                },
                {
                    name: 'qpsk',
                    type: 'boolean',
                    get value(): boolean {
                        return this.qpskMode;
                    },
                    set value(v: boolean) {
                        this.qpskMode = v;
                    }
                }
            ]
        };
    }

    get bandwidth () {
        return this.rate;
    }


    _setRate(v: number) {
        super._setRate(v);
        this._ilp = Biquad.lowPass(v * 0.5, this.par.sampleRate);
        this._qlp = Biquad.lowPass(v * 0.5, this.par.sampleRate);
        // bpf = FIR.bandpass(13, -0.7*this.getRate(), 0.7*this.getRate(), this.getSampleRate());
        this._symbollen = this.samplesPerSymbol | 0;
        this._halfSym = this._symbollen >> 1;
    }

    receive(z) {
        let i = this._ilp.update(z.r);
        let q = this._qlp.update(z.i);
        this.scopeOut(i, q);
        let sign = (i > 0) ? 1 : -1; // Math.sign() not on Chrome
        if (sign !== this._lastSign) {
            this._samples = 0;
        } else {
            this._samples++;
        }
        if ((this._samples % this._symbollen) === this._halfSym) {
            this.processSymbol(i, q);
            // processBit(sign>0);
        }
        this._lastSign = sign;
    }


    scopeOut(i, q) {
        if (!(++this._ssctr & 1)) {
           return; // skip items
        }
        this._scopedata[this._sctr++] = [LOG(i + 1) * 30.0, LOG(q + 1) * 30.0];
        if (this._sctr >= SSIZE) {
            this.par.showScope(this._scopedata);
            this._sctr = 0;
            this._scopedata = new Array(SSIZE);
        }
    }



     angleDiff(a, b) {
        let diff = a - b;
        while (diff > Math.PI) {
            diff -= TWOPI;
        }
        while (diff < -Math.PI) {
            diff += TWOPI;
        }
        return diff;
    }

    /**
     * Return the scaled distance of the angle v from 'from'.
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

        if (this._qpskMode) {
            /**/
            dv = this.angleDiff(vn, this._lastv);
            d00 = this.distance(dv, Math.PI);
            d01 = this.distance(dv, HALFPI);
            d10 = this.distance(dv, -HALFPI);
            d11 = this.distance(dv, 0.0);
            let bm = [d00, d01, d10, d11];
            // println('%6.3f %6.3f %6.3f  :  %3d %3d %3d %3d'.format(lastv, vn, dv, d00, d01, d10, d11))
            let bits = null;  //  FIXME!!  this._decoder.decodeOne(bm);
            let len = bits.length;
            for (let idx = 0; idx < len; idx++) {
                this.processBit(bits[idx]);
            }
            this._lastv = vn;
            /**/
        } else { // bpsk
            /**/
            dv = this.angleDiff(vn, this._lastv);
            d00 = this.distance(dv, Math.PI);
            d11 = this.distance(dv, 0.0);
            // println('%6.3f %6.3f %6.3f  :  %3d %3d'.format(lastv, vn, dv, d00, d11))
            let bit = d11 < d00;
            this._lastv = vn;
            /**/
            this.processBit(bit);
        }
    }


    processBit(bit) {
        // println('bit: ' + bit)
        if ((!bit) && (!this._lastBit)) {
            this._code >>= 1;   // remove trailing 0
            if (this._code !== 0) {
                // println('code:' + Varicode.toString(code))
                let ascii = decodeTable[this._code];
                if (ascii) {
                    let chr = ascii;
                    if (chr === 10 || chr === 13) {
                        this.par.putText('\n');
                    } else {
                        this.par.putText(String.fromCharCode(chr));
                    }
                    this._code = 0;
                }
            }
            this._code = 0;
        } else {
            this._code <<= 1;
            if (bit) {
              this._code += 1;
            }
        }
        this._lastBit = bit;
    }

    // ###################
    // # transmit
    // ###################


    getNextTransmitBuffer():number[] {
        let ch = this.par.getText();
        return [];
    }


    transmit() {

        if (this._txPtr >= this._txBuf.length) {
            this._txBuf = this.getNextTransmitBuffer();
            this._txPtr = 0;
        }
        let txv = this._txBuf[this._txPtr++];
        return txv;
    }

}//  PskMode2


export {PskMode, PskMode2};
