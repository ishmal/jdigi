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
                                                               

function Complex(real, imaginary) {
    this.r = real;
    this.i = imaginary;
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
Complex.prototype.abs =
    function() { var r = this.r; var i = this.i; return Math.sqrt(r*r+i*i); };
Complex.prototype.arg =
    function() { return Math.atan2(this.i, this.r); };
Complex.prototype.toString =
    function() { return "(" + r.toString() + "," + i.toString() + ")"; };
Complex.ZERO =
    new Complex(0,0);
Complex.ONE =
    new Complex(1,0);
Complex.I =
    new Complex(0,1);



module.exports.Complex = Complex;
