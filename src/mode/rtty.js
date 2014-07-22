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

import {FskBase} from "./fsk";
import {FIR} from "../filter";



/**
 * These are the ITU codes for 5-bit Baudot code and 7-bit SITOR
 * in the same table
 */
var Baudot = {

    t : [
        [  0,    0], // 0x00 NUL
        ['E',  '3'], // 0x01
        ['\n','\n'], // 0x02 LF
        ['A',  '-'], // 0x03
        [' ',  ' '], // 0x04 SPACE
        ['S', '\''], // 0x05
        ['I',  '8'], // 0x06
        ['U',  '7'], // 0x07
        ['\n','\n'], // 0x08 CR
        ['D',  '$'], // 0x09
        ['R',  '4'], // 0x0a
        ['J',    7], // 0x0b 7=bell
        ['N',  ','], // 0x0c
        ['F',  '!'], // 0x0d
        ['C',  ':'], // 0x0e
        ['K',  '['], // 0x0f
        ['T',  '5'], // 0x10
        ['Z',  '+'], // 0x11
        ['L',  ']'], // 0x12
        ['W',  '2'], // 0x13
        ['H',  '#'], // 0x14
        ['Y',  '6'], // 0x15
        ['P',  '0'], // 0x16
        ['Q',  '1'], // 0x17
        ['O',  '9'], // 0x18
        ['B',  '?'], // 0x19
        ['G',  '&'], // 0x1a
        [  0,    0], // 0x1b FIGS   
        ['M',  '.'], // 0x1c
        ['X',  '/'], // 0x1d
        ['V',  '='], // 0x1e
        [  0,    0]  // 0x1f LTRS
    ],
    NUL   : 0x00,
    SPACE : 0x04,
    CR    : 0x08,
    LF    : 0x02,
    LTRS  : 0x1f,
    FIGS  : 0x1b
};


/**
 * Enumerations for parity types
 */
