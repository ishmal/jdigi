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
System.register(["./constants", "./fft", "./audio", "./mode/psk", "./mode/rtty", "./mode/packet", "./mode/navtex", "./watch", "./tuner"], function(exports_1) {
    "use strict";
    var constants_1, fft_1, audio_1, psk_1, rtty_1, packet_1, navtex_1, watch_1, tuner_1;
    var OutText, InText, Digi;
    return {
        setters:[
            function (constants_1_1) {
                constants_1 = constants_1_1;
            },
            function (fft_1_1) {
                fft_1 = fft_1_1;
            },
            function (audio_1_1) {
                audio_1 = audio_1_1;
            },
            function (psk_1_1) {
                psk_1 = psk_1_1;
            },
            function (rtty_1_1) {
                rtty_1 = rtty_1_1;
            },
            function (packet_1_1) {
                packet_1 = packet_1_1;
            },
            function (navtex_1_1) {
                navtex_1 = navtex_1_1;
            },
            function (watch_1_1) {
                watch_1 = watch_1_1;
            },
            function (tuner_1_1) {
                tuner_1 = tuner_1_1;
            }],
        execute: function() {
            /**
             * Interface for a text output widget, which the UI should overload
             */
            OutText = (function () {
                function OutText() {
                }
                OutText.prototype.clear = function () {
                };
                OutText.prototype.putText = function (str) {
                };
                return OutText;
            }());
            exports_1("OutText", OutText);
            /**
             * Interface for a test input widget, which the UI should overload
             */
            InText = (function () {
                function InText() {
                }
                InText.prototype.clear = function () {
                };
                InText.prototype.getText = function () {
                    return "";
                };
                return InText;
            }());
            exports_1("InText", InText);
            /**
             * This is the top-level GUI-less app.  Extend this with a GUI.
             */
            Digi = (function () {
                function Digi() {
                    this._audioInput = new audio_1.AudioInput(this);
                    this._audioOutput = new audio_1.AudioOutput(this);
                    this._watcher = new watch_1.Watcher(this);
                    this._txmode = false;
                    /**
                     * Add our modes here and set the default
                     */
                    this.pskMode = new psk_1.PskMode2(this);
                    this.rttyMode = new rtty_1.RttyMode(this);
                    this.packetMode = new packet_1.PacketMode(this);
                    this.navtexMode = new navtex_1.NavtexMode(this);
                    this._mode = this.pskMode;
                    this.modes = [this.pskMode, this.rttyMode, this.packetMode, this.navtexMode];
                    this._tuner = new tuner_1.TunerDummy();
                    this._outtext = new OutText();
                    this._intext = new InText();
                    this.setupReceive();
                }
                Digi.prototype.setupReceive = function () {
                    var FFT_MASK = constants_1.Constants.FFT_SIZE - 1;
                    var FFT_WINDOW = 700;
                    var fft = new fft_1.FFTSR(constants_1.Constants.FFT_SIZE);
                    var ibuf = new Float32Array(constants_1.Constants.FFT_SIZE);
                    var iptr = 0;
                    var icnt = 0;
                    var psbuf = new Float32Array(constants_1.Constants.BINS);
                    this._receive = function (data) {
                        this._mode.receiveData(data);
                        ibuf[iptr++] = data;
                        iptr &= FFT_MASK;
                        if (++icnt >= FFT_WINDOW) {
                            icnt = 0;
                            fft.powerSpectrum(ibuf, psbuf);
                            //console.log("ps: " + ps[100]);
                            this.tuner.update(psbuf);
                            this.mode.receiveFft(psbuf);
                        }
                    };
                };
                Digi.prototype.receive = function (data) {
                    this._receive(data);
                };
                Digi.prototype.trace = function (msg) {
                    if (typeof console !== "undefined")
                        console.log("Digi: " + msg);
                };
                Digi.prototype.error = function (msg) {
                    if (typeof console !== "undefined")
                        console.log("Digi error: " + msg);
                };
                Digi.prototype.status = function (str) {
                    if (typeof console !== "undefined")
                        console.log("status: " + str);
                };
                Object.defineProperty(Digi.prototype, "sampleRate", {
                    get: function () {
                        return this._audioInput.sampleRate;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Digi.prototype, "mode", {
                    get: function () {
                        return this._mode;
                    },
                    set: function (v) {
                        this._mode = v;
                        //this.status("mode switched");
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Digi.prototype, "bandwidth", {
                    get: function () {
                        return this._mode.bandwidth;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Digi.prototype, "frequency", {
                    get: function () {
                        return this._mode.frequency;
                    },
                    set: function (freq) {
                        this._mode.frequency = freq;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Digi.prototype, "useAfc", {
                    get: function () {
                        return this._mode.useAfc;
                    },
                    set: function (v) {
                        this._mode.useAfc = v;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Digi.prototype, "useQrz", {
                    get: function () {
                        return this._watcher.useQrz;
                    },
                    set: function (v) {
                        this._watcher.useQrz = v;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Digi.prototype, "txMode", {
                    get: function () {
                        return this._txmode;
                    },
                    set: function (v) {
                        this._txmode = v;
                        if (v) {
                            this._audioInput.enabled = false;
                            this._audioOutput.enabled = true;
                        }
                        else {
                            this._audioInput.enabled = true;
                            this._audioOutput.enabled = false;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Digi.prototype, "tuner", {
                    get: function () {
                        return this._tuner;
                    },
                    set: function (tuner) {
                        this._tuner = tuner;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Override this in the GUI
                 */
                Digi.prototype.showScope = function (data) {
                    this._tuner.showScope(data);
                };
                Object.defineProperty(Digi.prototype, "outText", {
                    /**
                     * Make this an interface, so we can add things later.
                     * Let the GUI override this.
                     */
                    get: function () {
                        return this._outtext;
                    },
                    set: function (val) {
                        this._outtext = val;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Output text to the gui
                 */
                Digi.prototype.putText = function (str) {
                    this._outtext.putText(str);
                    this._watcher.update(str);
                };
                Object.defineProperty(Digi.prototype, "inText", {
                    /**
                     * Make this an interface, so we can add things later.
                     * Let the GUI override this.
                     */
                    get: function () {
                        return this._intext;
                    },
                    set: function (val) {
                        this._intext = val;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Input text from the gui
                 */
                Digi.prototype.getText = function () {
                    return this._intext.getText();
                };
                Digi.prototype.clear = function () {
                    this._outtext.clear();
                    this._intext.clear();
                };
                Digi.prototype.transmit = function (data) {
                    return this._mode.getTransmitData();
                };
                Digi.prototype.start = function () {
                    this._audioInput.start();
                    this._audioOutput.start();
                };
                Digi.prototype.stop = function () {
                    this._audioInput.stop();
                    this._audioOutput.stop();
                };
                return Digi;
            }());
            exports_1("Digi", Digi); //Digi
        }
    }
});
//# sourceMappingURL=digi.js.map