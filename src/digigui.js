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

var Digi = require('./digi').Digi;
var Constants = require('./digi').Constants;

/**
 * Provides a Waterfall display on incoming spectrum data
 */
function Waterfall(par, anchor, width, height, bins) {

    var self = this;
    
    var MAX_FREQ = par.sampleRate * 0.5;
    
    function trace(msg) {
        if (typeof console !== "undefined")
            console.log("Waterfall: " + msg);
    }
    function error(msg) {
        if (typeof console !== "undefined")
            console.log("Waterfall error : " + msg);
    }

    function createIndices(targetsize, sourcesize) {
        var xs = [];
        var ratio = sourcesize / targetsize;
        for (var i=0 ; i < targetsize ; i++) {
            var idx = Math.floor(i * ratio);
            xs.push(idx);
        }
        return xs;
    }
    
    var indices = createIndices(width, bins);
    
    var canvas = $("<canvas width='" + width + "' height='" + height + "'>");
    anchor.append(canvas);
    
    var dragging = false;
    canvas.click(function(event) { mouseFreq(event); })
        .mousedown(function(event) { dragging=true; })
        .mouseup(function(event) { dragging=false; })
        .mousemove(function(event) { if (dragging) mouseFreq(event); });

    
    var ctx      = canvas.get(0).getContext('2d'); 
    var imgData  = ctx.createImageData(width, height);
    var imglen   = imgData.data.length;
    var buf8     = new Uint8ClampedArray(imglen);
    for (var i=0 ; i < imglen ; ) {
        buf8[i++] = 0;
        buf8[i++] = 0;
        buf8[i++] = 0;
        buf8[i++] = 255;
    }
    imgData.data.set(buf8);
    ctx.putImageData(imgData, 0, 0);
    var rowsize  = imglen / height;
    var lastRow  = imglen - rowsize;

    
    function mouseFreq(event) {
        var pt = getMousePos(canvas.get(0), event);
        //trace("point: " + pt.x + ":" + pt.y);
        var freq = MAX_FREQ * pt.x /width;
        //trace("freq:" + freq);
        frequency = freq;
    }


    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }
      
    /**
     * Make a palette. tweak this often
     */                 
    function makePalette() {
        var xs = [];
        for (var i = 0 ; i < 256 ; i++) {
            var r = (i < 170) ? 0 : (i-170) * 3;
            var g = (i <  85) ? 0 : (i < 170) ? (i-85) * 3 : 255;
            var b = (i <  85) ? i * 3 : 255;
            var col = [ r, g, b, 255 ];
            xs.push(col);
        }
        return xs;
    }
    
    var palette = makePalette();
    
    
    function drawSpectrum() {
        var data = _buf;
        //trace("len:" + data.length);
        //ctx.clearRect(0,0,width,height);
        //
        ctx.fillStyle = 'midnightblue';
        //ctx.fillRect(0,0,width,height);
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (var x=0; x<width ; x++) {
            var v = Math.log(1.0 + data[indices[x]]);
            var y = height - 10 - 50*v;
            //trace("x:" + x + " y:" + y);
            ctx.lineTo(x, y);
        }   
        ctx.lineTo(width-1,height-1);
        ctx.closePath();
        //var bbox = ctx.getBBox();
        ctx.fillStyle = 'rgba(255, 0, 0, 1.0)';
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
        //trace("data:" + data[50]);

        var idx = lastRow;
        for (var x=0; x<width ; x++) {
            var v = Math.abs(data[indices[x]]);
            //if (x==50) trace("v:" + v);
            var p = Math.log(1.0 + v) * 30;
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
    
        var x = frequency * pixPerHz;
        var bw = par.getBandwidth();
        var bww  = bw * pixPerHz;
        var bwhi = (frequency + bw * 0.5) * pixPerHz;
        var bwlo = (frequency - bw * 0.5) * pixPerHz;
        
    
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(bwlo, 0, bww, height);
        ctx.strokeStyle = "cyan";
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
    
    var frequency = 1000;
    
     
    this.update = function(data) {
        //trace("draw");
        //drawSpectrum();
        drawWaterfall2(data);
        drawTuner();
    };
    
    this.start = function() {
    };
    
    this.stop = function() {
    };
    
    
    
} //Waterfall








function DigiGui(anchorName) {

    Digi.call(this);
    var self = this;
    
    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame;
        
    var anchor = $(anchorName);

    var startBtn = $("<button>").html("Start").click(function() {
        self.start();
    });
    anchor.append(startBtn);
    
    var waterfall = new Waterfall(this, anchor, 800, 300, Constants.BINS);
    
    /**
     * Overridden from Digi
     */
    this.receiveSpectrum = function(ps) {
        requestAnimationFrame(function() { waterfall.update(ps); } );
    };


}


module.exports.DigiGui = DigiGui;



