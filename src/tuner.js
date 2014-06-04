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

var Constants = require('./digi').Constants;

/**
 * Provides a Waterfall display and tuning interactivity
 * @param par the parent Digi of this waterfall
 * @canvas the canvas to use for drawing
 */
function Tuner(par, canvas) {
    "use strict";

    var self = this;

    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame;


    var BINS = Constants.BINS;

    var MAX_FREQ = par.getSampleRate() * 0.5;

    var frequency = 1000;

    //note that this is different from the public method
    function setFrequency(freq) {
        frequency = freq;
        par.setFrequency(freq);
    }

    function trace(msg) {
        if (typeof console !== "undefined")
            console.log("Tuner: " + msg);
    }
    function error(msg) {
        if (typeof console !== "undefined")
            console.log("Tuner error : " + msg);
    }

    function createIndices(targetsize, sourcesize) {
        var xs = new Array(targetsize);
        var ratio = sourcesize / targetsize;
        for (var i=0 ; i < targetsize ; i++) {
            xs[i] = Math.floor(i * ratio);
        }
        return xs;
    }

    var indices, width, height, ctx, imgData, imglen, buf8, rowsize, lastRow;

    function resize() {
 	     width   = canvas.width;
	      height  = canvas.height;
        indices = createIndices(width, BINS);
        ctx     = canvas.getContext('2d');
        imgData = ctx.createImageData(width, height);
        imglen  = imgData.data.length;
        buf8    = new Uint8ClampedArray(imglen);
    		for (var i=0 ; i < imglen ; ) {
		      	buf8[i++] = 0;
			      buf8[i++] = 0;
			      buf8[i++] = 0;
			      buf8[i++] = 255;
		    }
        imgData.data.set(buf8);
        ctx.putImageData(imgData, 0, 0);
        rowsize  = imglen / height;
        lastRow  = imglen - rowsize;
    }

    resize();

	canvas.setAttribute("tabindex", "1");

    //####################################################################
    //#   MOUSE and KEY EVENTS
    //####################################################################

    var dragging        = false;
    canvas.onclick      = function(event) { mouseFreq(event); };
    canvas.onmousedown  = function(event) { dragging=true; };
    canvas.onmouseup    = function(event) { dragging=false; };
    canvas.onmousemove  = function(event) { if (dragging) mouseFreq(event); };
    canvas.onkeydown    = handleKey;
    canvas.onmousewheel = handleWheel;
    canvas.addEventListener("DOMMouseScroll", handleWheel, false);

    function mouseFreq(event) {
        var pt = getMousePos(canvas, event);
        //trace("point: " + pt.x + ":" + pt.y);
        var freq = MAX_FREQ * pt.x / width;
        //trace("freq:" + freq);
        setFrequency(freq);
    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
    }

    function handleWheel(evt) {
        var delta = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1;
        setFrequency(frequency + delta * 1); //or other increments here
        evt.preventDefault();
    }

    //fine tuning, + or - one hertz
    function handleKey(evt) {
        var key = evt.which;
        if (key===37 || key===40) {
            setFrequency(frequency - 1);
        } else if (key===38 || key===39) {
            setFrequency(frequency + 1);
        }
        evt.preventDefault();
    }


    //####################################################################
    //#  R E N D E R I N G
    //####################################################################

    /**
     * Make a palette. tweak this often
     * TODO:  consider using an HSV heat map
     */
    function makePalette() {
        var xs = new Array(256);
        for (var i = 0 ; i < 256 ; i++) {
            var r = (i < 170) ? 0 : (i-170) * 3;
            var g = (i <  85) ? 0 : (i < 170) ? (i-85) * 3 : 255;
            var b = (i <  85) ? i * 3 : 255;
            var col = [ r, g, b, 255 ];
            xs[i] = col;
        }
        return xs;
    }

    var palette = makePalette();


    function drawSpectrum(data) {
        var x, y, v;

        //ctx.fillStyle = 'red';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
        //ctx.lineWidth = 1;
        ctx.beginPath();
        var base = height>>1; //move this around
        ctx.moveTo(0, base);
        var log = Math.log;
        for (x=0; x<width ; x++) {
            v = log(1.0 + data[indices[x]]) * 20.0;
            y = base - v;
            //trace("x:" + x + " y:" + y);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(width-1,base);
        for (x=width-1; x>=0 ; x--) {
            v = log(1.0 + data[indices[x]]) * 20.0;
            y = base + v;
            //trace("x:" + x + " y:" + y);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(0,base);
        ctx.closePath();
        //var bbox = ctx.getBBox();
        ctx.fill();
    }


    function drawWaterfall(data) {
        buf8.set(buf8.subarray(rowsize, imglen)); //<-cool, if this works
        //trace("data:" + data[50]);

        var idx = lastRow;
        for (var x=0; x<width ; x++) {
            var v = data[indices[x]];
            var pix = palette[v & 255];
            //if (x==50)trace("p:" + p + "  pix:" + pix.toString(16));
            buf8[idx++] = pix[0];
            buf8[idx++] = pix[1];
            buf8[idx++] = pix[2];
            buf8[idx++] = pix[3];
        }
        imgData.data.set(buf8);
        ctx.putImageData(imgData, 0, 0);
    }

    function drawWaterfall2(data) {

        buf8.set(buf8.subarray(rowsize, imglen)); //<-cool, if this works
        var idx = lastRow;
        var abs = Math.abs;
        var log = Math.log;
        for (var x=0; x<width ; x++) {
            var v = abs(data[indices[x]]);
            //if (x==50) trace("v:" + v);
            var p = log(1.0 + v) * 30;
            //if (x==50)trace("x:" + x + " p:" + p);
            var pix = palette[p & 255];
            //if (x==50)trace("p:" + p + "  pix:" + pix.toString(16));
            buf8[idx++] = pix[0];
            buf8[idx++] = pix[1];
            buf8[idx++] = pix[2];
            buf8[idx++] = pix[3];
        }
        imgData.data.set(buf8);
        ctx.putImageData(imgData, 0, 0);
    }


    function drawTuner() {
        var pixPerHz = 1 / MAX_FREQ * width;

        var x    = frequency * pixPerHz;
        var bw   = par.getBandwidth();
        var bww  = bw * pixPerHz;
        var bwhi = (frequency + bw * 0.5) * pixPerHz;
        var bwlo = (frequency - bw * 0.5) * pixPerHz;

        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(bwlo, 0, bww, height);
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        var top = height-15;

        for (var hz=0 ; hz < MAX_FREQ ; hz+=100) {
            if ((hz % 1000) === 0) {
                ctx.strokeStyle = "red";
                ctx.beginPath();
                x = hz * pixPerHz;
                ctx.moveTo(x, top);
                ctx.lineTo(x, height);
                ctx.stroke();
            } else {
                ctx.strokeStyle = "white";
                ctx.beginPath();
                x = hz * pixPerHz;
                ctx.moveTo(x, top+10);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }

        ctx.fillStyle = "gray";
        for (hz=0 ; hz < MAX_FREQ ; hz+=500) {
            x = hz * pixPerHz - 10;
            ctx.fillText(hz.toString(),x,top+14);
        }
    }

    var _scopeData = [];

    function drawScope() {
        var box = 100;
        var center = 50;
        ctx.strokeStyle = "white";
        ctx.rect(0, 0, box, box);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(center, 0);
        ctx.lineTo(center, box);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, center);
        ctx.lineTo(box, center);
        ctx.stroke();

        ctx.strokeStyle = "yellow";
        ctx.beginPath();
        ctx.moveTo(center,center);
        var len = _scopeData.length;
        for (var i=0 ; i<len ; i++) {
            var pt = _scopeData[i];
            var x = center + Math.log(1 + pt[0]) * 50.0;
            var y = center + Math.log(1 + pt[1]) * 50.0;
            //console.log("pt:" + x + ":" + y);
            ctx.lineTo(x,y);
        }
        ctx.stroke();
    }

    function update(data) {
        drawWaterfall2(data);
        drawSpectrum(data);
        drawTuner();
        drawScope();
    }


    //####################################################################
    //# P U B L I C    M E T H O D S
    //####################################################################

    this.setFrequency = function(freq) {
        frequency = freq;
    };

   this.showScope = function(data) {
        _scopeData = data;
    };

    this.update = function(data) {
		requestAnimationFrame(function() { update(data); } );
    };

} //Tuner

module.exports.Tuner = Tuner;
