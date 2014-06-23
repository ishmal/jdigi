

function Complex(real, imaginary) {
    this.r = real;
    this.i = imaginary;
    Object.freeze(this);
}
Complex.prototype.add =
    function(other) { return new Complex(this.r + other.r, this.i + other.i); };
Complex.prototype.sub =
    function(other) { return new Complex(this.r - other.r, this.i - other.i); };
Complex.prototype.scale =
    function(scalar){ return new Complex(this.r * scalar,  this.i * scalar ); };
Complex.prototype.mul =
    function(other) { var r = this.r; var i = this.i; var or = other.r; var oi = other.i;
        return new Complex(r * or - i * oi, r * oi + i * or); };
Complex.prototype.neg =
    function() { return new Complex(-this.r, -this.i); };
Complex.prototype.conj =
    function() { return new Complex(this.r, -this.i); };
Complex.prototype.isign =  // this * (0,1)
    function() { return new Complex(-this.i, this.r); };
Complex.prototype.mag =
    function() { var r = this.r; var i = this.i; return r*r+i*i; };
Complex.prototype.abs =
    function() { var r = this.r; var i = this.i; return Math.sqrt(r*r+i*i); };
Complex.prototype.arg =
    function() { return Math.atan2(this.i, this.r); };
Complex.prototype.toString =
    function() { return "(" + this.r.toString() + "," + this.i.toString() + ")"; };
Complex.ZERO =
    new Complex(0,0);
Complex.ONE =
    new Complex(1,0);
Complex.I =
    new Complex(0,1);



var ncoTable = (function() {

    var twopi = Math.PI * 2.0;
    var two16 = 65536;
    var delta = twopi / two16;
    
    var xs = new Array(two16);
    
    for (var idx = 0 ; idx < two16 ; idx++) {
        var angle = delta * idx;
        xs[idx] = { cos: Math.cos(angle), sin: Math.sin(angle) }; 
    }
    return xs;  
})();

/**
 * A sine generator with a 32-bit accumulator and a 16-bit
 * lookup table.  Much faster than Math.whatever
 */
function Nco(frequency, sampleRate) {
    "use strict";
    var freq = 0|0;
    function setFrequency(frequency) {
        freq  = (4294967296.0 * frequency / sampleRate)|0;
		return freq;
    }
    this.setFrequency = setFrequency;
    setFrequency(frequency);
    
    var phase = 0|0;
    var table = ncoTable;
    
    this.next = function() {
        phase = (phase + freq) & 0xffffffff;
        return table[(phase >> 16) & 0xffff];
    };
    
    this.mixNext = function (v) {
        phase = (phase + freq) & 0xffffffff;
        var cs = table[(phase >> 16) & 0xffff];
        return new Complex(v*cs.cos, v*cs.sin);
    };
        
}






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






var cossinTable = (function() {

    var twopi = Math.PI * 2.0;
    var two16 = 65536;
    var delta = twopi / two16;
    
    var xs = new Array(two16);
    
    for (var idx = 0 ; idx < two16 ; idx++) {
        var angle = delta * idx;
        xs[idx] = { cos: Math.cos(angle), sin: Math.sin(angle) }; 
    }
    return xs;  
})();




/**
 * This version uses Biquad filters for the arms
 * http://www.trondeau.com/blog/2011/8/13/control-loop-gain-values.html
 */
function Costas(frequency, dataRate, sampleRate, plotter) {
    "use strict";

    var err   = 0;
    var alpha = 0;
    var beta  = 0;
    var damp  = 0.707;
    var freq  = 0;
    var phase = 0|0;
    var counter = 0;

    var table = cossinTable;
    var ilp, qlp, dlp;
    var agcint1=0, agcint2=0;
    var agcgain=0.001;
    

    function setFrequency(frequency) {
        freq  = (4294967296.0 * frequency / sampleRate)|0;
    }
    this.setFrequency = setFrequency;
    setFrequency(frequency);
    var maxErr = 4294967296.0 * 20.0 / sampleRate;
    console.log("maxerr: " + maxErr);
    var minErr = -maxErr;
    
    
    function setDataRate(rate) {
        ilp = Biquad.lowPass(rate*0.5, sampleRate);
        qlp = Biquad.lowPass(rate*0.5, sampleRate);
        dlp = Biquad.lowPass(rate*4.0, sampleRate);
    }
    this.setDataRate = setDataRate;
    setDataRate(dataRate);
    
    
    this.update = function(v) {
        v = v * agcint1;
        var agcerr = 1.0 - Math.abs(v);
        agcint2 = agcint1;
        agcint1 = agcint2 + agcgain * agcerr;
        
        var adjFreq = (freq + err) | 0;
        phase = (phase + adjFreq) & 0xffffffff;
        var cs = table[(phase >> 16) & 0xffff];
        var i = v * cs.cos;
        var q = v * cs.sin;
        var iz = ilp.update(i);
        var qz = qlp.update(q);
        //console.log("qz: " + qz);
        var angle = -Math.atan2(qz, iz);
        err += dlp.update(angle) * 5000.0; // adjust this
        if (err < minErr)
            err = minErr;
        else if (err > maxErr)
            err = maxErr;
        //console.log("" + iz + " " + qz + " " + angle + " " + err);
        if (++counter % 20 === 0)
            plotter.update([iz, qz, angle, err, minErr, maxErr]);
        //console.log("iq: " + iz + ", " + qz);
        return new Complex(iz,qz);
    };
    
        
}

function Plotter(canvas, lines) {
    var size = lines.length;
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    
    function reset() {
        for (var i=0 ; i<size ; i++) {
            lines[i].data = [];
        }
    }
    var y0 = canvas.height / 2;
    
    reset();
    
    this.update = function(values) {
       var len = values.length;
       if (len>size) {
           len = size;
       }
       for (var i=0 ; i<len ; i++) {
           var data = lines[i].data;
           data[data.length] = values[i];
       }
    }
    
    function redraw() {
        ctx.strokeStyle = "black";
        ctx.rect(0,0, width, height);
        ctx.fill();
        
        for (var i=0 ; i < size ; i++) {
            var line = lines[i];
            ctx.strokeStyle = line.style;
            ctx.beginPath();
            ctx.moveTo(0, y0);
            var data = line.data;
            var ll = data.length;
            for (var x=0 ; x<ll ; x++) {
                var y = data[x];
                var sgn = (y>0) ? 1 : -1;
                var v = Math.log(Math.abs(y)+1) * sgn * 10.0;
                ctx.lineTo(x, y0 - v);
            }
            ctx.stroke();
        }
    }
    this.redraw = redraw;



}



function testme() {
    var canvas = document.getElementById("mycanvas");
    var lines = [
        {style:"red"},
        {style:"green"},
        {style:"blue"},
        {style:"cyan"},
        {style:"white"},
        {style:"white"}
    ];
    var plotter = new Plotter(canvas, lines);
    var frequency = 100;
    var dataRate = 2;
    var sampleRate = 1000;
    var nco = new Nco(frequency - 0.5, sampleRate);
    var costas = new Costas(frequency, dataRate, sampleRate, plotter);
    for (var i=0 ; i < 15000 ; i++) {
        var cs = nco.next();
        costas.update(cs.cos);
    }
    plotter.redraw();
 }




