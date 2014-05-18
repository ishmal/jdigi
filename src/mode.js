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
var Nco = require("./nco").Nco;

function Mode(par, sampleRateHint) {

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
         console.log("mode: " + msg);
    };

    this.getBandwidth = function() {
    
    };
    
    var decimation = Math.floor(par.getSampleRate() / sampleRateHint);
    
    this.getSampleRate = function() {
        return par.getSampleRate() / decimation;
    };
    
    var rate = 31.25;
    this.setRate = function(v) {
        rate = v;
        this.postSetRate();
    };                            
    this.getRate = function() {
        return rate;
    };
    this.postSetRate = function() {
    };
    
    this.getSamplesPerSymbol = function() {
        return this.getSampleRate() / rate;
    };
    
    var decimator = new Resampler(decimation); 
    
    var nco = new Nco(this.getFrequency(), this.getSampleRate());
    
    
    
    /**
     * Overload this for each mode.  Note that the parameter is Complex
     */
    this.receive = function(v) {
    };
    
    this.receiveData = function(v) {
        decimator.decimate(v, function(vp) {
            var cs = nco.next();
            self.receive(cs.scale(vp));
        });
    };
    
}

module.exports.Mode = Mode;

