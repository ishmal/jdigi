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
/* jslint node: true */

import {Resampler} from "../resample";
import {Nco} from "../nco";
import {Constants} from "../constants";
import {Biquad} from "../filter";


class Mode {

    constructor(par, props, sampleRateHint) {
        this.par = par;
        this.properties = props(this);
        this._frequency = 1000;
        this.decimation = Math.floor(par.getSampleRate() / sampleRateHint);
        this.sampleRate = par.getSampleRate() / this.decimation;
        this.afcFilter = Biquad.lowPass(1.0, 100.0);
        this.loBin = 0;
        this.freqBin = 0;
        this.hiBin = 0;
        this.adjustAfc();
        this.afcFilter = Biquad.lowPass(1.0, 100.0);
        this.useAfc = false;
        this._rate = 31.25;
        this.decimator = Resampler.create(this.decimation);
        this.interpolator = Resampler.create(this.decimation);
        this.nco = new Nco(this._frequency, par.getSampleRate());

        //transmit
        this.obuf = new Float32Array(this.decimation);
        this.optr = 0;
        this.ibuf = [];
        this.ilen = 0;
        this.iptr = 0;

    }


    set frequency(freq) {
        this._frequency = freq;
        this.nco.setFrequency(freq);
        this.adjustAfc();
    }

    get frequency() {
        return this._frequency;
    }

    get bandwidth() {
        return 0;
    }

    adjustAfc() {
        let freq = this._frequency;
        let fs = this.par.getSampleRate();
        let bw = this.bandwidth;
        let binWidth = fs * 0.5 / Constants.BINS;
        this.loBin = ((freq - bw * 0.707) / binWidth) | 0;
        this.freqBin = (freq / binWidth) | 0;
        this.hiBin = ((freq + bw * 0.707) / binWidth) | 0;
        //console.log("afc: " + loBin + "," + freqBin + "," + hiBin);
    }


    computeAfc(ps) {
        let sum = 0;
        for (let i = loBin, j = hiBin; i < freqBin; i++, j--) {
            if (ps[j] > ps[i]) sum++;
            else if (ps[i] > ps[j]) sum--;
        }
        let filtered = this.afcFilter.update(sum);
        this.nco.setError(filtered);
    }

    status(msg) {
        this.par.status(this.properties.name + " : " + msg);
    }

    set rate(v) {
        this._rate = v;
        this.adjustAfc();
        this.status("Fs: " + this.sampleRate + " rate: " + v +
            " sps: " + this.samplesPerSymbol);
    }

    get rate() {
        return this._rate;
    }


    get samplesPerSymbol() {
        return this.sampleRate / this._rate;
    }


    //#######################
    //# R E C E I V E
    //#######################

    receiveFft(ps) {
        if (useAfc) {
            this.computeAfc(ps);
        }
    }


    receiveData(v) {
        var cs = this.nco.next();
        var cv = this.decimator.decimatex(v * cs.cos, -v * cs.sin);
        if (cv !== false) {
            this.receive(cv);
        }
    }


    /**
     * Overload this for each mode.  The parameter is either float or complex,
     * depending on downmix()
     */
    receive(v) {
    }


    //#######################
    //# T R A N S M I T
    //#######################


    getTransmitData() {

        //output buffer empty?
        if (this.optr >= this.decimation) {
            //input buffer empty?
            if (this.iptr >= this.ilen) {
                this.ibuf = this.getBasebandData();
                this.ilen = this.ibuf.length;
                if (this.ilen === 0) {
                    this.ilen = 1;
                    this.ibuf = [0];
                }
                this.iptr = 0;
            }
            var v = this.ibuf[this.iptr++];
            this.interpolator.interpolatex(v, this.interpbuf);
            this.optr = 0;
        }
        var cx = this.obuf[this.optr];
        var upmixed = this.nco.mixNext(cx);
        return upmixed.abs();
    }

}

export {Mode};
