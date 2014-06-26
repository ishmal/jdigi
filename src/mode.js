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
var Constants = require("./constants").Constants;


function Mode(par, sampleRateHint) {
    "use strict";

    var self = this;

    this.properties = {};

    var frequency = 1000;

    this.setFrequency = function(freq) {
        frequency = freq;
        nco.setFrequency(freq);
        adjustAfc();
    };
    this.getFrequency = function() {
        return frequency;
    };

    this.getBandwidth = function() {
        return 0;
    };

    
    var loBin, freqBin, hiBin;
    
    function adjustAfc() {
       var freq = frequency;
       var fs = par.getSampleRate();
       var bw = self.getBandwidth();
       var binWidth = fs * 0.5 / Constants.BINS;
       loBin = ((freq-bw*0.707) / binWidth) | 0;
       freqBin = (freq / binWidth) | 0;
       hiBin = ((freq+bw*0.707) / binWidth) | 0;
       //console.log("afc: " + loBin + "," + freqBin + "," + hiBin);
    }
    adjustAfc();

    function computeAfc(ps) {
       var sum = 0;
       for (var i=loBin, j=hiBin ; i < freqBin ; i++, j--) {
            if (ps[j] > ps[i]) sum++;
            else if (ps[i] > ps[j]) sum--;
       }
       nco.setError(sum);
    }

    this.status = function(msg) {
         par.status("mode: " + msg);
    };

    var decimation = Math.floor(par.getSampleRate() / sampleRateHint);

    var sampleRate = par.getSampleRate() / decimation;
    this.getSampleRate = function() {
        return sampleRate;
    };
    

    var rate = 31.25;
    this.setRate = function(v) {
        rate = v;
        adjustAfc();
    };
    this.getRate = function() {
        return rate;
    };


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



    //#######################
    //# RECEIVE
    //#######################
    
    this.receiveFft = function(ps) {
        if (useAfc) {
            computeAfc(ps);
        }
    };


    this.receiveData = function(v) {
        var cx = nco.mixNext(v);
        decimator.decimate(cx, self.receive);
    };


    /**
     * Overload this for each mode.  The parameter is either float or complex,
     * depending on downmix()
     */
    this.receive = function(v) {
    };

}

module.exports.Mode = Mode;
