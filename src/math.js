// JavaScript Document
                                                               

function Complex(real, imaginary) {
    this.r = r;
    this.i = i;
    Object.freeze(this);
}
Complex.prototype.add =
    function(other) { return new Complex(this.r + other.r, this.i + other.i); };
Complex.prototype.sub =
    function(other) { return new Complex(this.r + other.r, this.i + other.i); };
Complex.prototype.scale =
    function(scalar){ return new Complex(this.r * scalar,  this.i * scalar ); };
Complex.prototype.mul =
    function(other) { var or = other.r; var oi = other.i;
        return new Complex(this.r * or - this.i * oi, this.r * oi + this.i * or); };
Complex.prototype.neg =
    function() { return new Complex(-this.r, -this.i); };
Complex.prototype.conj =
    function() { return new Complex(this.r, -this.i); };
Complex.prototype.mag =
    function() { var r = this.r; var i = this.i; return r*r+i*i; };
Complex.prototype.arg =
    function() { return Math.atan2(this.i, this.r); };
Complex.prototype.toString =
    function() { return "(" + r.toString() + "," + i.toString() + ")"; }
Complex.ZERO =
    new Complex(0,0);
Complex.ONE =
    new Complex(1,0);
Complex.I =
    new Complex(0,1);
}



exports._test = {
    Complex: Complex
};
