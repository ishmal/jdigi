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
    
    var xs = [];
    
    for (var idx = 0 ; idx < two16 ; idx++) {
        var angle = delta * idx;
        xs.push(new Complex( Math.cos(angle), Math.sin(angle) )); 
    }
    return xs;  
})();

/**
 * A sine generator with a 32-bit accumulator and a 16-bit
 * lookup table.  Much faster than Math.whatever
 */
function Nco(frequency, sampleRate)
{
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
        
}

module.exports.Nco = Nco;



