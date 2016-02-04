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
 *    along with this program.  If not, see <http:// www.gnu.org/licenses/>.
 */

import {Constants} from './constants';
import {FFT, FFTSR} from './fft';
import {AudioInput, AudioOutput} from './audio';
import {Mode} from './mode/mode';
import {PskMode, PskMode2} from './mode/psk';
import {RttyMode} from './mode/rtty';
import {PacketMode} from './mode/packet';
import {NavtexMode} from './mode/navtex';
import {Watcher} from './watch';
import {Tuner, TunerImpl, TunerDummy} from './tuner';


/**
 * Interface for a text output widget, which the UI should overload
 */
export class OutText {
    clear(): void {
    }

    putText(str: string): void {
    }
}

/**
 * Interface for a test input widget, which the UI should overload
 */
export class InText {
    clear():void {
    }

    getText(): string {
      return '';
    }
}


/**
 * This is the top-level GUI-less app.  Extend this with a GUI.
 */
export class Digi {

  _audioInput: AudioInput;
  _audioOutput: AudioOutput;
  _watcher: Watcher;
  _txmode: boolean;
  pskMode: Mode;
  rttyMode: Mode;
  packetMode: Mode;
  navtexMode: Mode;
  _mode: Mode;
  _modes: Mode[];

  _tuner: Tuner;
  _outtext: OutText;
  _intext: InText;
  _stattext: OutText;
  _receive: (data: number) => void;


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
        this._modes = [this.pskMode, this.rttyMode, this.packetMode, this.navtexMode];

        this._tuner = new TunerDummy();
        this._outtext = new OutText();
        this._intext = new InText();
        this._stattext = new OutText();

        this.setupReceive();
    }

    setupReceive() {
      const FFT_MASK = Constants.FFT_SIZE - 1;
      const FFT_WINDOW = 700;
      let fft = new FFTSR(Constants.FFT_SIZE);
      let ibuf = new Float32Array(Constants.FFT_SIZE);
      let iptr = 0;
      let icnt = 0;
      let psbuf = new Float32Array(Constants.BINS);

      this._receive = function (data: number) {
          this._mode.receiveData(data);
          ibuf[iptr++] = data;
          iptr &= FFT_MASK;
          if (++icnt >= FFT_WINDOW) {
              icnt = 0;
              fft.powerSpectrum(ibuf, psbuf);
              // console.log('ps: ' + ps[100]);
              this.tuner.update(psbuf);
              this.mode.receiveFft(psbuf);
          }
        };
    }


    receive(data: number) {
        this._receive(data);
    }

    trace(msg) {
        if (typeof console !== 'undefined') {
            console.log('Digi: ' + msg);
        }
    }

    error(msg) {
        if (typeof console !== 'undefined') {
            console.log('Digi error: ' + msg);
        }
    }

    status(str) {
        if (typeof console !== 'undefined') {
            console.log('status: ' + str);
        }
    }

    get sampleRate() {
        return this._audioInput.sampleRate;
    }


    set mode(v: Mode) {
        this._mode = v;
        // this.status('mode switched');
    }

    get mode(): Mode {
        return this._mode;
    }

    get modes(): Mode[] {
      return this._modes;
    }


    get bandwidth(): number {
        return this._mode.bandwidth;
    }

    set frequency(freq: number) {
        this._mode.frequency = freq;
    }

    get frequency(): number {
        return this._mode.frequency;
    }

    get useAfc(): boolean {
        return this._mode.useAfc;
    }

    set useAfc(v: boolean) {
        this._mode.useAfc = v;
    }

    get useQrz(): boolean {
        return this._watcher.useQrz;
    }

    set useQrz(v: boolean) {
        this._watcher.useQrz = v;
    }

    get txMode(): boolean {
        return this._txmode;
    }

    set txMode(v: boolean) {
        this._txmode = v;
        if (v) {
            this._audioInput.enabled = false;
            this._audioOutput.enabled = true;
        } else {
            this._audioInput.enabled = true;
            this._audioOutput.enabled = false;
        }
    }

    get tuner(): Tuner {
      return this._tuner;
    }

    set tuner(tuner: Tuner) {
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
    get outText(): OutText {
        return this._outtext;
    }

    set outText(val: OutText) {
        this._outtext = val;
    }

    /**
     * Output text to the gui
     */
    putText(str: string) {
        this._outtext.putText(str);
        this._watcher.update(str);
    }

    /**
     * Make this an interface, so we can add things later.
     * Let the GUI override this.
     */
    get inText(): InText {
      return this._intext;
    }

    set inText(val: InText) {
        this._intext = val;
    }

    get statText(): OutText {
      return this._stattext;
    }

    set statText(v: OutText) {
      this._stattext = v;
    }

    /**
     * Input text from the gui
     */
    getText(): string {
        return this._intext.getText();
    }

    clear() {
        this._outtext.clear();
        this._intext.clear();
    }


    transmit(data) {
        return this._mode.getTransmitData();
    }


    start(): void {
        this._audioInput.start();
        this._audioOutput.start();
    }

    stop(): void {
        this._audioInput.stop();
        this._audioOutput.stop();
    }


} // Digi
