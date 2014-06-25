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


var Complex = require("./math").Complex;

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

    var err = 0;
    var maxErr =  (4294967296.0 * 30 / sampleRate)|0;  //in hertz
    
    function setError(v) {
        err = (err+v)|0;
        if (err > maxErr) 
            err = maxErr;
        else if (err < -maxErr)
            err = -maxErr;
    }
    
    var phase = 0|0;
    var table = ncoTable;
    
    this.next = function() {
        phase = (phase + freq + err) & 0xffffffff;
        return table[(phase >> 16) & 0xffff];
    };
            
    this.mixNext = function (v) {
        phase = (phase + freq + err) & 0xffffffff;
        var cs = table[(phase >> 16) & 0xffff];
        return new Complex(v*cs.cos, v*cs.sin);
    };
        
}

module.exports.Nco = Nco;



