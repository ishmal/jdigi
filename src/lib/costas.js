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
"use strict";
/* jslint node: true */

import Complex from "./math";
import Biquad from "./filter";


var cossinTable = (function () {

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
 * For reference.  See code below
 */
function LowPassIIR(cutoff, sampleRate) {
    var b = Math.exp(-2.0 * Math.PI * cutoff / sampleRate);
    var a = 1.0 - b;
    var z = 0.0;

    this.update = function (v) {
        z = v * a + z * b;
        return z;
    };
}


/**
 * A 32-bit costas loop for decoding phase-shifted signals at a given
 * frequency and data rate
 */
function CostasIIR(frequency, dataRate, sampleRate) {
    var freq = 0;
    var err = 0;
    var phase = 0 | 0;
    var table = cossinTable;
    var iqa, iqb, iz = 0, qz = 0;
    var da, db, dz = 0;


    function setFrequency(frequency) {
        freq = (4294967296.0 * frequency / sampleRate) | 0;
    }

    this.setFrequency = setFrequency;
    setFrequency(frequency);


    function setDataRate(rate) {
        iqb = Math.exp(-2.0 * Math.PI * rate * 0.7 / sampleRate);
        iqa = 1.0 - iqb;
        db = Math.exp(-2.0 * Math.PI * 4.0 * rate / sampleRate);
        da = 1.0 - db;
    }

    this.setDataRate = setDataRate;
    setDataRate(dataRate);


    this.update = function (v) {
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
        return {r: iz, i: qz};
    };


}


/**
 * This version uses Biquad filters for the arms
 * http://www.trondeau.com/blog/2011/8/13/control-loop-gain-values.html
 */
function Costas_old(frequency, dataRate, sampleRate) {
    var err = 0;
    var alpha = 0;
    var beta = 0;
    var damp = 0.707;
    var freq = 0;
    var phase = 0 | 0;

    var table = cossinTable;
    var ilp, qlp, dlp;
    var agcint1 = 0, agcint2 = 0;
    var agcgain = 0.001;


    function setFrequency(frequency) {
        freq = (4294967296.0 * frequency / sampleRate) | 0;
    }

    this.setFrequency = setFrequency;
    setFrequency(frequency);
    var maxErr = 4294967296.0 * 20.0 / sampleRate;
    console.log("maxerr: " + maxErr);
    var minErr = -maxErr;


    function setDataRate(rate) {
        ilp = Biquad.lowPass(rate * 0.5, sampleRate);
        qlp = Biquad.lowPass(rate * 0.5, sampleRate);
        dlp = Biquad.lowPass(rate * 6.0, sampleRate);
    }

    this.setDataRate = setDataRate;
    setDataRate(dataRate);


    this.update = function (v) {
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
        console.log("" + iz + " " + qz + " " + angle + " " + err);
        //console.log("iq: " + iz + ", " + qz);
        return {r: iz, i: qz};
    };


}


function Costas(frequency, dataRate, sampleRate) {
    var err = 0;
    var bw = 2.0 * Math.PI / 200;
    var damp = 0.707;
    var alpha = (4 * damp * bw) / (1 + 2 * damp * bw + bw * bw);
    var beta = (4 * bw * bw) / (1 + 2 * damp * bw + bw * bw);
    var freq0 = 0;
    var freq = 0;
    var minFreq = 0;
    var maxFreq = 0;
    var phase = 0;
    var twopi = 2.0 * Math.PI;
    var omega = twopi / sampleRate;
    var tabRate = 65536 / twopi;
    var counter = 0;

    var table = cossinTable;
    var ilp, qlp, dlp;
    var agcint1 = 0, agcint2 = 0;
    var agcgain = 0.001;

    function toRad(f) {
        return twopi * f / sampleRate;
    }


    function setFrequency(frequency) {
        freq0 = frequency * omega;
        freq = freq0;
        minFreq = freq0 - dataRate * omega;
        maxFreq = freq0 + dataRate * omega;
    }

    this.setFrequency = setFrequency;
    setFrequency(frequency);


    function setDataRate(rate) {
        ilp = Biquad.lowPass(rate * 0.5, sampleRate);
        qlp = Biquad.lowPass(rate * 0.5, sampleRate);
        dlp = Biquad.lowPass(rate * 4.0, sampleRate);
        minFreq = freq0 - dataRate * omega;
        maxFreq = freq0 + dataRate * omega;
    }

    this.setDataRate = setDataRate;
    setDataRate(dataRate);


    this.update = function (v) {
        v = v * agcint1;
        var agcerr = 1.0 - Math.abs(v);
        agcint2 = agcint1;
        agcint1 = agcint2 + agcgain * agcerr;

        freq = freq + beta * err;
        if (freq < minFreq)
            freq = minFreq;
        else if (freq > maxFreq)
            freq = maxFreq;
        phase = phase + freq + alpha * err;
        while (phase > twopi) phase -= twopi;
        var cs = table[(phase * tabRate) & 0xffff];
        var i = v * cs.cos;
        var q = v * cs.sin;
        var iz = ilp.update(i);
        var qz = qlp.update(q);
        //console.log("qz: " + qz);
        var angle = -Math.atan2(qz, iz);
        err = dlp.update(angle);
        //console.log("" + iz + " " + qz + " " + angle + " " + err);
        //if (++counter % 10 === 0)
        //    plotter.update([iz, qz, angle, err, freq, minFreq, maxFreq]);
        //console.log("iq: " + iz + ", " + qz);
        return {r: iz, i: qz};
    };
}


export {Costas};




