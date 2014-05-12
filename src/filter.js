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
 *    Foobar is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */
FIR = (function() {

    this.LP = 0;
    this.HP = 1;
    this.BP = 2;
    this.BR = 3;
    
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
    
    this.create = function(type, size, window) {

        var sizeless = size-1;
        var coeffs = [];
        var dlr = new Float32Array(size);
        var dli = new Float32Array(size);
        var dptr = 0;
        
        function update(v) {
            dlr[dptr++] = v;
            dptr %= size;
            var ptr = dptr;
            var sum = 0;
            for (var i=0 ; i < size ; i++) {
                sum += coeffs[i] * dlr[ptr];
                ptr = [ptr+sizeless]%size;
            }
            return sum;
        }
        
        function updatex(v) {
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
        }
        
        
    
        if (typeof window === "undefined")
            window = 0;
            
        switch (type) {
            case this.LP: coeffs = lowpass(size, window); break;
            case this.HP: coeffs = highpass(size, window); break;
            case this.BP: coeffs = bandpass(size, window); break;
            case this.BR: coeffs = bandreject(size, window); break;
            default : throw new IllegalArgumentException("Fir type " + type + " not implemented.");
        }
    };
})();


module.exports.FIR=FIR;
