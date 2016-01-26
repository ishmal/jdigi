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
System.register(["./constants"], function(exports_1) {
    "use strict";
    var constants_1;
    var BINS, TunerDummy, TunerImpl;
    function trace(msg) {
        if (typeof console !== "undefined")
            console.log("Tuner: " + msg);
    }
    function error(msg) {
        if (typeof console !== "undefined")
            console.log("Tuner error : " + msg);
    }
    return {
        setters:[
            function (constants_1_1) {
                constants_1 = constants_1_1;
            }],
        execute: function() {
            BINS = constants_1.Constants.BINS;
            TunerDummy = (function () {
                function TunerDummy() {
                }
                Object.defineProperty(TunerDummy.prototype, "frequency", {
                    get: function () { return 0; },
                    enumerable: true,
                    configurable: true
                });
                TunerDummy.prototype.showScope = function (data) { };
                TunerDummy.prototype.update = function (data) { };
                return TunerDummy;
            }());
            exports_1("TunerDummy", TunerDummy);
            /**
             * Provides a Waterfall display and tuning interactivity
             * @param par the parent Digi of this waterfall
             * @canvas the canvas to use for drawing
             */
            TunerImpl = (function () {
                function TunerImpl(par, canvas) {
                    window.requestAnimationFrame = window.requestAnimationFrame
                        || window.msRequestAnimationFrame;
                    // || window.mozRequestAnimationFrame
                    // || window.webkitRequestAnimationFrame;
                    this.par = par;
                    this._canvas = canvas;
                    this._MAX_FREQ = par.sampleRate * 0.5;
                    this._dragging = false;
                    this._frequency = 1000;
                    this._indices = null;
                    this._width = 100;
                    this._height = 100;
                    this._ctx = null;
                    this._imgData = null;
                    this._imglen = null;
                    this._buf8 = null;
                    this._rowsize = null;
                    this._lastRow = null;
                    this._scopeData = [];
                    this.resize();
                    canvas.setAttribute("tabindex", "1");
                    this._palette = this.makePalette();
                    this.setupEvents(canvas);
                }
                Object.defineProperty(TunerImpl.prototype, "frequency", {
                    get: function () {
                        return this._frequency;
                    },
                    //note that this is different from the public method
                    set: function (freq) {
                        this._frequency = freq;
                        this.par.frequency = freq;
                    },
                    enumerable: true,
                    configurable: true
                });
                TunerImpl.prototype.createIndices = function (targetsize, sourcesize) {
                    var xs = new Array(targetsize);
                    var ratio = sourcesize / targetsize;
                    for (var i = 0; i < targetsize; i++) {
                        xs[i] = Math.floor(i * ratio);
                    }
                    return xs;
                };
                TunerImpl.prototype.resize = function () {
                    var canvas = this._canvas;
                    var width = canvas.width;
                    var height = canvas.height;
                    var indices = this.createIndices(width, BINS);
                    var ctx = canvas.getContext('2d');
                    var imgData = ctx.createImageData(width, height);
                    var imglen = imgData.data.length;
                    var buf8 = new Uint8ClampedArray(imglen);
                    for (var i = 0; i < imglen;) {
                        buf8[i++] = 0;
                        buf8[i++] = 0;
                        buf8[i++] = 0;
                        buf8[i++] = 255;
                    }
                    imgData.data.set(buf8);
                    ctx.putImageData(imgData, 0, 0);
                    var rowsize = imglen / height;
                    var lastRow = imglen - rowsize;
                    this._width = width;
                    this._height = height;
                    this._indices = indices;
                    this._ctx = ctx;
                    this._imgData = imgData;
                    this._imglen = imglen;
                    this._buf8 = buf8;
                    this._rowsize = rowsize;
                    this._lastRow = lastRow;
                };
                //####################################################################
                //#   MOUSE and KEY EVENTS
                //####################################################################
                TunerImpl.prototype.setupEvents = function (canvas) {
                    var _this = this;
                    function mouseFreq(event) {
                        var pt = getMousePos(canvas, event);
                        var freq = this.MAX_FREQ * pt.x / this._width;
                        this.frequency = freq;
                    }
                    function getMousePos(canvas, evt) {
                        var rect = canvas.getBoundingClientRect();
                        return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
                    }
                    canvas.onclick = function (event) {
                        mouseFreq(event);
                    };
                    canvas.onmousedown = function (event) {
                        this._dragging = true;
                    };
                    canvas.onmouseup = function (event) {
                        this._dragging = false;
                    };
                    canvas.onmousemove = function (event) {
                        if (_this._dragging)
                            mouseFreq(event);
                    };
                    //fine tuning, + or - one hertz
                    canvas.onkeydown = function (evt) {
                        var key = evt.which;
                        if (key === 37 || key === 40) {
                            _this.frequency += 1;
                        }
                        else if (key === 38 || key === 39) {
                            _this.frequency -= 1;
                        }
                        evt.preventDefault();
                        return false;
                    };
                    function handleWheel(evt) {
                        var delta = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1;
                        this.frequency += (delta * 1); //or other increments here
                        evt.preventDefault();
                        return false;
                    }
                    canvas.onmousewheel = handleWheel;
                    canvas.addEventListener("DOMMouseScroll", handleWheel, false);
                };
                //####################################################################
                //#  R E N D E R I N G
                //####################################################################
                /**
                 * Make a palette. tweak this often
                 * TODO:  consider using an HSV heat map
                 */
                TunerImpl.prototype.makePalette = function () {
                    var xs = new Array(256);
                    for (var i = 0; i < 256; i++) {
                        var r = (i < 170) ? 0 : (i - 170) * 3;
                        var g = (i < 85) ? 0 : (i < 170) ? (i - 85) * 3 : 255;
                        var b = (i < 85) ? i * 3 : 255;
                        var col = [r, g, b, 255];
                        xs[i] = col;
                    }
                    return xs;
                };
                TunerImpl.prototype.drawSpectrum = function (data) {
                    var width = this._width;
                    var height = this._height;
                    var ctx = this._ctx;
                    var indices = this._indices;
                    //ctx.fillStyle = 'red';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
                    //ctx.lineWidth = 1;
                    ctx.beginPath();
                    var base = height >> 1; //move this around
                    ctx.moveTo(0, base);
                    var log = Math.log;
                    for (var x = 0; x < width; x++) {
                        var v = log(1.0 + data[indices[x]]) * 12.0;
                        var y = base - v;
                        //trace("x:" + x + " y:" + y);
                        ctx.lineTo(x, y);
                    }
                    ctx.lineTo(width - 1, base);
                    for (var x = width - 1; x >= 0; x--) {
                        var v = log(1.0 + data[indices[x]]) * 12.0;
                        var y = base + v;
                        //trace("x:" + x + " y:" + y);
                        ctx.lineTo(x, y);
                    }
                    ctx.lineTo(0, base);
                    ctx.closePath();
                    //var bbox = ctx.getBBox();
                    ctx.fill();
                };
                TunerImpl.prototype.drawWaterfall = function (data) {
                    var buf8 = this._buf8;
                    var rowsize = this._rowsize;
                    var imglen = this._imglen;
                    var imgData = this._imgData;
                    var width = this._width;
                    var indices = this._indices;
                    var palette = this._palette;
                    buf8.set(buf8.subarray(rowsize, imglen)); //<-cool, if this works
                    //trace("data:" + data[50]);
                    var idx = this._lastRow;
                    for (var x = 0; x < width; x++) {
                        var v = data[indices[x]];
                        var pix = palette[v & 255];
                        //if (x==50)trace("p:" + p + "  pix:" + pix.toString(16));
                        buf8[idx++] = pix[0];
                        buf8[idx++] = pix[1];
                        buf8[idx++] = pix[2];
                        buf8[idx++] = pix[3];
                    }
                    imgData.data.set(buf8);
                    this._ctx.putImageData(imgData, 0, 0);
                };
                TunerImpl.prototype.drawWaterfall2 = function (data) {
                    var width = this._width;
                    var lastRow = this._lastRow;
                    var palette = this._palette;
                    var buf8 = this._buf8;
                    var rowsize = this._rowsize;
                    var imgData = this._imgData;
                    var indices = this._indices;
                    var imglen = this._imglen;
                    var ctx = this._ctx;
                    buf8.set(buf8.subarray(rowsize, imglen)); //<-cool, if this works
                    var idx = lastRow;
                    var abs = Math.abs;
                    var log = Math.log;
                    for (var x = 0; x < width; x++) {
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
                };
                TunerImpl.prototype.drawTuner = function () {
                    var MAX_FREQ = this._MAX_FREQ;
                    var width = this._width;
                    var height = this._height;
                    var frequency = this._frequency;
                    var ctx = this._ctx;
                    var pixPerHz = 1 / MAX_FREQ * width;
                    var x = frequency * pixPerHz;
                    var bw = this.par.bandwidth;
                    var bww = bw * pixPerHz;
                    var bwlo = (frequency - bw * 0.5) * pixPerHz;
                    ctx.fillStyle = "rgba(255,255,255,0.25)";
                    ctx.fillRect(bwlo, 0, bww, height);
                    ctx.strokeStyle = "red";
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                    var top = height - 15;
                    for (var hz = 0; hz < MAX_FREQ; hz += 100) {
                        if ((hz % 1000) === 0) {
                            ctx.strokeStyle = "red";
                            ctx.beginPath();
                            x = hz * pixPerHz;
                            ctx.moveTo(x, top);
                            ctx.lineTo(x, height);
                            ctx.stroke();
                        }
                        else {
                            ctx.strokeStyle = "white";
                            ctx.beginPath();
                            x = hz * pixPerHz;
                            ctx.moveTo(x, top + 10);
                            ctx.lineTo(x, height);
                            ctx.stroke();
                        }
                    }
                    ctx.fillStyle = "gray";
                    for (var hz = 0; hz < MAX_FREQ; hz += 500) {
                        x = hz * pixPerHz - 10;
                        ctx.fillText(hz.toString(), x, top + 14);
                    }
                };
                /**
                 * Plot mode-specific decoder graph data.
                 * This method expects the data to be an array of [x,y] coordinates,
                 * with x and y ranging from -1.0 to 1.0.  It is up to the mode generating
                 * this array to determine how to draw it, and what it means.
                 */
                TunerImpl.prototype.drawScope = function () {
                    var len = this._scopeData.length;
                    if (len < 1)
                        return;
                    var ctx = this._ctx;
                    var boxW = 100;
                    var boxH = 100;
                    var boxX = this._width - boxW;
                    var boxY = 0;
                    var centerX = boxX + (boxW >> 1);
                    var centerY = boxY + (boxH >> 1);
                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = "white";
                    ctx.rect(boxX, boxY, boxW, boxH);
                    ctx.stroke();
                    ctx.clip();
                    ctx.beginPath();
                    ctx.moveTo(centerX, boxY);
                    ctx.lineTo(centerX, boxY + boxH);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(boxX, centerY);
                    ctx.lineTo(boxX + boxW, centerY);
                    ctx.stroke();
                    ctx.strokeStyle = "yellow";
                    ctx.beginPath();
                    var pt = this._scopeData[0];
                    var x = centerX + pt[0] * 50.0;
                    var y = centerY + pt[1] * 50.0;
                    ctx.moveTo(x, y);
                    for (var i = 1; i < len; i++) {
                        pt = this._scopeData[i];
                        x = centerX + pt[0] * 50.0;
                        y = centerY + pt[1] * 50.0;
                        //console.log("pt:" + x + ":" + y);
                        ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                    //all done
                    ctx.restore();
                };
                TunerImpl.prototype.updateData = function (data) {
                    this.drawWaterfall2(data);
                    this.drawSpectrum(data);
                    this.drawTuner();
                    this.drawScope();
                };
                TunerImpl.prototype.showScope = function (data) {
                    this._scopeData = data;
                };
                TunerImpl.prototype.update = function (data) {
                    var _this = this;
                    requestAnimationFrame(function () {
                        _this.updateData(data);
                    });
                };
                return TunerImpl;
            }());
            exports_1("TunerImpl", TunerImpl); //Tuner
        }
    }
});
//# sourceMappingURL=tuner.js.map