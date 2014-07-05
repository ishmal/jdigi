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
 
var Constants = require("./constants").Constants;

var FFT = require("./fft").FFT;
var FFTSR = require("./fft").FFTSR;

var AudioInput = require("./audio").AudioInput;
var Mode = require("./mode/mode").Mode;
var PskMode = require("./mode/psk").PskMode;
var PskMode2 = require("./mode/psk").PskMode2;
var RttyMode = require("./mode/rtty").RttyMode;
var PacketMode = require("./mode/packet").PacketMode;
var NavtexMode = require("./mode/navtex").NavtexMode;
var Watcher = require("./watch").Watcher;




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

    this.status = function(str) {
        console.log("status: " + str);
    };

    var audioInput = new AudioInput(this);
    this.getSampleRate = function() {
        return audioInput.sampleRate;
    };

    /**
     * Add our modes here and set the default
     */
    var pskMode = new PskMode2(this);
    var rttyMode = new RttyMode(this);
    var packetMode = new PacketMode(this);
    var navtexMode = new NavtexMode(this);
    var mode = pskMode;
    this.modes = [pskMode, rttyMode, packetMode, navtexMode];
    this.setMode = function(v) {
        mode = v;
        //this.status("mode switched");
    };
    this.getMode = function() {
        return mode;
    };


    this.getBandwidth = function() {
        return mode.getBandwidth();
    };

    this.setFrequency = function(freq, setTuner) {
        mode.setFrequency(freq);
    };

    this.getFrequency = function() {
        return mode.getFrequency();
    };
    
    this.getUseAfc = function() {
        return mode.getUseAfc();
    };
    this.setUseAfc = function(v) {
        mode.setUseAfc(v);
    };

    this.getUseQrz = function() {
        return watcher.getUseQrz();
    };
    this.setUseQrz = function(v) {
        watcher.setUseQrz(v);
    };

    this.getTxMode = function() {
        return false;
    };
    this.setTxMode = function(v) {
        //dostuff
    };

	this.tuner = {
	    setFrequency : function(freq) {},
        showScope    : function(data) {},
        update       : function(data) {}
    };

    /**
     * Override this in the GUI
     */
    this.showScope  = function(data) {
	    this.tuner.showScope(data);
	  };

    /**
     * Make this an interface, so we can add things later.
     * Let the GUI override this.
     */
	this.outtext = {
	      clear : function(str) {},
	      puttext : function(str) {}
	};
    
    var watcher = new Watcher(this);

    /**
     * Output text to the gui
     */
    this.puttext = function(str) {
	    this.outtext.puttext(str);
        watcher.update(str);
    };

    /**
     * Make this an interface, so we can add things later.
     * Let the GUI override this.
     */
	this.intext = {
	    clear : function(str) {},
	    gettext : function(str) { return "";}
	};

    /**
     * Output text to the gui
     */
    this.gettext = function() {
	    return this.intext.gettext();
    };

    this.clear = function() {
        this.outtext.clear();
        this.intext.clear();
    };
    

    var FFT_MASK   = Constants.FFT_SIZE - 1;
    //var fft        = new FFT(Constants.FFT_SIZE);
    var fft        = new FFTSR(Constants.FFT_SIZE);
    var ibuf       = new Float32Array(Constants.FFT_SIZE);
    var iptr       = 0;
    var icnt       = 0;
    var FFT_WINDOW = 700;

    this.receive = function(data) {
        self.getMode().receiveData(data);
        ibuf[iptr++] = data;
        iptr &= FFT_MASK;
        if (++icnt >= FFT_WINDOW) {
            icnt = 0;
            var ps = fft.powerSpectrum(ibuf);
            //console.log("ps: " + ps[100]);
            self.tuner.update(ps);
            mode.receiveFft(ps);
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

module.exports.Digi=Digi;
