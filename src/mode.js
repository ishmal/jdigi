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

var Resampler = require("./resample").Resampler;
var ResamplerX = require("./resample").ResamplerX;
var Nco = require("./nco").Nco;
var SimpleGoertzel = require("./fft").SimpleGoertzel;

function Afc(frequency, bandwidth, sampleRate) {
    var loFft = new SimpleGoertzel(frequency-bandwidth*0.5, bandwidth, sampleRate);
    var hiFft = new SimpleGoertzel(frequency+bandwidth*0.5, bandwidth, sampleRate);
    var N = loFft.N;
    
    var count=0;
    
    this.update = function(v, func) {
        loFft.update(v);
        hiFft.update(v);
        if (count++ >= N) {
            count=0;
            var diff = hiFft.mag() - loFft.mag();
            func(diff);
            loFft.reset();
            hiFft.reset();
        }
    };
}




function Mode(par, sampleRateHint) {
    "use strict";

    var self = this;

    this.properties = {};

    var frequency = 1000;

    this.setFrequency = function(freq) {
        frequency = freq;
        nco.setFrequency(freq);
    };
    this.getFrequency = function() {
        return frequency;
    };

    this.status = function(msg) {
         par.status("mode: " + msg);
    };

    this.getBandwidth = function() {
        return 0;
    };

    var decimation = Math.floor(par.getSampleRate() / sampleRateHint);

    var sampleRate = par.getSampleRate() / decimation;
    this.getSampleRate = function() {
        return sampleRate;
    };
    

    var rate = 31.25;
    this.setRate = function(v) {
        rate = v;
        afc = new Afc(0, rate, self.getSampleRate());
    };
    this.getRate = function() {
        return rate;
    };

    var afc = new Afc(0, rate, this.getSampleRate());

    this.getSamplesPerSymbol = function() {
        return this.getSampleRate() / rate;
    };
    
    var useAfc = false;
    this.getUseAfc = function() {
        return useAfc;
    };
    this.setUseAfc = function(v) {
        useAfc = v;
    };

    var decimator = new ResamplerX(decimation);
    var interpolator = new Resampler(decimation);

    var nco = new Nco(this.getFrequency(), par.getSampleRate());

    var loFft, hiFft;


    //#######################
    //# RECEIVE
    //#######################


    this.receiveData = function(v) {
        function preReceive(v) {
            if (useAfc)
                afc.update(v, nco.setError);
            self.receive(v);
        }
        var cx = nco.mixNext(v);
        decimator.decimate(cx, preReceive);
    };


    /**
     * Overload this for each mode.  The parameter is either float or complex,
     * depending on downmix()
     */
    this.receive = function(v) {
    };

}

module.exports.Mode = Mode;
