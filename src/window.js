

/**
 * A few Window types
 */
var Window = (function() {

    this.RECTANGULAR = 0;
    this.BARTLETT    = 1;
    this.BLACKMAN    = 2;
    this.COSINE      = 3;
    this.GAUSS       = 4;
    this.HAMMING     = 5;
    this.HANN        = 6;
    
    this.get = function(type, size) {
    
        var twopi = 2.0 * Math.PI;

        function makeBartlett(index) { 
            return 2 / (size - 1) * ((size - 1) / 2 - Math.abs(index - (size - 1) / 2));
        }

        function makeBlackman(index) { 
            var alpha = 0.16; //the "exact" Blackman
            var a0 = (1 - alpha) / 2;
            var a1 = 0.5;
            var a2 = alpha * 0.5;
            return a0 - a1 * Math.cos(twopi * index / (size - 1)) + a2 * Math.cos(4 * Math.PI * index / (size - 1));
        }

        function makeCosine(index) {
            return Math.cos(Math.PI * index / (length - 1) - Math.PI / 2);
        }

        function makeGauss(index) {
            return Math.pow(Math.E, -0.5 * Math.pow((index - (size - 1) / 2) / (alpha * (size - 1) / 2), 2));
        }

        function makeHamming(index) {
            return 0.54 - 0.46 * Math.cos(twopi * index / (size - 1));
        }

        function makeHann(index) {
            return 0.5 - 0.5 * Math.cos(twopi * index / (size - 1));
        }


        var make = { return 1; }
    
        switch(type) {
            case Window.RECTANGULAR : break;
            case Window.BARTLETT    : make = makeBartlett; break;
            case Window.BLACKMAN    : make = makeBlackman; break;
            case Window.HAMMING     : make = makeHamming;  break;
            case Window.HANN        : make = makeHann;     break;
            default : throw new IllegalArgumentException("Window type '" + type + "' not implemented");
        }
    
        var value = [];
        for (var i=0 ; i < size ; i++)
            value.push(make(i));
            
        return value;
    }

})();



var Fir = (function() {

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
            sum += v
            arr.push(v);
        }
        for (var i=0 ; i<size ; i++)
            arr[i] /= sum;
        return arr;
    }

    function lowpass(size) {
        return genCoeffs(size, window, function(i) {
             return (i == 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
        });
    }
    
    function highpass(size) {
        return genCoeffs(size, window, function(i) {
             return (i == 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
        });
    }
    
    function bandpass(size) {
        return genCoeffs(size, window, function(i) {
             return (i == 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
        });
    }
    
    function bandreject(size) {
        return genCoeffs(size, window, function(i) {
             return (i == 0) ? omega / math.Pi : math.sin(omega * i) / (math.Pi * i);
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














    };













}).();