var ParityNone = 0;
var ParityOne  = 1;
var ParityZero = 2;
var ParityOdd  = 3;
var ParityEven = 4;



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
function RttyMode(par) {
    var self = this;

    var props = {
        name: "rtty",
        tooltip: "radio teletype",
        controls : [
            {
            name: "rate",
            type: "choice",
            tooltip: "rtty baud rate",
            get value() { return self.getRate(); },
            set value(v) { self.setRate(parseFloat(v)); },
            values : [
                { name :  "45", value :  45.45 },
                { name :  "50", value :  50.00 },
                { name :  "75", value :  75.00 },
                { name : "100", value : 100.00 }
                ]
            },
            {
            name: "shift",
            type: "choice",
            tooltip: "frequency distance between mark and space",
            get value() { return self.getShift(); },
            set value(v) { self.setShift(parseFloat(v)); },
            values : [
                { name :  "85", value :  85.0 },
                { name : "170", value : 170.0 },
                { name : "450", value : 450.0 },
                { name : "850", value : 850.0 }
                ]
             },
            {
            name: "inv",
            type: "boolean",
            get value() { return self.getInverted(); },
            set value(v) { self.setInverted(v); }
            },
            {
            name: "UoS",
            type: "boolean",
            get value() { return self.getUnshiftOnSpace(); },
            set value(v) { self.setUnshiftOnSpace(v); }
            }
        ]
    };
    FskBase.call(this, par, props, 1000.0);

    var unshiftOnSpace = false;
    this.getUnshiftOnSpace = function() {
        return unshiftOnSpace;
    };
    this.setUnshiftOnSpace = function(v) {
        unshiftOnSpace = v;
    };

    this.setRate(45.0); //makes all rate/shift dependent vars initialize

    var parityType = ParityNone;

    function countbits(n) {
        var c = 0;
        while (n) {
            n &= n-1;
            c++;
        }
        return c;
    }

    function parityOf(c) {
        switch (parityType) {
            case ParityOdd  : return (countbits(c) & 1) !== 0;
            case ParityEven : return (countbits(c) & 1) === 0;
            case ParityZero : return false;
            case ParityOne  : return true;
            default         : return false;   //None or unknown
        }
    }


    var RxIdle   = 0;
    var RxStart  = 1;
    var RxData   = 2;
    var RxStop   = 3;
    var RxParity = 4;

    var state     = RxIdle;
    var bitcount  = 0;
    var code      = 0;
    var parityBit = false;
    var counter   = 0;

    this.processBit = function(bit, parms) {

        var symbollen = parms.symbollen;
        
        switch (state) {

            case RxIdle :
                //console.log("RxIdle");
                if (parms.isMarkToSpace) {
                    state     = RxStart;
                    counter   = parms.corr; //minor shift left or right
                }
                break;
            case RxStart :
                //console.log("RxStart");
                if (--counter <= 0) {
					if (!bit) {
						state     = RxData;
						code      = 0;
						parityBit = false;
						bitcount  = 0;
						counter   = symbollen;
					} else {
					    state = RxIdle;
					}
                }
                break;
            case RxData :
                //console.log("RxData");
                if (--counter <= 0) {
                    counter = symbollen;
                    code = (code<<1) | bit;
                    if (++bitcount >= 5) {
                        state = (parityType === ParityNone) ? RxStop : RxParity;
                    }
                }
                break;
            case RxParity :
                //console.log("RxParity");
                if (--counter <= 0) {
					state     = RxStop;
					parityBit = bit;
                }
                break;
            case RxStop :
                //console.log("RxStop");
                if (--counter <= 0) {
                    if (bit) {
                        outCode(code);
                    }
                state = RxIdle;
                }
                break;
            }
    }; // processBit
    
    

    var shifted = false;

    function reverse(v, size) {
        var a = v;
        var b = 0;
        while (size--) {
            b += a & 1;
            b <<= 1;
            a >>= 1;
        }
        return b;
    }

    //cache a copy of these here
    var NUL   = Baudot.NUL;
    var SPACE = Baudot.SPACE;
    var CR    = Baudot.CR;
    var LF    = Baudot.LF;
    var LTRS  = Baudot.LTRS;
    var FIGS  = Baudot.FIGS;
    
    var table = Baudot.t;

    function outCode(rawcode) {
        //println("raw:" + rawcode)
        var code = rawcode & 0x1f;
        if (code === NUL) {
        } else if (code === FIGS) {
            shifted = true;
        } else if (code === LTRS) {
            shifted = false;
        } else if (code === SPACE) {
            par.puttext(" ");
            if (self.unshiftOnSpace)
                shifted = false;
        } else if (code === CR || code === LF) {
            par.puttext("\n");
            if (self.unshiftOnSpace)
                shifted = false;
        } else {
            var v = table[code];
            if (v) {
                var c = (shifted) ? v[1] : v[0];
                if (c !== 0)
                    par.puttext(c);
            }
        }
    }

    //################################################
    //# T R A N S M I T
    //################################################
    /*
    var txShifted = false;
    function txencode(str) {
        var buf = [];
        var chars = str.split("");
        var len = chars.length;
        for (var cn=0 ; cn<len ; cn++) {
            var c = chars[cn];
            if (c === ' ')
                buf.push(SPACE);
            else if (c === '\n')
                buf.push(LF);
            else if (c === '\r')
                buf.push(CR);
            else {
                var uc = c.toUpper;
                var code = Baudot.baudLtrsToCode[uc];
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
        //var str = "the quick brown fox 1a2b3c4d"
        var str = par.gettext;
        var codes = txencode(str);
        return codes;
    }


    var desiredOutput = 4096;

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

        var symbollen = samplesPerSymbol;
        var buf = [];
        var codes = txnext();
        var len = codes.length;
        for (var idx = 0 ; idx < len ; idx++) {
            var code = codes[i];
            for (var s=0 ; s<symbollen ; s++) buf.push(spaceFreq);
            var mask = 1;
            for (var ib=0 ; ib < 5 ; ib++) {
                var bit = (code & mask) === 0;
                var f = (bit) ? spaceFreq : markFreq;
                for (j=0 ; j < symbollen ; j++) buf.push(f);
                mask <<= 1;
                }
            for (var s2=0 ; s2<symbollen ; s2++) buf.push(spaceFreq);
            }

        var pad = desiredOutput - buf.length;
        while (pad--)
            buf.push(spaceFreq);
        //var res = buf.toArray.map(txlpf.update)
        //todo
    };
    */

}// RttyMode



export {RttyMode};

