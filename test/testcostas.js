

var assert = require("assert");
var Costas = require("../src/costas").Costas;
var Nco = require("../src/nco").Nco;

describe('Costas Tests', function(){

  describe('Costas1', function(){
    it('Costas loop stays locked on center frequency', function(){
      var sampleRate = 10000;
      var dataRate = 30;
      var frequency = 1000;
      var costas = new Costas(frequency, dataRate, sampleRate);
      var nco = new Nco(frequency, sampleRate);
      for (var i=0 ; i<100000 ; i++) {
          var v = nco.next();
          var vp = costas.update(v.cos);
      }
    });
  });

  describe('Costas2', function(){
    it('Costas loop merges onto adjacent frequency', function(){
      var sampleRate = 10000;
      var dataRate = 30;
      var frequency = 1000;
      var costas = new Costas(frequency + 10, dataRate, sampleRate);
      var nco = new Nco(frequency, sampleRate);
      for (var i=0 ; i<1000000 ; i++) {
          var v = nco.next();
          var vp = costas.update(v.cos);
      }
    });
  });

});
