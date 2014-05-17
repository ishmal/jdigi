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
    
    var frequency = 1000;
    
    function setFrequency(freq) {
        frequency = freq;
        par.setFrequency(freq);
    }

    
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
    
    var canvas = $("<canvas width='" + width + "' height='" + height + "' tabindex='1'>");
    anchor.append(canvas);
    
    //### MOUSE EVENTS
    var dragging = false;
    canvas.click(function(event) { mouseFreq(event); })
        .mousedown(function(event) { dragging=true; })
        .mouseup(function(event) { dragging=false; })
        .mousemove(function(event) { if (dragging) mouseFreq(event); });

    function mouseFreq(event) {
        var pt = getMousePos(canvas.get(0), event);
        //trace("point: " + pt.x + ":" + pt.y);
        var freq = MAX_FREQ * pt.x / width;
        //trace("freq:" + freq);
        setFrequency(freq);
    }


    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }
      
    canvas.bind('mousewheel DOMMouseScroll', function(evt){
        var delta = (evt.originalEvent.detail < 0 || evt.originalEvent.wheelDelta > 0) ? 1 : -1;
        if(delta < 0) {
            setFrequency(frequency - 1);
        }
        else{
            setFrequency(frequency + 1);
        }
    });
      
    //###  KEY EVENTS
    //fine tuning, + or - one hertz
    canvas.bind("keydown", function(evt) {
        var key = evt.which;
        if (key===37 || key===40) {
            setFrequency(frequency - 1);
        } else if (key===38 || key===39) {
            setFrequency(frequency + 1);
        }
        evt.preventDefault();
    });
    
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

    /**
     * R E N D E R I N G
     */
     
    /**
     * Make a palette. tweak this often
     * TODO:  consider using an HSV heat map
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
    
    var _scopeData = [];
    this.showScope = function(data) {
        _scopeData = data;
    };
    

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
        ctx.moveTo(center, center);
        var len = _scopeData.length;
        for (var i=0 ; i<len ; i++) {
            var pt = _scopeData[i];
            var x = center + Math.log(1 + pt[0]) * 5000.0;
            var y = center + Math.log(1 + pt[1]) * 5000.0;
            //console.log("pt:" + x + ":" + y);
            ctx.lineTo(x,y);
        }
        ctx.stroke();
        
        
    
    }
    
    
     
    this.update = function(data) {
        //trace("draw");
        //drawSpectrum();
        drawWaterfall2(data);
        drawTuner();
        drawScope();
    };
    
    
} //Waterfall




function OutText(par, anchor) {

    var textArea = $("<textarea>").width(800).height(100);

    anchor.append(textArea);
    
    function scrollTop() {
        textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
    }
    
    this.puttext = function(str) {
        var txt = textArea.val() + str;
        textArea.val(txt);
        scrollTop();
    };


}



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
    anchor.append($("<p>"));
    
    var waterfall = new Waterfall(this, anchor, 800, 300, Constants.BINS);
    anchor.append($("<p>"));
    
    function makeTabs(){
        function valClickHandler(func, val) {
            return function() {
                func(val);
            };
        }
        function cbClickHandler(func, cb) {
            return function() {
                func(cb.checked);
            };
        }
    
        var tabroot = $("<div>");
        var ul = $("<ul>");
        tabroot.append(ul);
        var modes = self.modes;
        for (var tn=0 ; tn < modes.length ; tn++) {
            var mode = modes[tn];
            var props = mode.properties;
            var a = $("<a>").attr("href", "#tab"+tn).html(props.name);
            var tab = $("<li>").append(a).data("mode", mode);
            ul.append(tab);
            var pane = $("<div>").attr("id", "tab"+tn);
            tabroot.append(pane);
            var controls = props.controls;
            for (var cn=0 ; cn<controls.length ; cn++) {                                              
                 var control = controls[cn];
                 var cbox = $("<span>").addClass("control");
                 pane.append(cbox);
                 if (control.type === "choice") {
                     var rlbl = $("<label>").html(control.name).addClass("control-label");
                     cbox.append(rlbl);
                     var rbdiv = $("<span>").html("&nbsp;").addClass("control-radiopane");
                     cbox.append(rbdiv);
                     var values = control.values;
                     for (var vn=0 ; vn<values.length ; vn++) {
                         var value = values[vn];
                         rlbl = $("<label>").html(value.name).addClass("control-radiopane-label");
                         var rbtn = $("<input type='radio'>").html(control.name).attr("name", control.name);
                         rbtn.click(valClickHandler(control.func, value.value));
                         rlbl.append(rbtn);
                         rbdiv.append(rlbl);
                     }
                 } else if (control.type === "boolean") {
                     var blbl = $("<label>").html(control.name).addClass("control-label");
                     var bbtn = $("<input type='checkbox'>");
                     bbtn.click(cbClickHandler(control.func, bbtn));
                     blbl.append(bbtn);
                     cbox.append(blbl);
                 }
            }  
        }
        tabroot.tabs({
            activate: function(evt, ui) {
                var mode = ui.newTab.data("mode");
                self.setMode(mode);
            }
        });
        return tabroot;
    }
    
    var tabs = makeTabs();
    
    anchor.append(tabs);
    
    
    
    var outText   = new OutText(this, anchor);
    
    /**
     * Overridden from Digi
     */
    this.receiveSpectrum = function(ps) {
        requestAnimationFrame(function() { waterfall.update(ps); } );
    };
    
    /**
     * Overridden from Digi
     */
    this.showScope = function(data) {
        waterfall.showScope(data);
    };
    
    this.puttext = function(str) {
        outText.puttext(str);
    };


}


module.exports.DigiGui = DigiGui;



