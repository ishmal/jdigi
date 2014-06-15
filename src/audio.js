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

var Resampler = require("./resample").Resampler;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;


function AudioInput(par) {
    "use strict";
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
    var isRunning   = false;
    var stream      = null;
    
    
    function startStream(newstream) {
    
        stream = newstream;
    
        //workaround for a Firefox bug.  Keep a global ref to source to prevent gc.
        //http://goo.gl/LjEjUF2
        //var source = actx.createMediaStreamSource(stream);
        self.source = actx.createMediaStreamSource(stream);

        /**/
        var bufferSize = 8192;
        var decimator = new Resampler(decimation);
        var inputNode = keep(actx.createScriptProcessor(4096, 1, 1));
        inputNode.onaudioprocess = function(e) {
            var input  = e.inputBuffer.getChannelData(0);
            var len = input.length;
            for (var i=0 ; i < len ; i++) {
                decimator.decimate(input[i], par.receive);
            }
        };
    
        self.source.connect(inputNode);
        inputNode.connect(actx.destination);

        isRunning = true;

    }

    this.start = function() { 
        navigator.getUserMedia( { audio : true }, startStream, function(userMediaError) {
            error(userMediaError.name + " : " + userMediaError.message);
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
    "use strict";
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
    
    this.start = function() {

        /**/
        var bufferSize = 4096;
        var decimation = 7;
        var ibuf = new Array(decimation);
        var iptr = decimation;
        var resampler = new Resampler(decimation);
        var outputNode = keep(actx.createScriptProcessor(bufferSize, 0, 1));
        outputNode.onaudioprocess = function(e) {
            var output  = e.outputBuffer.getChannelData(0);
            var len = output.length;
            for (var i=0 ; i < len ; i++) {
                if (iptr >= decimation) {
                    var v = parent.transmit();
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

module.exports.AudioInput = AudioInput;
module.exports.AudioOutput = AudioOutput;



