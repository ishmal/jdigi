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

var CCIR = (function() {

    var t = [];
    t[0x3a] = ['Q',  '1'];  /*0111010*/
    t[0x72] = ['W',  '2'];  /*1110010*/
    t[0x35] = ['E',  '3'];  /*0110101*/
    t[0x55] = ['R',  '4'];  /*1010101*/
    t[0x17] = ['T',  '5'];  /*0010111*/
    t[0x6a] = ['Y',  '6'];  /*1101010*/
    t[0x39] = ['U',  '7'];  /*0111001*/
    t[0x59] = ['I',  '8'];  /*1011001*/
    t[0x47] = ['O',  '9'];  /*1000111*/
    t[0x5a] = ['P',  '0'];  /*1011010*/
    t[0x71] = ['A',  '-'];  /*1110001*/
    t[0x69] = ['S', '\''];  /*1101001*/
    t[0x65] = ['D',  '$'];  /*1100101*/
    t[0x6c] = ['F',  '!'];  /*1101100*/
    t[0x56] = ['G',  '&'];  /*1010110*/
    t[0x4b] = ['H',  '#'];  /*1001011*/
    t[0x74] = ['J',    7];  /*1110100*/
    t[0x3c] = ['K',  '['];  /*0111100*/
    t[0x53] = ['L',  ']'];  /*1010011*/
    t[0x63] = ['Z',  '+'];  /*1100011*/
    t[0x2e] = ['X',  '/'];  /*0101110*/
    t[0x5c] = ['C',  ':'];  /*1011100*/
    t[0x1e] = ['V',  '='];  /*0011110*/
    t[0x27] = ['B',  '?'];  /*0100111*/
    t[0x4d] = ['N',  ','];  /*1001101*/
    t[0x4e] = ['M',  '.'];  /*1001110*/
    t[0x1d] = [ ' ',  ' '];
    t[0x0f] = ['\n', '\n']; //actually \r
    t[0x1b] = ['\n', '\n'];

    var cls = {
        NUL    : 0x2b,
        SPACE  : 0x1d,
        CR     : 0x0f,
        LF     : 0x1b,
        LTRS   : 0x2d,
        FIGS   : 0x36,
        ALPHA  : 0x78,
        BETA   : 0x66,
        SYNC   : 0x00,
        REPEAT : 0x33
    };
    cls.t = t;

    return cls;
})();



/**
 *
 * @see http://en.wikipedia.org/wiki/Asynchronous_serial_communication
 *
 */
