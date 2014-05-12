
(function(ns) {

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


        var make = function(x) { return 1; };
    
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
    };

})();



