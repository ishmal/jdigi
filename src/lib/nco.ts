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


var ncoTable = (function () {

    var twopi = Math.PI * 2.0;
    var two16 = 65536;
    var delta = twopi / two16;

    var xs = new Array(two16);

    for (var idx = 0; idx < two16; idx++) {
        var angle = delta * idx;
        xs[idx] = {cos: Math.cos(angle), sin: Math.sin(angle)};
    }
    return xs;
})();

/**
 * A sine generator with a 31-bit accumulator and a 16-bit
 * lookup table.  Much faster than Math.whatever
 */
function Nco(frequency, sampleRate) {
    "use strict";
    var hzToInt = 0x7fffffff / sampleRate;
    var freq = 0 | 0;

    function setFrequency(frequency) {
        freq = (frequency * hzToInt) | 0;
    }

    this.setFrequency = setFrequency;
    setFrequency(frequency);

    var err = 0;
    var maxErr = (50 * hzToInt) | 0;  //in hertz
    console.log("maxErr: " + maxErr);
    var minErr = -(50 * hzToInt) | 0;  //in hertz

    function setError(v) {
        err = (err * 0.9 + v * 100000.0) | 0;
        //console.log("err:" + err + "  v:" + v);
        if (err > maxErr)
            err = maxErr;
        else if (err < minErr)
            err = minErr;
    }

    this.setError = setError;

    var phase = 0 | 0;
    var table = ncoTable;

    this.next = function () {
        phase = (phase + (freq + err)) & 0x7fffffff;
        return table[(phase >> 16) & 0xffff];
    };

    this.mixNext = function (v) {
        phase = (phase + (freq + err)) & 0x7fffffff;
        var cs = table[(phase >> 16) & 0xffff];
        return {r: v * cs.cos, i: -v * cs.sin};
    };
}

export {Nco};



