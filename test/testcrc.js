

var assert = require("assert");
var Crc = require("../src/mode/packet").Crc;

describe('CRC Tests', function(){

    function vout(v) {
        console.log("val:" + v.toString(16));
    };

    describe('CRC', function(){
		it("Null length message", function() {
			var crc = new Crc();
			var v = crc.value()
			vout(v);
			assert.equal(0xffff, v);
		});
	});
    describe('CRC', function(){
		it("Single letter 'A'", function() {
			var crc = new Crc();
			crc.update('A'.charCodeAt(0));  //ascii A
			var v = crc.value();
			vout(v);
			assert.equal(0xb915, v);
		});
	});
    describe('CRC', function(){
		it("Calculates '123456789'", function() {
			var str = "123456789";
			var crc = new Crc();
			for (var i=0 ; i<str.length ; i++) {
				crc.update(str.charCodeAt(i));
			}
			var v = crc.value();
			vout(v);
			assert.equal(0x29b1, v);
		});
	});
    describe('CRC', function(){
		it("the quick brown fox", function() {
			var str = "the quick brown fox";
			var crc = new Crc();
			for (var i=0 ; i<str.length ; i++) {
				crc.update(str.charCodeAt(i));
			}
			var v = crc.value();
			vout(v);
			assert.equal(0x7e06, v);
		});
	});
    describe('CRC', function(){
		it("Calculates 256 'A'", function() {
			var crc = new Crc();
			for (var i=0 ; i<256 ; i++)
				crc.update(65);  //ascii A
			var v = crc.value();
			vout(v);
			assert.equal(0xea0b, v);
		});
	});
});
