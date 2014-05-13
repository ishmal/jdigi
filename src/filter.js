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


var FIRType = {
    LP : 0,  // Low pass
    HP : 1,  // High pass
    BP : 2,  // Band pass
    BR : 3   // Band reject
};


function FIR(type, size, window) {

    
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
        var center = size * 0.5;
        var W = Window.get(window);
        var sum = 0.0;
        var arr = [];
        for (var i=0 ; i<size ; i++) {
            var v = f(i-center) * W[i];
            sum += v;
            arr.push(v);
        }
        for (var j=0 ; j<size ; j++)
            arr[j] /= sum;
        return arr;
    }

    function lowpass(size, window) {
        return genCoeffs(size, window, function(i) {
             return (i === 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
        });
    }
    
    function highpass(size, window) {
        return genCoeffs(size, window, function(i) {
             return (i === 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
        });
    }
    
    function bandpass(size, window) {
        return genCoeffs(size, window, function(i) {
             return (i === 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
        });
    }
    
    function bandreject(size, window) {
        return genCoeffs(size, window, function(i) {
             return (i === 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
        });
    }
    
    var sizeless = size-1;
    var coeffs = [];
    var dlr = new Float32Array(size);
    var dli = new Float32Array(size);
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
    

    if (typeof window === "undefined")
        window = 0;
        
    function FIRTypeException(msg) {
        this.message = msg;
        this.name = "FIRTypeException";
    }
        
    switch (type) {
        case FIRType.LP: coeffs = lowpass(size, window);    break;
        case FIRType.HP: coeffs = highpass(size, window);   break;
        case FIRType.BP: coeffs = bandpass(size, window);   break;
        case FIRType.BR: coeffs = bandreject(size, window); break;
        default : throw new FIRTypeException("Fir type " + type + " not implemented.");
    }
}

module.exports.FIR=FIR;
module.exports.FIRType=FIRType;
