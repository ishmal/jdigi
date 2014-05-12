    
var jdigi = jdigi || {};
    
jdigi.Fir = (function() {

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

    function lowpass(size) {
        return genCoeffs(size, window, function(i) {
             return (i === 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
        });
    }
    
    function highpass(size) {
        return genCoeffs(size, window, function(i) {
             return (i === 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
        });
    }
    
    function bandpass(size) {
        return genCoeffs(size, window, function(i) {
             return (i === 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
        });
    }
    
    function bandreject(size) {
        return genCoeffs(size, window, function(i) {
             return (i === 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
        });
    }
    
    this.get = function(type, size, window) {

        var coeffs = [];
    
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