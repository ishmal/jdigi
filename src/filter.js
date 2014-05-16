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

    
    function average(size) {
        var xs = [];
        for (var i=0 ; i < size ; i++)
            delay.push(1.0/size);
    }
    
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


module.exports.FIR = FIR;
