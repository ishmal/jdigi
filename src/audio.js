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

 //"use strict";
 
 /* global window */
 
import {Resampler} from "./resample";



var AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;


function AudioInput(par) {
    var self = this;

    //Chrome workaround.  Keep a ref to a scriptprocessor node to prevent gc.
    var scriptNodes = {};
    var keep = (function () {
      var nextNodeID = 1;
      return function (node) {
          node.id = node.id || (nextNodeID++);
          scriptNodes[node.id] = node;
          return node;
      };
    }());

    var actx        = new AudioContext();
    var decimation  = 7;
    this.sampleRate = actx.sampleRate / decimation;
    this.source     = null;
    var stream      = null;
    
    
    function startStream(newstream) {
    
        stream = newstream;
    
        //workaround for a Firefox bug.  Keep a global ref to source to prevent gc.
        //http://goo.gl/LjEjUF2
        //var source = actx.createMediaStreamSource(stream);
        self.source = actx.createMediaStreamSource(stream);

        /**/
        var bufferSize = 8192;
        var decimator = Resampler.create(decimation);
        var inputNode = keep(actx.createScriptProcessor(4096, 1, 1));
        enabled = true;
        inputNode.onaudioprocess = function(e) {
            if (!enabled) {
                return;
            }
            var input  = e.inputBuffer.getChannelData(0);
            var len = input.length;
            var d = decimator;
            for (var i=0 ; i < len ; i++) {
                var v = d.decimate(input[i]);
                if (v !== false) {
                    par.receive(v);
                }
            }
        };
    
        self.source.connect(inputNode);
        inputNode.connect(actx.destination);


    }
    
    var enabled = false;
    this.setEnabled = function(v) {
        enabled = v;
    };
    this.getEnabled = function() {
        return enabled;
    };

    this.start = function() { 
        navigator.getUserMedia( { audio : true }, startStream, function(userMediaError) {
            par.error(userMediaError.name + " : " + userMediaError.message);
        });
    };

    this.stop = function() {
        if (stream) stream.stop();
    };
    
       
} //AudioInput




/**
 * Getting this to work with interpolation isn't easy
 */
function AudioOutput(par) {
    var self = this;

    var scriptNodes = {};
    var keep = (function () {
        var nextNodeID = 1;
        return function (node) {
            node.id = node.id || (nextNodeID++);
            scriptNodes[node.id] = node;
            return node;
        };
    }());

    var actx = new AudioContext();
    var sampleRate = actx.sampleRate;

    var isRunning = false;
    
    var enabled = false;
    this.setEnabled = function(v) {
        enabled = v;
    };
    this.getEnabled = function() {
        return enabled;
    };
    

    this.start = function() {

        /**/
        var bufferSize = 4096;
        var decimation = 7;
        var ibuf = new Float32Array(decimation);
        var iptr = decimation;
        var resampler = Resampler.create(decimation);
        var outputNode = keep(actx.createScriptProcessor(bufferSize, 0, 1));
        outputNode.onaudioprocess = function(e) {
            if (!enabled) {
                return;
            }
            var output  = e.outputBuffer.getChannelData(0);
            var len = output.length;
            for (var i=0 ; i < len ; i++) {
                if (iptr >= decimation) {
                    var v = par.transmit();
                    resampler.interpolate(v, ibuf);
                    iptr = 0;
                }
                output[i] = ibuf[iptr++];
            }
        };
    
        outputNode.connect(actx.destination);
        isRunning = true;
    };


    this.stop = function() {
        this.source.close();
        isRunning = false;
    };
    
       
} //AudioOutput

export {AudioInput, AudioOutput};