function NavtexMode(par) {
    var self = this;

    var props = {
        name : "navtex",
        tooltip: "international naval teleprinter",
        controls : [
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

    this.setShift(170.0);
    
    this.setRate(100.0); //makes all rate/shift dependent vars initialize


    var RxSync1  = 0;
    var RxSync2  = 1;
    var RxData   = 2;
    var state     = RxSync1;
    var bitcount  = 0;
    var code      = 0;
    var parityBit = false;
    var bitMask   = 0;
    
    /**
     * Since there is no start or stop bit, we must sync ourselves.
     * But syncing is very simple.  We shift the bits through four 7-bit
     * shift registers.  When all four have valid characters, we consider
     * it to be synced.
     */
    var errs  = 0;
    var sync1 = 0;
    var sync2 = 0;
    var sync3 = 0;
    var sync4 = 0;
    
    function shift7(bit) {
        var a = (bit) ? 1 : 0;
        var b = (sync1 >> 6) & 1;
        sync1 = ((sync1 << 1) + a) & 0x7f;
        a = b;
        b = (sync2 >> 6) & 1;
        sync2 = ((sync2 << 1) + a) & 0x7f;
        a = b;
        b = (sync3 >> 6) & 1;
        sync3 = ((sync3 << 1) + a) & 0x7f;
        a = b;
        sync4 = ((sync4 << 1) + a) & 0x7f;
    }
    

   
    this.processBit = function(bit) {
    
        if (!self.isMiddleBit(bit)) {
            return;
        }

        switch(state) {
            case RxSync1 :
                //trace("RxSync1")
                state    = RxSync2;
                bitcount = 0;
                code     = 0;
                errs     = 0;
                sync1    = 0;
                sync2    = 0;
                sync3    = 0;
                sync4    = 0;
                break;
            case RxSync2 :
                //trace("RxSync2")
                shift7(bit);
                //trace(sync1.toHexString + ", "+  sync2.toHexString + ", " +
                //     sync3.toHexString + ", " + sync4.toHexString);
                //trace("bit: " + bit);
                if (isValid(sync1) && isValid(sync2) &&
                    isValid(sync3) && isValid(sync4)) {
                    processCode(sync1);
                    processCode(sync2);
                    processCode(sync3);
                    processCode(sync4);
                    state = RxData;
                }
                break;
            case RxData :
                //trace("RxData");
                code = ((code<<1) + ((bit) ? 1 : 0)) & 0x7f;
                //trace("code: " + code);
                if (++bitcount >= 7) {
                    if (processCode(code) != ResultFail) { //we want Ok or Soft
                        //stay in RxData.  ready for next code
                        code     = 0;
                        bitcount = 0;
                    } else {
                        code     = 0;
                        bitcount = 0;
                        errs++;
                        if (errs > 3) {
                            state = RxSync1;
                            //trace("return to sync")
                        }
                    }
                }
                break;
            default:
                
            }//switch
    };
    
    var shifted = false;
        
    function reverse(v, len) {
        var a = v;
        var b = 0;
        for (var i=0 ; i < len ; i++) {
            b = (b<<1) + (a&1);
            a >>= 1;
        }
        return b;
    }

    var ResultOk   = 0;
    var ResultSoft = 1;
    var ResultFail = 2;
    var ResultEom  = 3;

    //Sitor-B is in either DX (data) or RX (repeat) mode
    var dxMode = true;

    var q3 = 0;
    var q2 = 0;
    var q1 = 0;
    
    function qadd(v) {
        q3 = q2;
        q2 = q1;
        q1 = v;
    }

    var table  = CCIR.t;
    var NUL    = CCIR.NUL;
    var LTRS   = CCIR.LTRS;
    var FIGS   = CCIR.FIGS;
    var ALPHA  = CCIR.ALPHA;
    var BETA   = CCIR.BETA;
    var SYNC   = CCIR.SYNC;
    var REPEAT = CCIR.REPEAT;
    
    function isValid(code) {
        return (table[code] !== undefined) ||
            code === NUL ||
            code === LTRS ||
            code === FIGS ||
            code === ALPHA ||
            code === BETA ||
            code === SYNC ||
            code === REPEAT;
    }

    function processCode(code) {
        //trace("code: " + code.toHexString + " mode: " + dxMode)
        var res = ResultOk;
        if (code === REPEAT) {
            qadd(code);
            shifted = false;
            dxMode = false;
        } else if (code === ALPHA) {
            shifted = false;
            dxMode = true;
        } else {
            if (dxMode) {
                if (!isValid(code))
                    res = ResultSoft;
                qadd(code); //dont think.  just queue it
                dxMode = false; //for next time
            } else { //symbol
                if (isValid(code)) {
                    processCode2(code);
                } else {
                    if (isValid(q3)) {
                        var c = processCode2(q3);
                        par.status("FEC replaced :" + c);
                        res = ResultSoft;
                    } else {
                        processCode2(-1);
                        res = ResultFail;
                    }
                }
                dxMode = true; // next time
            }//rxmode
        }//symbol
        return res;
    }

    var lastChar = '@';
    

    function processCode2(code) {
        var res = '@';
        if (code === 0) {
            //shouldnt happen
        } else if (code < 0) {
            //par.puttext("_");
            res = '_';
        } else if (code === ALPHA || code === REPEAT) {
            //shouldnt be here
        } else if (code === LTRS) {
            shifted = false;
        } else if (code === FIGS) {
            shifted = true;
        } else {
            var v = table[code];
            if (v !== undefined) {
                var c = (shifted) ? v[1] : v[0];
                par.puttext(c);
                res = c;
            }
        }
        lastChar = res;
        return res;
    }

}// NavtexMode



export {NavtexMode};
