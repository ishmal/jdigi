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


/* global window, navigator*/
/* jslint node: true */

"use strict";

import {Resampler} from "./resample";


const AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

//Chrome workaround.  Keep a ref to a scriptprocessor node to prevent gc.
let scriptNodes = {};
let keep = (function () {
    let nextNodeID = 1;
    return function (node) {
        node.id = node.id || (nextNodeID++);
        scriptNodes[node.id] = node;
        return node;
    };
}());


class AudioInput {


    constructor(par) {
        this.par = par;
        this.actx = new AudioContext();
        this.decimation = 7;
        this.sampleRate = this.actx.sampleRate / this.decimation;
        this.source = null;
        this.stream = null;
        this.enabled = false;
        this.scriptNodes = {};
    }

    startStream(newstream) {

        this.stream = newstream;

        //workaround for a Firefox bug.  Keep a global ref to source to prevent gc.
        //http://goo.gl/LjEjUF2
        //var source = actx.createMediaStreamSource(stream);
        this.source = this.actx.createMediaStreamSource(newstream);

        /**/
        let bufferSize = 8192;
        let decimator = Resampler.create(this.decimation);
        let inputNode = keep(this.actx.createScriptProcessor(4096, 1, 1));
        this.enabled = true;
        inputNode.onaudioprocess = function (e) {
            if (!this.enabled) {
                return;
            }
            let input = e.inputBuffer.getChannelData(0);
            let len = input.length;
            let d = decimator;
            for (let i = 0; i < len; i++) {
                let v = d.decimate(input[i]);
                if (v !== false) {
                    this.par.receive(v);
                }
            }
        };

        this.source.connect(inputNode);
        inputNode.connect(this.actx.destination);


    }

    start() {
        navigator.getUserMedia(
            {audio: true},
            newStream => {
                this.startStream(newStream);
            },
            userMediaError => {
                this.par.error(userMediaError.name + " : " + userMediaError.message);
            }
        );
    }

    stop() {
        if (this.stream) this.stream.stop();
    }


} //AudioInput


/**
 * Getting this to work with interpolation isn't easy
 */
class AudioOutput {

    constructor(par) {
        this.par = par;
        this.actx = new AudioContext();
        this.sampleRate = this.actx.sampleRate;
        this.isRunning = false;
        this.enabled = false;
    }

    start() {

        /**/
        let bufferSize = 4096;
        let decimation = 7;
        let ibuf = new Float32Array(decimation);
        let iptr = decimation;
        let resampler = Resampler.create(decimation);
        let outputNode = keep(this.actx.createScriptProcessor(bufferSize, 0, 1));
        outputNode.onaudioprocess = function (e) {
            if (!this.enabled) {
                return;
            }
            let output = e.outputBuffer.getChannelData(0);
            let len = output.length;
            for (let i = 0; i < len; i++) {
                if (iptr >= decimation) {
                    let v = this.par.transmit();
                    resampler.interpolate(v, ibuf);
                    iptr = 0;
                }
                output[i] = ibuf[iptr++];
            }
        };

        outputNode.connect(this.actx.destination);
        this.isRunning = true;
    }


    stop() {
        this.source.close();
        this.isRunning = false;
    }


} //AudioOutput

export {AudioInput, AudioOutput};



