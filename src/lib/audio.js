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
System.register(["./resample"], function(exports_1) {
    /* global window, navigator*/
    /* jslint node: true */
    "use strict";
    var resample_1;
    var AudioContextImpl, AudioInput, AudioOutput;
    return {
        setters:[
            function (resample_1_1) {
                resample_1 = resample_1_1;
            }],
        execute: function() {
            AudioContextImpl = window.webkitAudioContext;
            navigator.getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia;
            AudioInput = (function () {
                function AudioInput(par) {
                    this.par = par;
                    this.actx = new AudioContext();
                    this.decimation = 7;
                    this.sampleRate = this.actx.sampleRate / this.decimation;
                    this.source = null;
                    this.stream = null;
                    this.enabled = false;
                }
                AudioInput.prototype.startStream = function (newstream) {
                    this.stream = newstream;
                    //workaround for a Firefox bug.  Keep a global ref to source to prevent gc.
                    //http://goo.gl/LjEjUF2
                    //var source = actx.createMediaStreamSource(stream);
                    this.source = this.actx.createMediaStreamSource(newstream);
                    /**/
                    var bufferSize = 8192;
                    var decimator = resample_1.Resampler.create(this.decimation);
                    var inputNode = this.actx.createScriptProcessor(4096, 1, 1);
                    this.enabled = true;
                    inputNode.onaudioprocess = function (e) {
                        if (!this.enabled) {
                            return;
                        }
                        var input = e.inputBuffer.getChannelData(0);
                        var len = input.length;
                        var d = decimator;
                        for (var i = 0; i < len; i++) {
                            var v = d.decimate(input[i]);
                            if (v !== null) {
                                this.par.receive(v);
                            }
                        }
                    };
                    this.source.connect(inputNode);
                    inputNode.connect(this.actx.destination);
                };
                AudioInput.prototype.start = function () {
                    var _this = this;
                    navigator.getUserMedia(MediaStreamConstraints.prototype.audio, function (newStream) {
                        _this.startStream(newStream);
                    }, function (userMediaError) {
                        _this.par.error(userMediaError.name + " : " + userMediaError.message);
                    });
                };
                AudioInput.prototype.stop = function () {
                    if (this.stream)
                        this.stream.stop();
                };
                return AudioInput;
            }()); //AudioInput
            /**
             * Getting this to work with interpolation isn't easy
             */
            AudioOutput = (function () {
                function AudioOutput(par) {
                    this.par = par;
                    this.actx = new AudioContext();
                    this.sampleRate = this.actx.sampleRate;
                    this.isRunning = false;
                    this.enabled = false;
                }
                AudioOutput.prototype.start = function () {
                    /**/
                    var bufferSize = 4096;
                    var decimation = 7;
                    var ibuf = [];
                    var iptr = decimation;
                    var resampler = resample_1.Resampler.create(decimation);
                    var outputNode = this.actx.createScriptProcessor(bufferSize, 0, 1);
                    outputNode.onaudioprocess = function (e) {
                        if (!this.enabled) {
                            return;
                        }
                        var output = e.outputBuffer.getChannelData(0);
                        var len = output.length;
                        for (var i = 0; i < len; i++) {
                            if (iptr >= decimation) {
                                var v = this.par.transmit();
                                resampler.interpolate(v, ibuf);
                                iptr = 0;
                            }
                            output[i] = ibuf[iptr++];
                        }
                    };
                    outputNode.connect(this.actx.destination);
                    this.isRunning = true;
                };
                AudioOutput.prototype.stop = function () {
                    this.isRunning = false;
                };
                return AudioOutput;
            }()); //AudioOutput
            exports_1("AudioInput", AudioInput);
            exports_1("AudioOutput", AudioOutput);
        }
    }
});
//# sourceMappingURL=audio.js.map