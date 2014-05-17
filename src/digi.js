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
 
var FFT = require("./fft").FFT;
var AudioInput = require("./audio").AudioInput;
var Mode = require("./mode").Mode;
var PskMode = require("./mode/pskmode").PskMode;
var RttyMode = require("./mode/rttymode").RttyMode;



var Constants = {
    FFT_SIZE : 2048,
    BINS     : 1024
};


/**
 * This is the top-level GUI-less app.  Extend this with a GUI.
 */
function Digi() {

    var self = this;
        
    function trace(msg) {
        if (typeof console !== "undefined") 
            console.log("Digi: " + msg);
    }

    function error(msg) {
        if (typeof console !== "undefined") 
            console.log("Digi error: " + msg);
    }
    
    var audioInput = new AudioInput(this);
    this.sampleRate = audioInput.sampleRate;

    /**
     * Add our modes here and set the default
     */
    var pskMode = new PskMode(this);
    var rttyMode = new RttyMode(this);
    this.mode = pskMode;
    this.modes = [pskMode, rttyMode];
    
    
    this.getBandwidth = function() {
        return this.mode.bandwidth;
    };
    
    this.setFrequency = function(freq, setTuner) {
        this.mode.setFrequency(freq);
    };

    this.getFrequency = function() {
        return this.mode.frequency;
    };

    /**
     * Override this in the GUI
     */
    this.receiveSpectrum  = function(data) {};

    /**
     * Override this in the GUI
     */
    this.showScope  = function(data) {};

    /**
     * Override this in the GUI
     */
    this.puttext = function(str) {
    };

    var FFT_MASK   = Constants.FFT_SIZE - 1;
    var fft        = new FFT(Constants.FFT_SIZE);
    var ibuf       = new Float32Array(Constants.FFT_SIZE);
    var iptr       = 0;
    var icnt       = 0;
    var FFT_WINDOW = 700;
    
    this.receive = function(data) {
        self.mode.receiveData(data);
        ibuf[iptr++] = data;
        iptr &= FFT_MASK;
        if (++icnt >= FFT_WINDOW) {
            icnt = 0;
            var ps = fft.powerSpectrum(ibuf);
            //console.log("ps: " + ps[100]);
            self.receiveSpectrum(ps);
        }        
    };       

    
    function transmit(data) {
    
    
    }
    

    
    function start() {
        audioInput.start();    
    }
    this.start = start;

    function stop() {
        audioInput.stop();    
    }
    this.stop = stop;

} //Digi

module.exports.Constants=Constants;
module.exports.Digi=Digi;

