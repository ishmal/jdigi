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

    this.frequency = 1000;

    this.bandwidth = 31.5;
    
    var decimation = Math.floor(par.sampleRate / sampleRateHint);
    
    this.sampleRate = par.sampleRate / decimation;
    
    this.rate = 31.5;
    this.samplesPerSymbol = this.sampleRate / this.rate;
    
    var decimator = new Resampler(decimation); 
    
    var nco = new Nco(this.frequency, sampleRate);
    
    
    
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

