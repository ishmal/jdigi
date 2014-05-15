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
                                                               

var Mode = require("../mode").Mode;




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
    
    var baudLtrsToCode = table.map(e => (e._1, e._3)).toMap
    var baudFigsToCode = table.map(e => (e._2, e._3)).toMap
    var baudSymToCode  = baudLtrsToCode ++ baudFigsToCode
    var baudCodeToSym  = table.map(e => (e._3, (e._1, e._2))).toMap.withDefaultValue((0,0))

    var BAUD_NUL   = 0x00;
    var BAUD_SPACE = 0x04;
    var BAUD_CR    = 0x08;
    var BAUD_LF    = 0x02;
    var BAUD_LTRS  = 0x1f;
    var BAUD_FIGS  = 0x1b;
    
    var baudControl = [BAUD_NUL, BAUD_SPACE, BAUD_CR, BAUD_LF,
        BAUD_LTRS, BAUD_FIGS];

    var ccirLtrsToCode = table.map(e => (e._1, e._4)).toMap
    var ccirFigsToCode = table.map(e => (e._2, e._4)).toMap
    var ccirSymToCode = ccirLtrsToCode ++ ccirFigsToCode
    var ccirCodeToSym = table.map(e => (e._4, (e._1, e._2))).toMap

    var ccirControl = {
        CCIR_NUL    : 0x2b,
        CCIR_SPACE  : 0x1d,
        CCIR_CR     : 0x0f,
        CCIR_LF     : 0x1b,
        CCIR_LTRS   : 0x2d,
        CCIR_FIGS   : 0x36,
        CCIR_ALPHA  : 0x78,
        CCIR_BETA   : 0x66,
        CCIR_SYNC   : 0x00,
        CCIR_REPEAT : 0x33
    };

    var ccirAllCodes = table.map(_._4).toSet ++ ccirControl
    
    def ccirIsvarid(code: Int) =
        ccirAllCodes.contains(code)

})();


/**
 * Enumerations for parity types
 */ 
