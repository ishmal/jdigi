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
var Biquad = require("./filter").Biquad;


var cossinTable = (function() {

    var twopi = Math.PI * 2.0;
    var two16 = 65536;
    var delta = twopi / two16;
    
    var xs = new Array(two16);
    
    for (var idx = 0 ; idx < two16 ; idx++) {
        var angle = delta * idx;
        xs[idx] = { cos: Math.cos(angle), sin: -Math.sin(angle) }; 
    }
    return xs;  
})();


/**
 * For reference.  See code below
 */
function LowPassIIR(cutoff, sampleRate) {
    var b = Math.exp(-2.0 * Math.PI * cutoff/sampleRate);
    var a = 1.0 - b;
    var z = 0.0;
    
    this.update = function(v) {
        z = v * a + z * b;
        return z;
    };
}


/**
 * A 32-bit costas loop for decoding phase-shifted signals at a given
 * frequency and data rate
 */
function CostasIIR(frequency, dataRate, sampleRate) {
    "use strict";

    var freq = 0;
    var err  = 0;
    var phase = 0|0;
    var table = cossinTable;
    var iqa, iqb, iz=0, qz=0;
    var da, db, dz=0;
    

    function setFrequency(frequency) {
        freq  = (4294967296.0 * frequency / sampleRate)|0;
    }
    this.setFrequency = setFrequency;
    setFrequency(frequency);
    
    
    function setDataRate(rate) {
        iqb = Math.exp(-2.0 * Math.PI * rate * 0.7 /sampleRate);
        iqa = 1.0 - iqb;
        db = Math.exp(-2.0 * Math.PI * 4.0 * rate/sampleRate);
        da = 1.0 - db;
    }
    this.setDataRate = setDataRate;
    setDataRate(dataRate);
    
    
    this.update = function(v) {
        var adjFreq = (freq + err) | 0;
        phase = (phase + adjFreq) & 0xffffffff;
        var cs = table[(phase >> 16) & 0xffff];
        var i = v * cs.cos;
        var q = v * cs.sin;
        iz = i * iqa + iz * iqb;
        qz = q * iqa + qz * iqb;
        var cross = Math.atan2(qz, iz);
        dz = cross * da + dz * db;
        err = dz * 100000.0; // this too coarse?
        console.log("freq: " + freq + "  err: " + err);
        //console.log("iz: " + iz);
        return new Complex(iz,qz);
    };
    
        
}


/**
 * This version uses Biquad filters for the arms
 */
function Costas(frequency, dataRate, sampleRate) {
    "use strict";

    var freq = 0;
    var err  = 0;
    var phase = 0|0;
    var table = cossinTable;
    var ilp, qlp;
    var da, db, dz=0;
    var agcint1=0, agcint2=0;
    var agcgain=0.002;
    

    function setFrequency(frequency) {
        freq  = (4294967296.0 * frequency / sampleRate)|0;
    }
    this.setFrequency = setFrequency;
    setFrequency(frequency);
    
    
    function setDataRate(rate) {
        ilp = Biquad.lowPass(rate*0.5, sampleRate);
        qlp = Biquad.lowPass(rate*0.5, sampleRate);
        db = Math.exp(-2.0 * Math.PI * 4.0 * rate/sampleRate);
        da = 1.0 - db;
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
        var cross = Math.atan2(qz, iz);
        dz = cross * da + dz * db;
        err = dz * 50000.0; // adjust this
        //console.log("freq: " + freq + "  err: " + err);
        //console.log("iq: " + iz + ", " + qz);
        return new Complex(iz,qz);
    };
    
        
}

module.exports.Costas = Costas;



