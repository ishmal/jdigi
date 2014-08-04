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

import {Resampler} from "../resample";
import {Nco} from "../nco";
import {Constants} from "../constants";
import {Biquad} from "../filter";


function Mode(par, props, sampleRateHint) {
    var self = this;

    this.properties = props;
    
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
    
    var afcFilter = Biquad.lowPass(1.0, 100.0);

    function computeAfc(ps) {
       var sum = 0;
       for (var i=loBin, j=hiBin ; i < freqBin ; i++, j--) {
            if (ps[j] > ps[i]) sum++;
            else if (ps[i] > ps[j]) sum--;
       }
       var filtered = afcFilter.update(sum);
       nco.setError(filtered);
    }

    this.status = function(msg) {
        par.status(self.properties.name + " : " + msg);
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
        self.status("Fs: " + self.getSampleRate() + " rate: " + v +
             " sps: " + self.getSamplesPerSymbol());

    };
    this.getRate = function() {
        return rate;
    };


    this.getSamplesPerSymbol = function() {
        return self.getSampleRate() / rate;
    };
    
    var useAfc = false;
    this.getUseAfc = function() {
        return useAfc;
    };
    this.setUseAfc = function(v) {
        useAfc = v;
    };

    var decimator    = Resampler.create(decimation);
    var interpolator = Resampler.create(decimation);

    var nco = new Nco(this.getFrequency(), par.getSampleRate());



    //#######################
    //# R E C E I V E
    //#######################
    
    this.receiveFft = function(ps) {
        if (useAfc) {
            computeAfc(ps);
        }
    };


    this.receiveData = function(v) {
        var cx = nco.mixNext(v);
        if (decimator.decimatex(cx)) {
            var dv = decimator.value;
            self.receive(dv);
        }
    };


    /**
     * Overload this for each mode.  The parameter is either float or complex,
     * depending on downmix()
     */
    this.receive = function(v) {
    };

    
    //#######################
    //# T R A N S M I T
    //#######################
    
    var obuf = new Float32Array(decimation);
    var optr = 0;
    var ibuf = [];
    var ilen;
    var iptr = 0;
    
    this.getTransmitData = function() {
    
        //output buffer empty?
        if (optr >= decimation) {
            //input buffer empty?
            if (iptr >= ilen) {
                ibuf = this.getBasebandData();
                ilen = ibuf.length;
                if (ilen === 0) {
                    ilen=1;
                    ibuf = [0];
                }
                iptr = 0;
            }
            var v = ibuf[iptr++];
            interpolator.interpolatex(v, interpbuf);
            optr = 0;
        }
        var cx = obuf[optr];
        var upmixed = nco.mixNext(cx);
        return upmixed.abs();
    };
    

}

export {Mode};

