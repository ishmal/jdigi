

var FFT = require("fft").FFT;
var Complex = require("math").Complex;

function Mode(par, sampleRateHint) {




}

function AudioInput(par) {

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
                decimator.decimate(input[i], par.receive);
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



/**
 * This is the top-level GUI-less app
 */
function Digi() {

    var self = this;
    
    var FFT_SIZE = 2048;
    var FFT_MASK = FFT_SIZE - 1;
    var BINS     = FFT_SIZE/2;
    
    this.FFT_SIZE = FFT_SIZE;
    this.FFT_MASK = FFT_MASK;
    this.BINS     = BINS;


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

    


    /**
     * Override this in the GUI
     */
    this.receiveSpectrum  = function(data) {};


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
        }        
    }        
    this.update = update;

    
    function transmit(data) {
    
    
    }
    


    
    var audioInput = new AudioInput(this);
    
    function getSampleRate() {
        return audioInput.getSampleRate();
    }
    
    function start() {
        audioInput.start();    
        waterfall.start();
    }
    this.start = start;

    function stop() {
        audioInput.stop();    
        waterfall.stop();
    }
    this.stop = stop;

} //DigiTest