var Parity = {
    ParityNone : 0,
    ParityOne  : 1,
    ParityZero : 2,
    ParityOdd  : 3,
    ParityEven : 4
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
function Rtty(par) {
    Mode.call(this, par, 1000.0);

    override var name = "rtty"
    override var tooltip ="Radio teletype"
    
    var rates = [
        [  "45",  45.45 ],
        [  "50",  50.0 ],
        [  "75",  75.0 ],
        [ "100", 100.0 ]
    ];
    var shifts = List[
        [  "85",  85.0 ],
        [ "170", 170.0 ],
        [ "450", 450.0 ],
        [ "850", 850.0 ]
    ];
    
    override var properties = new PropertyGroup(name,
        new RadioProperty("rate", "Rate", rates.map(_._1), "Baud rate for sending mark or space") ( idx => rate = rates(idx)._2 ),
        new RadioProperty("shift", "Shift", shifts.map(_._1), "Spacing in hertz between mark and space", 1) ( idx => shift = shifts(idx)._2 ),
        new BooleanProperty("uos", "UoS", "Unshift on space")(b=> unshiftOnSpace = b),
        new BooleanProperty("inv", "Inv", "Invert mark and space for USB and LSB")(b=> inverted = b)
    )

    var inverted = false
    
    var shiftvar = 170.0
    
    def shift = shiftVal
    
    def shift_=(v: Double) =
        {
        shiftvar  = v
        adjust
        }
        
    override def rateChanged(v: Double) =
        adjust
    
    override def bandwidth =
        shift
        
    var unshiftOnSpace = false
    
    rate      = 45.0
    shift     = 170.0
    var spaceFreq = Complex(twopi * (-shift * 0.5) / sampleRate)
    var markFreq  = Complex(twopi * ( shift * 0.5) / sampleRate)
    
    var sf = Fir.bandPass(13, -0.75 * shift, -0.25 * shift, sampleRate)
    var mf = Fir.bandPass(13,  0.25 * shift,  0.75 * shift, sampleRate)
    //var dataFilter = Iir2.lowPass(rate, sampleRate)
    var dataFilter = Fir.boxcar(samplesPerSymbol.toInt)
    var txlpf = Fir.lowPass(31,  shift * 0.5, sampleRate)
    
    var avgFilter = Iir2.lowPass(rate / 100, sampleRate)


    def adjust =
        {
        sf = Fir.bandPass(13, -0.75 * shift, -0.25 * shift, sampleRate)
        mf = Fir.bandPass(13,  0.25 * shift,  0.75 * shift, sampleRate)
        spaceFreq = Complex(twopi * (-shift * 0.5) / sampleRate)
        markFreq  = Complex(twopi * ( shift * 0.5) / sampleRate)
        //dataFilter = Iir2.lowPass(rate, sampleRate)
        dataFilter = Fir.boxcar(samplesPerSymbol.toInt)
        txlpf = Fir.lowPass(31,  shift * 0.5, sampleRate)
        }
        
    

    status("sampleRate: " + sampleRate + " samplesPerSymbol: " + samplesPerSymbol)


    var loHys = -0.5
    var hiHys =  0.5

    var bit = false
    
    var debug = false

    var lastvar = Complex(0.0)
    
        
    /**
     * note: multiplying one complex sample of an
     * FM signal with the conjugate of the previous
     * value gives the instantaneous frequency change of
     * the signal.  This is called a polar discrminator.
     */             
    override def update(isample:  Complex) : Double =
        {
        var space  = sf.update(isample)
        var mark   = mf.update(isample)
        var sample = space + mark
        var prod   = sample * lastVal.conj
        lastvar    = sample
        var demod  = prod.arg
        var comp   = math.signum(demod) * 10.0
        var sig    = dataFilter.update(comp)
        //trace("sig:" + sig + "  comp:" + comp)

        par.updateScope(sig, 0)

        //trace("sig:" + sig)
        if (sig > hiHys)
            {
            bit = true
            }
        else if (sig < loHys)
            {
            bit = false
            }

        process(bit)
        
        sig
        }

    
    var parityType : Parity = ParityNone

    def parityOf(c: Int) : Boolean =
        {
        parityType match
            {
            case ParityOdd  => (java.lang.Integer.bitCount( c ) & 1) != 0
            case ParityEven => (java.lang.Integer.bitCount( c ) & 1) == 0
            case ParityZero => false
            case ParityOne  => true
            case _          => false   //None or unknown
            }
        }
    

    trait RxState
    case object RxIdle   extends RxState
    case object RxStart  extends RxState
    case object RxStop   extends RxState
    case object RxStop2  extends RxState
    case object RxData   extends RxState
    case object RxParity extends RxState
    
    var state : RxState = RxIdle
    var counter   = 0
    var code      = 0
    var parityBit = false
    var bitMask   = 0
   
    def process(inbit: Boolean) =
        {
        var bit = inbit ^ inverted //LSB/USB flipping
        var symbollen = samplesPerSymbol.toInt

        state match
            {
            case RxIdle =>
                //trace("RxIdle")
                if (!bit)
                    {
                    state   = RxStart
                    counter = symbollen / 2
                    }
            case RxStart => 
                //trace("RxStart")
                counter -= 1
                //keep idling until half a period of mark has passed
                if (bit)
                    {
                    state = RxIdle
                    }
                else if (counter <= 0)
                    {
                    //half a period has passed
                    //still unset? then we have received a start bit
                    state     = RxData
                    counter   = symbollen
                    code      = 0
                    parityBit = false
                    bitMask   = 1
                    }
            case RxData => 
                //trace("RxData")
                counter -= 1
                if (counter <= 0)
                    {
                    if (bit) code += bitMask
                    bitMask <<= 1
                    counter = symbollen
                    }
                 if (bitMask >= 0x20)
                     {
                     if (parityType == ParityNone) // todo:  or zero or 1
                         {
                         state = RxStop
                         }
                     else
                         {
                         state = RxParity
                         }
                     }
            case RxParity => 
                //trace("RxParity")
                counter -= 1
                if (counter <= 0)
                    {
                    state     = RxStop
                    parityBit = bit
                    counter   = symbollen
                    }
            case RxStop =>
                //trace("RxStop")
                counter -= 1
                if (counter <= 0)
                    {
                    if (bit)
                        {
                        outCode(code)
                        }
                    state = RxStop2
                    counter = symbollen / 2
                    }
            case RxStop2 =>
                //trace("RxStop2")
                counter -= 1
                if (counter <= 0)
                    {
                    state = RxIdle
                    }
            }
        }
    
    var shifted = false
    
       
    def reverse(v: Int, size: Int) : Int =
        {
        var a = v
        var b = 0
        for (i <- 0 until size)
            {
            b += a & 1
            b <<= 1
            a >>= 1 
            }
        b
        }
    
    
    
    var cntr = 0
    var bitinverter = 0

    override def start =
        {
        bitinverter = cntr
        cntr += 1
        if (cntr >= 32)
            cntr = 0
        status("bitinverter: " + bitinverter)
        }
    
    override def stop =
        bitinverter = 0
    

    def cleanup(c: Int) : Int =
        {
        (c ^ bitinverter) & 0x1f        
        }


    def outCode(rawcode: Int) =
        {
        //println("raw:" + rawcode)
        var code = rawcode & 0x1f
        if (code != 0)
            {
            if (code == Baudot.BAUD_FIGS)
                shifted = true
            else if (code == Baudot.BAUD_LTRS)
                shifted = false
            else if (code == Baudot.BAUD_SPACE)
                {
                par.puttext(" ")
                if (unshiftOnSpace)
                    shifted = false
                }
            else if (code == Baudot.BAUD_CR || code == Baudot.BAUD_LF)
                {
                par.puttext("\n")
                if (unshiftOnSpace)
                    shifted = false
                }
            var v = Baudot.baudCodeToSym(code)
            var c = if (shifted) v._2 else v._1
            if (c != 0)
                par.puttext(c.toChar.toString)
            }
            
        }
    
    //################################################
    //# T R A N S M I T
    //################################################
    var txShifted = false
    def txencode(str: String) : Seq[Int] =
        {
        var buf = scala.collection.mutable.ListBuffer[Int]()
        for (c <- str)
            {
            if (c == ' ')
                buf += Baudot.BAUD_SPACE
            else if (c == '\n')
                buf += Baudot.BAUD_LF
            else if (c == '\r')
                buf += Baudot.BAUD_CR
            else
                {
                var uc = c.toUpper
                var code = Baudot.baudLtrsToCode.get(uc)
                if (code.isDefined)
                    {
                    if (txShifted)
                        {
                        txShifted = false
                        buf += Baudot.BAUD_LTRS
                        }
                    buf += code.get
                    }
                else
                    {
                    code = Baudot.baudFigsToCode.get(uc)
                    if (code.isDefined)
                        {
                        if (!txShifted)
                            {
                            txShifted = true
                            buf += Baudot.BAUD_FIGS
                            }
                        buf += code.get
                        }
                    }
                }
            }
        buf.toSeq
        }
    
    def txnext : Seq[Int] =
        {
        //var str = "the quick brown fox 1a2b3c4d"
        var str = par.gettext
        var codes = txencode(str)
        codes
        }
    
    
    var desiredOutput = 4096


    /**
     * Overridded from Mode.  This method is called by
     * the audio interface when it needs a fresh buffer
     * of sampled audio data at its sample rate.  If the
     * mode has no current data, then it should send padding
     * in the form of what is considered to be an "idle" signal
     */                             
    override def transmit : Option[Array[Complex]] =
        {
        var symbollen = samplesPerSymbol.toInt
        var buf = scala.collection.mutable.ListBuffer[Complex]()
        var codes = txnext
        for (code <- codes)
            {
            for (i <- 0 until symbollen) buf += spaceFreq
            var mask = 1 
            for (i <- 0 until 5)
                {
                var bit = (code & mask) == 0
                var f = if (bit) spaceFreq else markFreq
                for (j <- 0 until symbollen) buf += f
                mask <<= 1
                }
            for (i <- 0 until symbollen) buf += spaceFreq
            }
        
        var pad = desiredOutput - buf.size
        for (i <- 0 until pad)
            buf += spaceFreq
        var res = buf.toArray.map(txlpf.update)
        None
        }



}
