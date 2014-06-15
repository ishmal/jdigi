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
var Costas  = require("./costas").Costas;



function Mode(par, sampleRateHint) {

    "use strict";

    var self = this;

    this.properties = {};

    var frequency = 1000;

    this.setFrequency = function(freq) {
        frequency = freq;
        nco.setFrequency(freq);
        costas.setFrequency(freq);
    };
    this.getFrequency = function() {
        return frequency;
    };

    this.status = function(msg) {
         console.log("mode: " + msg);
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
        costas.setDataRate(v);
    };
    this.getRate = function() {
        return rate;
    };

    this.getSamplesPerSymbol = function() {
        return this.getSampleRate() / rate;
    };
    
    var useCostas = false;
    this.getUseCostas = function() {
        return useCostas;
    };
    this.setUseCostas = function(v) {
        useCostas = v;
    };

    var decimator = new ResamplerX(decimation);
    var interpolator = new Resampler(decimation);

    var nco = new Nco(this.getFrequency(), par.getSampleRate());
    var costas = new Costas(this.getFrequency(), this.getRate(), par.getSampleRate());


    //#######################
    //# RECEIVE
    //#######################


    this.receiveData = function(v) {
        var cx = (useCostas) ? costas.update(v) : nco.mixNext(v);
        decimator.decimate(cx, this.receive);
    };


    /**
     * Overload this for each mode.  The parameter is either float or complex,
     * depending on downmix()
     */
    this.receive = function(v) {
    };

}

module.exports.Mode = Mode;
