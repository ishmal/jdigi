/**
 * Jdigi
 *
 * Copyright 2015, Bob Jamison
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
System.register([], function(exports_1) {
    "use strict";
    var Complex;
    return {
        setters:[],
        execute: function() {
            Complex = (function () {
                function Complex() {
                }
                Complex.add = function (a, b) {
                    return { r: a.r + b.r, i: a.i + b.i };
                };
                Complex.sub = function (a, b) {
                    return { r: a.r - b.r, i: a.i - b.i };
                };
                Complex.scale = function (a, v) {
                    return { r: a.r * v, i: a.i * v };
                };
                Complex.mul = function (a, b) {
                    var ar = a.r;
                    var ai = a.i;
                    var br = b.r;
                    var bi = b.i;
                    return { r: ar * br - ai * bi, i: ar * bi + ai * br };
                };
                Complex.neg = function (a) {
                    return { r: -a.r, i: -a.i };
                };
                Complex.conj = function (a) {
                    return { r: a.r, i: -a.i };
                };
                Complex.mag = function (a) {
                    var r = a.r;
                    var i = a.i;
                    return r * r + i * i;
                };
                Complex.abs = function (a) {
                    return Math.hypot(a.r, a.i);
                };
                Complex.arg = function (a) {
                    return Math.atan2(a.i, a.r);
                };
                Complex.ZERO = { r: 0, i: 0 };
                Complex.ONE = { r: 1, i: 0 };
                Complex.I = { r: 0, i: 1 };
                return Complex;
            }());
            exports_1("Complex", Complex);
        }
    }
});
//# sourceMappingURL=math.js.map