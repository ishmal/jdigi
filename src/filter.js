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

var Complex = require("./math").Complex;
var Window  = require("./window").Window;

var FIR = (function() {

    
    function boxcar(size) {
        var xs = [];
        for (var i=0 ; i < size ; i++)
            delay.push(1.0);
    }
    
    function genCoeffs(size, window, func) {
        window = window || Window.hann;
        var W = window(size);
        var center = size * 0.5;
        var sum = 0.0;
        var arr = [];
        for (var i=0 ; i<size ; i++) {
            var v = func(i-center) * W[i];
            sum += v;
            arr.push(v);
        }
        for (var j=0 ; j<size ; j++)
            arr[j] /= sum;
        return arr;
    }

    function FIRCalc(size, coeffs) {
        var sizeless = size-1;
        var dlr = [];
        var dli = [];
        for (var di=0 ; di<size ; di++) {
            dlr.push(0); dli.push(0);
        }
        var dptr = 0;
    
        this.update = function(v) {
            dlr[dptr++] = v;
            dptr %= size;
            var ptr = dptr;
            var sum = 0;
            for (var i=0 ; i < size ; i++) {
                sum += coeffs[i] * dlr[ptr];
                ptr = [ptr+sizeless]%size;
            }
            return sum;
        };
    
        this.updatex = function(v) {
            dlr[dptr]   = v.r;
            dli[dptr++] = v.i;
            dptr %= size;
            var ptr = dptr;
            var sumr = 0;
            var sumi = 0;
            for (var i=0 ; i < size ; i++) {
                sumr += coeffs[i] * dlr[ptr];
                sumi += coeffs[i] * dli[ptr];
                ptr = [ptr+sizeless]%size;
            }
            return new Complex(sumr, sumi);
        };
    
    }

    var cls = {
    
        average : function(size, window) {
            var omega = 1.0 / size;
            var coeffs = genCoeffs(size, window, function(i) {  return omega; });
            return new FIRCalc(size, coeffs);
        },
    
        boxcar : function(size, cutoffFreq, sampleRate, window) {
            var coeffs = genCoeffs(size, window, function(i) { return 1.0; });
            return new FIRCalc(size, coeffs);
        },
    
        lowpass : function(size, cutoffFreq, sampleRate, window) {
            var omega = 2.0 * Math.PI * cutoffFreq / sampleRate;
            var coeffs = genCoeffs(size, window, function(i) {
                 return (i === 0) ? omega / Math.PI : Math.sin(omega * i) / (Math.PI * i);
            });
            return new FIRCalc(size, coeffs);
        },
    
        highpass : function(size, cutoffFreq, sampleRate, window) {
            var omega = 2.0 * Math.PI * cutoffFreq / sampleRate;
            var coeffs = genCoeffs(size, window, function(i) {
                 return (i === 0) ? 1.0 - omega / Math.PI : -Math.sin(omega * i) / (Math.PI * i);
            });
            return new FIRCalc(size, coeffs);
        },
    
        bandpass : function(size, loCutoffFreq, hiCutoffFreq, sampleRate, window) {
            var omega1 = 2.0 * Math.PI * hiCutoffFreq / sampleRate;
            var omega2 = 2.0 * Math.PI * loCutoffFreq / sampleRate;
            var coeffs = genCoeffs(size, window, function(i) {
                 return (i === 0) ? (omega2 - omega1) / Math.PI : 
                    (Math.sin(omega2 * i) - Math.sin(omega1 * i)) / (Math.PI * i);
            });
            return new FIRCalc(size, coeffs);
        },
        
        bandreject : function(size, loCutoffFreq, hiCutoffFreq, sampleRate, window) {
            var omega1 = 2.0 * Math.PI * hiCutoffFreq / sampleRate;
            var omega2 = 2.0 * Math.PI * loCutoffFreq / sampleRate;
            var coeffs = genCoeffs(size, window, function(i) {
                 return (i === 0) ? 1.0 - (omega2 - omega1) / Math.PI : 
                    (Math.sin(omega1 * i) - Math.sin(omega2 * i)) / (Math.PI * i);
            });
            return new FIRCalc(size, coeffs);
        }
    
    };
    
    return cls;
    

})();


