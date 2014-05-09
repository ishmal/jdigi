

function DigiTest(anchorName) {

    var self = this;
    
    var FFT_SIZE = 2048;
    var BINS = FFT_SIZE/2;

    var anchor = $(anchorName);

    //Let's get the local implementations
    window.requestAnimationFrame = window.requestAnimationFrame ||
                                   window.msRequestAnimationFrame ||
                                   window.mozRequestAnimationFrame ||
                                   window.webkitRequestAnimationFrame;

    window.AudioContext = window.AudioContext ||
                          window.webkitAudioContext;

    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;


    function trace(msg) {
        if (typeof console !== "undefined") 
            console.log("Digi: " + msg);
    }

    function error(msg) {
        if (typeof console !== "undefined") 
            console.log("Digi error: " + msg);
    }

    var actx = new AudioContext();
    var sampleRate = actx.sampleRate;
    
    var startBtn = $("<button>").html("Start").click(function() {
        start();
    });
    anchor.append(startBtn);
    


    /**
     * Provides a Waterfall display on incoming spectrum data
     */
    function Waterfall(parent, width, height, bins) {
    
        
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
        parent.append(canvas);
        var ctx      = canvas.get(0).getContext('2d'); 
        var imgData  = ctx.createImageData(width, height);
        var imglen   = imgData.data.length;
        var buf8     = new Uint8ClampedArray(imglen);
        var rowsize  = imglen / height;
        var lastRow  = imglen - rowsize;

        
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
            
            /*
            for (var dest = 0, src = rowsize ; src < imglen ; dest++, src++) {
                buf8[dest] = buf8[src];
            }
            */
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
        
        
         
        function redraw(data) {
            //trace("draw");
            //drawSpectrum();
            drawWaterfall2(data);
        }
        
        this.start = function() {
        };
        
        this.stop = function() {
        };
        
        
        var FFT_SIZE = 2048;
        var FFT_MASK = FFT_SIZE-1;
        var fft = new FFT(FFT_SIZE);
        var ibuf = new Float32Array(FFT_SIZE);
        var iptr = 0;
        var icnt = 0;
        var FFT_WINDOW = 700;
        
        function update(data) {
            ibuf[iptr++] = data;
            iptr &= FFT_MASK;
            if (++icnt >= FFT_WINDOW) {
                icnt = 0;
                var ps = fft.powerSpectrum(ibuf);
                //console.log("ps: " + ps[100]);
                requestAnimationFrame(function() { redraw(ps); } );
            }        
        }        
        this.update = update;
        
    }//Waterfall
    
    var waterfall = new Waterfall(anchor, 800, 300, BINS);
    

    function receive(data) {
        waterfall.update(data);
    }
    
    
    function transmit(data) {
    
    
    }
    

    var scriptNodes = {};
    var keep = (function () {
        var nextNodeID = 1;
        return function (node) {
            node.id = node.id || (nextNodeID++);
            scriptNodes[node.id] = node;
            return node;
        };
    }());

    function AudioInput() {
    
        var analyser = null;
        var isRunning = false;
        
        
        function startStream(stream) {
        
            var source = actx.createMediaStreamSource(stream);

            /**/
            var bufferSize = 8192;
            var decimation = 7;
            var decimator = new Resampler(decimation);
            var inputNode = keep(actx.createScriptProcessor(4096, 1, 1));
            inputNode.onaudioprocess = function(e) {
                var input  = e.inputBuffer.getChannelData(0);
                var len = input.length;
                for (var i=0 ; i < len ; i++) {
                    decimator.decimate(input[i], receive);
                }
            };
        
            source.connect(inputNode);
            inputNode.connect(actx.destination);

            isRunning = true;

        }

        this.start = function() { 
            navigator.getUserMedia( { audio : true }, startStream, function(userMediaError) {
                    error(userMediaError.name + " : " + userMediaError.message);
            });
        };

        this.stop = function() {
        
        };
        
           
    }//AudioInput
    
    var audioInput = new AudioInput();
    
    function start() {
        audioInput.start();    
        waterfall.start();
    }

    function stop() {
        audioInput.stop();    
        waterfall.stop();
    }

} //DigiTest
