

var assert = require("assert");
var fftmod = require("../src/fft");

describe('Math Tests', function(){
  describe('FFT', function(){
    it('FFT should generate proper butterfly indices', function(){
      var fft = new fftmod.FFT(8);
      var stages = fft.stages;
      var len = stages.length;
      for (var i = 0 ; i < len ; i++) {
          console.log("==============\nw:" + i);
          var stageData = stages[i];
          for (var j = 0 ; j < stageData.length ; j++) {
              var parms = stageData[j];
              console.log("" + j + " : " + parms.l + " / " + parms.r + " / " + parms.idx + " / " + parms.wr + " / " + parms.wi);
          }
      }
      //assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});
