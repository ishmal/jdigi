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

/**
 * A few Window types
 */
let Window = {

    rectangle: function (size: number): number[] {
        let xs = new Array(size);
        for (let i = 0; i < size; i++) {
            xs[i] = 1.0;
        }
        return xs;
    },

    bartlett: function (size: number): number[] {
        let xs = new Array(size);
        for (let i = 0; i < size; i++) {
            xs[i] = 2 / (size - 1) * ((size - 1) / 2 - Math.abs(i - (size - 1) / 2));
        }
        return xs;
    },

    blackman: function (size: number): number[] {
        let alpha = 0.16; // the "exact" Blackman
        let a0 = (1 - alpha) / 2;
        let a1 = 0.5;
        let a2 = alpha * 0.5;
        let xs = new Array(size);
        for (let i = 0; i < size; i++) {
            xs[i] = a0 - a1 * Math.cos(2.0 * Math.PI * i / (size - 1)) + a2 * Math.cos(4 * Math.PI * i / (size - 1));
        }
        return xs;
    },

    cosine: function (size: number): number[] {
        let xs = new Array(size);
        for (let i = 0; i < size; i++) {
            xs[i] = Math.cos(Math.PI * i / (size - 1) - Math.PI / 2);
        }
        return xs;
    },

    gauss: function (size: number): number[] {
        let xs = new Array(size);
        let alpha = 1.0;
        for (let i = 0; i < size; i++) {
            xs[i] = Math.pow(Math.E, -0.5 * Math.pow((i - (size - 1) / 2) / (alpha * (size - 1) / 2), 2));
        }
        return xs;
    },

    hamming: function (size: number): number[] {
        let xs = new Array(size);
        for (let i = 0; i < size; i++) {
            xs[i] = 0.54 - 0.46 * Math.cos(2.0 * Math.PI * i / (size - 1));
        }
        return xs;
    },

    hann: function (size: number): number[] {
        let xs = new Array(size);
        for (let i = 0; i < size; i++) {
            xs[i] = 0.5 - 0.5 * Math.cos(2.0 * Math.PI * i / (size - 1));
        }
        return xs;
    }

};

export {Window};
