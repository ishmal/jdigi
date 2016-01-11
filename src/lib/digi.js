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

import {Constants} from "./constants";
import {FFT,FFTSR} from "./fft";
import {AudioInput,AudioOutput} from "./audio";
import {Mode} from "./mode/mode";
import {PskMode,PskMode2} from "./mode/psk";
import {RttyMode} from "./mode/rtty";
import {PacketMode} from "./mode/packet";
import {NavtexMode} from "./mode/navtex";
import {Watcher} from "./watch";


/**
 * Interface for a text output widget, which the UI should overload
 */
export class OutText {
    clear() {
    }

    putText() {
    }
}

/**
 * Interface for a test input widget, which the UI should overload
 */
export class InText {
    clear() {
    }

    getText() {
    }
}


/**
 * This is the top-level GUI-less app.  Extend this with a GUI.
 */
export class Digi {


    constructor() {
        this._audioInput = new AudioInput(this);
        this._audioOutput = new AudioOutput(this);
        this._watcher = new Watcher(this);
        this._txmode = false;
        /**
         * Add our modes here and set the default
         */
        this.pskMode = new PskMode2(this);
        this.rttyMode = new RttyMode(this);
        this.packetMode = new PacketMode(this);
        this.navtexMode = new NavtexMode(this);
        this._mode = this.pskMode;
        this.modes = [this.pskMode, this.rttyMode, this.packetMode, this.navtexMode];

        this._tuner = new Tuner();
        this._outtext = new OutText();
        this._intext = new InText();

        setupReceive();
    }

    setupReceive() {
      const FFT_MASK = Constants.FFT_SIZE - 1;
      const FFT_WINDOW = 700;
      let fft = new FFTSR(Constants.FFT_SIZE);
      let ibuf = new Float32Array(Constants.FFT_SIZE);
      let iptr = 0;
      let icnt = 0;
      let psbuf = new Float32Array(Constants.BINS);

      this._receive = function (data) {
          this._mode.receiveData(data);
          ibuf[iptr++] = data;
          iptr &= FFT_MASK;
          if (++icnt >= FFT_WINDOW) {
              icnt = 0;
              fft.powerSpectrum(ibuf, psbuf);
              //console.log("ps: " + ps[100]);
              self.tuner.update(psbuf);
              mode.receiveFft(psbuf);
          }
        };
    }


    receive(data) {
        this._receive(data);
    }

    trace(msg) {
        if (typeof console !== "undefined")
            console.log("Digi: " + msg);
    }

    error(msg) {
        if (typeof console !== "undefined")
            console.log("Digi error: " + msg);
    }

    status(str) {
        if (typeof console !== "undefined")
            console.log("status: " + str);
    }

    get sampleRate() {
        return this._audioInput.sampleRate;
    }


    set mode(v) {
        this._mode = v;
        //this.status("mode switched");
    }

    get mode() {
        return this._mode;
    }


    get bandwidth() {
        return this._mode.getBandwidth();
    }

    set frequency(freq) {
        this._mode.setFrequency(freq);
    }

    get frequency() {
        return this._mode.getFrequency();
    }

    get useAfc() {
        return this._mode.useAfc;
    }

    set useAfc(v) {
        this._mode.useAfc = v;
    }

    get useQrz() {
        return this._watcher.getUseQrz();
    }

    set useQrz(v) {
        this._watcher.setUseQrz(v);
    }

    get txMode() {
        return _txmode;
    }

    set txMode(v) {
        this._txmode = v;
        if (v) {
            this._audioInput.setEnabled(false);
            this._audioOutput.setEnabled(true);
        } else {
            this._audioInput.setEnabled(true);
            this._audioOutput.setEnabled(false);
        }
    }

    get tuner() {
      return this._tuner;
    }

    set tuner(tuner) {
      this._tuner = tuner;
    }

    /**
     * Override this in the GUI
     */
    showScope(data) {
        this._tuner.showScope(data);
    }

    /**
     * Make this an interface, so we can add things later.
     * Let the GUI override this.
     */
    get outText() {
        return this._outtext;
    }

    set outText(val) {
        this._outtext = val;
    }

    /**
     * Output text to the gui
     */
    putText(str) {
        this._outtext.putText(str);
        watcher.update(str);
    }

    /**
     * Make this an interface, so we can add things later.
     * Let the GUI override this.
     */
    get inText() {
      return this._intext;
    }

    set inText(val) {
        this._intext = val;
    }

    /**
     * Input text from the gui
     */
    getText() {
        return this._intext.getText();
    }

    clear() {
        this._outtext.clear();
        this._intext.clear();
    }


    transmit(data) {
        return this._mode.getTransmitData();
    }


    start() {
        this._audioInput.start();
        this._audioOutput.start();
    }

    stop() {
        this._audioInput.stop();
        this._audioOutput.stop();
    }


} //Digi