//########################################################################
//#  B I Q U A D
//########################################################################

/**
 * A biquad filter
 * @see http://en.wikipedia.org/wiki/Digital_biquad_filter
 */

var Biquad = (function() {

    function Filter(b0, b1, b2, a1, a2) {
    
        var x1=0,  x2=0,  y1=0,  y2=0;
        var x1r=0, x2r=0, y1r=0, y2r=0;
        var x1i=0, x2i=0, y1i=0, y2i=0;


    
        this.update = function(x) {
            var y = b0*x + b1*x1 + b2*x2 - a1*y1 - a2*y2;
            x2 = x1; x1 = x;
            y2 = y1; y1 = y;
            return y;
        };
        
        this.updatex = function(x) {
            var r = x.r; var i = x.i;
            var yr = b0*r + b1*x1r + b2*x2r - a1*y1r - a2*y2r;
            var yi = b0*i + b1*x1i + b2*x2i - a1*y1i - a2*y2i;
            x2r = x1r; x1r = r;
            x2i = x1i; x1i = i;
            y2r = y1r; y1r = yr;
            y2i = y1i; y1i = yi;
            return new Complex(yr, yi);
        };
    }
    
    var cls = {
        lowPass : function(frequency, sampleRate, q) {
            q = typeof q !== 'undefined' ? q : 0.707;
            var freq = 2.0 * Math.PI * frequency / sampleRate;
            var alpha = Math.sin(freq) / (2.0 * q);
            var b0 = (1.0 - Math.cos(freq)) / 2.0;
            var b1 =  1.0 - Math.cos(freq);
            var b2 = (1.0 - Math.cos(freq)) / 2.0;
            var a0 = 1.0 + alpha;
            var a1 = -2.0 * Math.cos(freq);
            var a2 = 1.0 - alpha;    
            return new Filter(b0/a0, b1/a0, b2/a0, a1/a0, a2/a0);
        },
            
        highPass : function(frequency, sampleRate, q) {
            q = typeof q !== 'undefined' ? q : 0.707;
            var freq = 2.0 * Math.PI * frequency / sampleRate;
            var alpha = Math.sin(freq) / (2.0 * q);
            var b0 =  (1.0 + Math.cos(freq)) / 2.0;
            var b1 = -(1.0 + Math.cos(freq));
            var b2 =  (1.0 + Math.cos(freq)) / 2.0;
            var a0 = 1.0 + alpha;
            var a1 = -2.0 * Math.cos(freq);
            var a2 = 1.0 - alpha;    
            return new Filter(b0/a0, b1/a0, b2/a0, a1/a0, a2/a0);
        },

        bandPass : function(frequency, sampleRate, q) {
            q = typeof q !== 'undefined' ? q : 0.5;
            var freq = 2.0 * Math.PI * frequency / sampleRate;
            var alpha = Math.sin(freq) / (2.0 * q);
            var b0 = Math.sin(freq) / 2.0;   // = q*alpha
            var b1 = 0.0;
            var b2 = -Math.sin(freq) / 2.0;  // = -q*alpha
            var a0 = 1.0 + alpha;
            var a1 = -2.0 * Math.cos(freq);
            var a2 = 1.0 - alpha;    
            return new Filter(b0/a0, b1/a0, b2/a0, a1/a0, a2/a0);
        },

        bandReject : function(frequency, sampleRate, q) {
            q = typeof q !== 'undefined' ? q : 0.5;
            var freq = 2.0 * Math.PI * frequency / sampleRate;
            var alpha = Math.sin(freq) / (2.0 * q);
            var b0 = 1.0;
            var b1 = -2.0 * Math.cos(freq);
            var b2 = 1.0;
            var a0 = 1.0 + alpha;
            var a1 = -2.0 * Math.cos(freq);
            var a2 = 1.0 - alpha;    
            return new Filter(b0/a0, b1/a0, b2/a0, a1/a0, a2/a0);
        }
    };
    
    return cls;
    
})();





module.exports.FIR = FIR;
module.exports.Biquad = Biquad;
