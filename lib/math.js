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


var Complex = {
    add: function (a, b) {
        return {r: a.r + b.r, i: a.i + b.i};
    },
    sub: function (a, b) {
        return {r: a.r - b.r, i: a.i - b.i};
    },
    scale: function (a, v) {
        return {r: a.r * v, i: a.i * v};
    },
    mul: function (a, b) {
        var ar = a.r;
        var ai = a.i;
        var br = b.r;
        var bi = b.i;
        return {r: ar * br - ai * bi, i: ar * bi + ai * br};
    },
    neg: function (a) {
        return {r: -a.r, i: -a.i};
    },
    conj: function (a) {
        return {r: a.r, i: -a.i};
    },
    mag: function (a) {
        var r = a.r;
        var i = a.i;
        return r * r + i * i;
    },
    abs: function (a) {
        return Math.hypot(a.r, a.i);
    },
    arg: function (a) {
        return Math.atan2(a.i, a.r);
    },
    ZERO: {r: 0, i: 0},
    ONE: {r: 1, i: 0},
    I: {r: 0, i: 1}
};

export {Complex};

