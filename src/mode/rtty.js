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


var Mode    = require("../mode").Mode;
var FIR     = require("../filter").FIR;
var Complex = require("../math").Complex;




/**
 * These are the ITU codes for 5-bit Baudot code and 7-bit SITOR
 * in the same table
 */
var Baudot = (function() {

    var table = [
        ['Q',  '1',  0x17 /*10111*/,  0x3a /*0111010*/],
        ['W',  '2',  0x13 /*10011*/,  0x72 /*1110010*/],
        ['E',  '3',  0x01 /*00001*/,  0x35 /*0110101*/],
        ['R',  '4',  0x0a /*01010*/,  0x55 /*1010101*/],
        ['T',  '5',  0x10 /*10000*/,  0x17 /*0010111*/],
        ['Y',  '6',  0x15 /*10101*/,  0x6a /*1101010*/],
        ['U',  '7',  0x07 /*00111*/,  0x39 /*0111001*/],
        ['I',  '8',  0x06 /*00110*/,  0x59 /*1011001*/],
        ['O',  '9',  0x18 /*11000*/,  0x47 /*1000111*/],
        ['P',  '0',  0x16 /*10110*/,  0x5a /*1011010*/],
        ['A',  '-',  0x03 /*00011*/,  0x71 /*1110001*/],
        ['S',  '\'', 0x05 /*00101*/,  0x69 /*1101001*/],
        ['D',  '$',  0x09 /*01001*/,  0x65 /*1100101*/],
        ['F',  '!',  0x0d /*01101*/,  0x6c /*1101100*/],
        ['G',  '&',  0x1a /*11010*/,  0x56 /*1010110*/],
        ['H',  '#',  0x14 /*10100*/,  0x4b /*1001011*/],
        ['J',    7,  0x0b /*01011*/,  0x74 /*1110100*/], //7=bell
        ['K',  '[',  0x0f /*01111*/,  0x3c /*0111100*/],
        ['L',  ']',  0x12 /*10010*/,  0x53 /*1010011*/],
        ['Z',  '+',  0x11 /*10001*/,  0x63 /*1100011*/],
        ['X',  '/',  0x1d /*11101*/,  0x2e /*0101110*/],
        ['C',  ':',  0x0e /*01110*/,  0x5c /*1011100*/],
        ['V',  '=',  0x1e /*11110*/,  0x1e /*0011110*/],
        ['B',  '?',  0x19 /*11001*/,  0x27 /*0100111*/],
        ['N',  ',',  0x0c /*01100*/,  0x4d /*1001101*/],
        ['M',  '.',  0x1c /*11100*/,  0x4e /*1001110*/]
    ];

    var cls = {};
    cls.baudLtrsToCode = [];
    cls.baudFigsToCode = [];
    cls.baudCodeToSym  = [];
    cls.ccirLtrsToCode = [];
    cls.ccirFigsToCode = [];
    cls.ccirCodeToSym  = [];

    table.forEach(function(e) {
        cls.baudLtrsToCode[e[0]] = e[2];
        cls.baudFigsToCode[e[1]] = e[2];
        cls.baudCodeToSym[e[2]]  = [e[0],e[1]];
        cls.ccirLtrsToCode[e[0]] = e[3];
        cls.ccirFigsToCode[e[1]] = e[3];
        cls.ccirCodeToSym[e[3]]  = [e[0],e[1]];
    });

    cls.baudControl = {
        NUL   : 0x00,
        SPACE : 0x04,
        CR    : 0x08,
        LF    : 0x02,
        LTRS  : 0x1f,
        FIGS  : 0x1b
    };

    cls.ccirControl = {
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

    //TODO:  this is for Navtex
    //var ccirAllCodes = table.map(_._4).toSet ++ ccirControl

    //def ccirIsvarid(code: Int) =
    //    ccirAllCodes.contains(code)

    return cls;
})();


/**
 * Enumerations for parity types
 */
var Parity = {
    None : 0,
    One  : 1,
    Zero : 2,
    Odd  : 3,
    Even : 4
};



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
    Mode.call(this, par, 1000.0);
    var self = this;

    this.properties = {
        name : "rtty",
        tooltip: "radio teletype",
        controls : [
            {
            name: "rate",
            type: "choice",
            selected: 0,
            get value() { return self.getRate(); },
            set value(v) { self.setRate(parseFloat(v)); },
            values : [
                { name :  "45", value :  45.00 },
                { name :  "50", value :  50.00 },
                { name :  "75", value :  75.00 },
                { name : "100", value : 100.00 }
                ]
            },
            {
            name: "shift",
            type: "choice",
            selected: 0,
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


    var shiftval = 170.0;

    this.getShift = function() {
        return shiftval;
    };

    this.setShift = function(v) {
        shiftval = v;
        this.postSetRate();
    };

    this.getBandwidth = function() { return shiftval; };

    var unshiftOnSpace = false;
    this.getUnshiftOnSpace = function() {
        return unshiftOnSpace;
    };
    this.setUnshiftOnSpace = function(v) {
        unshiftOnSpace = v;
    };

    var inverted = false;
    this.getInverted = function() {
        return inverted;
    };
    this.setInverted = function(v) {
        inverted = v;
    };


    this.setRate(45.0);
    var twopi     = Math.PI * 2.0;
    var spaceFreq = new Complex(twopi * (-shiftval * 0.5) / this.getSampleRate());
    var markFreq  = new Complex(twopi * ( shiftval * 0.5) / this.getSampleRate());

    var sf = FIR.bandpass(13, -0.75 * shiftval, -0.25 * shiftval, this.getSampleRate());
    var mf = FIR.bandpass(13,  0.25 * shiftval,  0.75 * shiftval, this.getSampleRate());
    //var dataFilter = Iir2.lowpass(rate, this.sampleRate);
    var dataFilter = FIR.boxcar(this.getSamplesPerSymbol()|0);
    var txlpf = FIR.lowpass(31,  shiftval * 0.5, this.getSampleRate());

    //var avgFilter = Iir2.lowpass(rate / 100, this.sampleRate);

    var super_setRate = this.setRate;
    this.setRate = function(rate) {
        super_setRate(rate);
        adjust();
    };
    
    function adjust() {
        sf = FIR.bandpass(13, -0.75 * shiftval, -0.25 * shiftval, self.getSampleRate());
        mf = FIR.bandpass(13,  0.25 * shiftval,  0.75 * shiftval, self.getSampleRate());
        spaceFreq = new Complex(twopi * (-shiftval * 0.5) / self.getSampleRate());
        markFreq  = new Complex(twopi * ( shiftval * 0.5) / self.getSampleRate());
        //dataFilter = Iir2.lowpass(rate, this.sampleRate);
        dataFilter = FIR.boxcar(self.getSamplesPerSymbol()|0);
        txlpf = FIR.lowpass(31,  shiftval * 0.5, self.sampleRate);
    }

    this.status("sampleRate: " + this.getSampleRate() + " samplesPerSymbol: " + this.getSamplesPerSymbol());


    var loHys = -0.5;
    var hiHys =  0.5;

    var bit = false;

    var debug = false;

    var lastval = new Complex(0,0);


    /**
     * note: multiplying one complex sample of an
     * FM signal with the conjugate of the previous
     * value gives the instantaneous frequency change of
     * the signal.  This is called a polar discrminator.
     */
    this.receive = function(isample) {
        var space  = sf.updatex(isample);
        var mark   = mf.updatex(isample);
        var sample = space.add(mark);
        var prod   = sample.mul(lastval.conj());
        lastval    = sample;
        var demod  = prod.arg();
        var comp   = (demod<0) ? -10.0 : 10.0;
        var sig    = dataFilter.update(comp);
        //trace("sig:" + sig + "  comp:" + comp)

        scopeOut(sig);

        //trace("sig:" + sig)
        if (sig > hiHys) {
            bit = true;
        } else if (sig < loHys) {
            bit = false;
        }

        process(bit);

        return sig;
    };

    var SSIZE = 200;
    var scopedata = new Array(SSIZE);
    var scnt = 0;
    var sx = -1;
    function scopeOut(v) {
        scopedata[scnt++] = [sx, Math.log(v + 1)*0.25];
        sx += 0.01;
        if (scnt >= SSIZE) {
            scnt = 0;
            sx = -1;
            par.showScope(scopedata);
            scopedata = new Array(SSIZE);
        }
    }


    var parityType = Parity.None;

    function bitcount(n) {
        var c = 0;
        while (n) {
            n &= n-1;
            c++;
        }
        return c;
    }

    function parityOf(c) {
        switch (parityType) {
            case Parity.Odd  : return (bitcount(c) & 1) !== 0;
            case Parity.Even : return (bitcount(c) & 1) === 0;
            case Parity.Zero : return false;
            case Parity.One  : return true;
            default          : return false;   //None or unknown
        }
    }


    var Rx = {
        Idle   : 0,
        Start  : 1,
        Stop   : 2,
        Stop2  : 3,
        Data   : 4,
        Parity : 5
    };

    var state     = Rx.Idle;
    var counter   = 0;
    var code      = 0;
    var parityBit = false;
    var bitMask   = 0;

    function process(inbit) {

        var bit = inbit ^ inverted; //LSB/USB flipping
        var symbollen = self.getSamplesPerSymbol();

        switch (state) {

            case Rx.Idle :
                //trace("RxIdle")
                if (!bit) {
                    state   = Rx.Start;
                    counter = symbollen / 2;
                }
                break;
            case Rx.Start :
                //trace("RxStart")
                counter -= 1;
                //keep idling until half a period of mark has passed
                if (bit) {
                    state = Rx.Idle;
                } else if (counter <= 0) {
                    //half a period has passed
                    //still unset? then we have received a start bit
                    state     = Rx.Data;
                    counter   = symbollen;
                    code      = 0;
                    parityBit = false;
                    bitMask   = 1;
                }
                break;
            case Rx.Data :
                //trace("RxData")
                counter -= 1;
                if (counter <= 0) {
                    if (bit) code += bitMask;
                    bitMask <<= 1;
                    counter = symbollen;
                }
                if (bitMask >= 0x20) {
                    if (parityType == Parity.None) // todo:  or zero or 1
                        state = Rx.Stop;
                    else
                        state = Rx.Parity;
                }
                break;
            case Rx.Parity :
                //trace("RxParity")
                counter -= 1;
                if (counter <= 0) {
                    state     = Rx.Stop;
                    parityBit = bit;
                    counter   = symbollen;
                }
                break;
            case Rx.Stop :
                //trace("RxStop")
                counter -= 1;
                if (counter <= 0) {
                    if (bit)
                        outCode(code);
                    state = Rx.Stop2;
                    counter = symbollen / 2;
                }
                break;
            case Rx.Stop2 :
                //trace("RxStop2")
                counter -= 1;
                if (counter <= 0)
                    state = Rx.Idle;
                break;
            }
    } // switch

    var shifted = false;


    function reverse(v, size) {
        var a = v;
        var b = 0;
        while (size--)
            {
            b += a & 1;
            b <<= 1;
            a >>= 1;
            }
        return b;
    }



    var cntr = 0;
    var bitinverter = 0;

    //cache a copy of these here
    var NUL   = Baudot.baudControl.NUL;
    var SPACE = Baudot.baudControl.SPACE;
    var CR    = Baudot.baudControl.CR;
    var LF    = Baudot.baudControl.LF;
    var LTRS  = Baudot.baudControl.LTRS;
    var FIGS  = Baudot.baudControl.FIGS;

    function outCode(rawcode) {

        //println("raw:" + rawcode)
        var code = rawcode & 0x1f;
        if (code !== 0) {
            if (code === FIGS)
                shifted = true;
            else if (code === LTRS)
                shifted = false;
            else if (code === SPACE) {
                par.puttext(" ");
                if (this.unshiftOnSpace)
                    shifted = false;
            }
            else if (code === CR || code === LF) {
                par.puttext("\n");
                if (this.unshiftOnSpace)
                    shifted = false;
            }
            var v = Baudot.baudCodeToSym[code];
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

module.exports.RttyMode = RttyMode;
