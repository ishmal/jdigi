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
 *    Foobar is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */

var Digi = require('./digi').Digi;

/**
 * Provides a Waterfall display on incoming spectrum data
 */
function Waterfall(par, anchor, width, height, bins) {

    

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

    
    function relMouseCoords(event){
        var totalOffsetX = 0;
        var totalOffsetY = 0;
        var canvasX = 0;
        var canvasY = 0;
        var currentElement = this;

        do {
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        }
        while((currentElement = currentElement.offsetParent));

        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;

        return {x:canvasX, y:canvasY};
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
    
        for (var i = 0 ; i < BINS ; i++)
            if (data[i]>0)
                break;
        if (i>=BINS)
            return;
        
        /*
        for (var dest = 0, src = rowsize ; src < imglen ; dest++, src++) {
            buf8[dest] = buf8[src];
        }
        */
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
    
        var x = 400;
    
        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    
    }
    
    
     
    function redraw(data) {
        //trace("draw");
        //drawSpectrum();
        drawWaterfall2(data);
        drawTuner();
    }
    
    this.start = function() {
    };
    
    this.stop = function() {
    };
    
    
    
} //Waterfall








function DigiGui(anchorName) {

    Digi.call(this);
    
    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame;
        
    var anchor = $(anchorName);

    var startBtn = $("<button>").html("Start").click(function() {
        this.start();
    });
    anchor.append(startBtn);
    
    var waterfall = new Waterfall(this, anchor, 800, 300, this.BINS);
    
    /**
     * Overridden from Digi
     */
    this.receiveSpectrum = function(ps) {
        requestAnimationFrame(function() { redraw(ps); } );
    };


}


module.exports.DigiGui = DigiGui;



