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
 *    Foobar is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */
 
var FFT = require("./fft").FFT;
var AudioInput = require("./audio").AudioInput;



function Mode(par, sampleRateHint) {




}



/**
 * This is the top-level GUI-less app
 */
function Digi() {

    var self = this;
    
    var FFT_SIZE = 2048;
    var FFT_MASK = FFT_SIZE - 1;
    var BINS     = FFT_SIZE/2;
    
    this.FFT_SIZE = FFT_SIZE;
    this.FFT_MASK = FFT_MASK;
    this.BINS     = BINS;


    function trace(msg) {
        if (typeof console !== "undefined") 
            console.log("Digi: " + msg);
    }

    function error(msg) {
        if (typeof console !== "undefined") 
            console.log("Digi error: " + msg);
    }

    

    /**
     * Override this in the GUI
     */
    this.receiveSpectrum  = function(data) {};


    var fft = new FFT(FFT_SIZE);
    var ibuf = new Float32Array(FFT_SIZE);
    var iptr = 0;
    var icnt = 0;
    var FFT_WINDOW = 700;
    
    this.receive = function(data) {
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
    


    
    var audioInput = new AudioInput(this);
    
    function getSampleRate() {
        return audioInput.getSampleRate();
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

module.exports.Digi=Digi;

