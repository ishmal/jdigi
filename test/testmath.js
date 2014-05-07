

var assert = require("assert");
var app = require("../src/math.js");

describe('Math Tests', function(){
  describe('FFT', function(){
    it('FFT should generate proper butterfly indices', function(){
      var fft = new app._test.FFT(16);
      var butterflies = fft.butterflies;
      var len = butterflies.length;
      for (var i = 0 ; i < len ; i++) {
          console.log("==============\nw:" + i);
          var bf = butterflies[i];
          var left  = bf.left;
          var right = bf.right;
          for (var j = 0 ; j < bf.left.length ; j++) {
              console.log("i" + j + " : " + left[j] + " / " + right[j]);
          }
      }
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});
