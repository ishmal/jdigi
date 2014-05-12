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

/**
 * A highly experimental resampler with hardcoded calculations
 */
function Resampler(decimation) {
    
    "use strict";
    
    //#########################################################
    //###  DECIMATION : 2
    //#########################################################
    var c0200 = -0.00000;
    var c0201 = 6.73393e-18;
    var c0202 = 0.287914;
    var c0203 = 0.452254;
    var c0204 = 0.109973;
    var c0205 = 0.00000;

    //#########################################################
    //###  DECIMATION : 3
    //#########################################################
    var c0300 = -0.00000;
    var c0301 = -0.00665934;
    var c0302 = 0.0318310;
    var c0303 = 0.181130;
    var c0304 = 0.318310;
    var c0305 = 0.271694;
    var c0306 = 0.106103;
    var c0307 = 0.00932308;
    var c0308 = -0.00000;

    //#########################################################
    //###  DECIMATION : 4
    //#########################################################
    var c0400 = -0.00000;
    var c0401 = -0.00357305;
    var c0402 = 2.84852e-18;
    var c0403 = 0.0428519;
    var c0404 = 0.131690;
    var c0405 = 0.220520;
    var c0406 = 0.244937;
    var c0407 = 0.186237;
    var c0408 = 0.0909025;
    var c0409 = 0.0219296;
    var c0410 = 7.73526e-19;
    var c0411 = -0.00000;

    //#########################################################
    //###  DECIMATION : 5
    //#########################################################
    var c0500 = -0.00000;
    var c0501 = -0.00196172;
    var c0502 = -0.00336679;
    var c0503 = 0.00849726;
    var c0504 = 0.0449745;
    var c0505 = 0.103355;
    var c0506 = 0.163178;
    var c0507 = 0.196726;
    var c0508 = 0.186985;
    var c0509 = 0.139359;
    var c0510 = 0.0778281;
    var c0511 = 0.0286021;
    var c0512 = 0.00411497;
    var c0513 = -0.000885547;
    var c0514 = -0.00000;

    //#########################################################
    //###  DECIMATION : 6
    //#########################################################
    var c0600 = -0.00000;
    var c0601 = -0.00116344;
    var c0602 = -0.00296700;
    var c0603 = 1.80051e-18;
    var c0604 = 0.0144470;
    var c0605 = 0.0438880;
    var c0606 = 0.0850224;
    var c0607 = 0.127510;
    var c0608 = 0.157800;
    var c0609 = 0.165248;
    var c0610 = 0.147236;
    var c0611 = 0.110447;
    var c0612 = 0.0675699;
    var c0613 = 0.0312787;
    var c0614 = 0.00882135;
    var c0615 = 8.47823e-19;
    var c0616 = -0.000767670;
    var c0617 = -0.00000;

    //#########################################################
    //###  DECIMATION : 7
    //#########################################################
    var c0700 = -0.00000;
    var c0701 = -0.000738756;
    var c0702 = -0.00222959;
    var c0703 = -0.00194649;
    var c0704 = 0.00376483;
    var c0705 = 0.0180421;
    var c0706 = 0.0417122;
    var c0707 = 0.0722011;
    var c0708 = 0.103761;
    var c0709 = 0.129071;
    var c0710 = 0.141661;
    var c0711 = 0.138195;
    var c0712 = 0.119674;
    var c0713 = 0.0910713;
    var c0714 = 0.0595247;
    var c0715 = 0.0318653;
    var c0716 = 0.0124668;
    var c0717 = 0.00224596;
    var c0718 = -0.000901830;
    var c0719 = -0.000571381;
    var c0720 = -0.00000;

    var idx = 0;
    
    var r0 = 0.0;
    var r1 = 0.0;
    var r2 = 0.0;
    var r3 = 0.0;
    var r4 = 0.0;
    var r5 = 0.0;
    var r6 = 0.0;
    var r7 = 0.0;
    var r8 = 0.0;
    var r9 = 0.0;
    
    var i0 = 0.0;
    var i1 = 0.0;
    var i2 = 0.0;
    var i3 = 0.0;
    var i4 = 0.0;
    var i5 = 0.0;
    var i6 = 0.0;
    var i7 = 0.0;
    var i8 = 0.0;
    var i9 = 0.0;

    var bufr = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    var bufi = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    
    function decimate1(v, f) { f(v); }
    function interpolate1(v, f) { f(v); }

    //#############################################
    //# 2
    //#############################################
        
    function decimate2(v,f) {
        bufr[idx++] = v;
        if (idx >= decimation) {
            idx = 0;
            r0 = r2;
            r1 = r3;
            r2 = bufr[0];
            r3 = bufr[1];
            var sum = /*r0 * c0200 +*/ r1 * c0202 + r2 * c0204 +
                      r1 * c0201 + r2 * c0203/* + r3 * c0205*/;
            f(sum);
            }
    }

    function interpolate2(v, f) {
        r0 = r1; r1 = r2; r2 = v;
        f(/*r0 * c0200 + */r1 * c0202 + r2 * c0204);
        f(r0 * c0201 + r1 * c0203/* + r2 * c0205*/);
    }

    function decimate2x(v,f) {
        bufr[idx]   = v.r;
        bufi[idx++] = v.i;
        if (idx >= decimation) {
            idx = 0;
            r0 = r2;
            r1 = r3;
            r2 = bufr[0];
            r3 = bufr[1];
            var sumr = /*r0*c0200 +*/ r1*c0202 + r2*c0204 +
                      r1*c0201 + r2*c0203/* + r3*c0205*/;
            i0 = i2;
            i1 = i3;
            i2 = bufi[0];
            i3 = bufi[1];
            var sumi = /*i0*c0200 +*/ i1*c0202 + i2*c0204 +
                      i1*c0201 + i2*c0203/* + i3*c0205*/;
            f(new Complex(sumr, sumi));
            }
    }

    function interpolate2x(v, f) {
        r0 = r1; r1 = r2; r2 = v.r;
        i0 = i1; i1 = i2; i2 = v.i;
        f(new Complex(/*r0*c0200 + */r1*c0202 + r2*c0204, /*i0*c0200 + */i1*c0202 + i2*c0204));
        f(new Complex(r0*c0201 + r1*c0203/* + r2*c0205*/, i0*c0201 + i1*c0203/* + i2*c0205*/));
    }

    //#############################################
    //# 3
    //#############################################

    function decimate3(v, f) {
        bufr[idx++] = v;
        if (idx >= decimation) {
            idx = 0;
            r0 = r3;
            r1 = r4;
            r2 = bufr[0];
            r3 = bufr[1];
            r4 = bufr[2];
            var sum = /*r0*c0300 + */r1*c0303 + r2*c0306 +
                      r1*c0301 + r2*c0304 + r3*c0307 +
                      r2*c0302 + r3*c0305/* + r4*c0308*/;
            f(sum);
            }
    }

    function interpolate3(v, f) {
        r0 = r1; r1 = r2; r2 = v;
        f(r0*c0300 + r1*c0303 + r2*c0306);
        f(r0*c0301 + r1*c0304 + r2*c0307);
        f(r0*c0302 + r1*c0305 + r2*c0308);
    }

    function decimate3x(v, f) {
        bufr[idx]   = v.r;
        bufi[idx++] = v.i;
        if (idx >= decimation) {
            idx = 0;
            r0 = r3;
            r1 = r4;
            r2 = bufr[0];
            r3 = bufr[1];
            r4 = bufr[2];
            var sumr = /*r0*c0300 + */r1*c0303 + r2*c0306 +
                       r1*c0301 + r2*c0304 + r3*c0307 +
                       i2*c0302 + i3*c0305/* + i4*c0308*/;
            i0 = i3;
            i1 = i4;
            i2 = bufi[0];
            i3 = bufi[1];
            i4 = bufi[2];
            var sumi = /*i0*c0300 + */i1*c0303 + i2*c0306 +
                       i1*c0301 + i2*c0304 + i3*c0307 +
                       i2*c0302 + i3*c0305/* + i4*c0308*/;
            f(new Complex(sumr, sumi));
            }
    }

    function interpolate3x(v, f) {
        r0 = r1; r1 = r2; r2 = v.r;
        i0 = i1; i1 = i2; i2 = v.i;
        f(new Complex(r0*c0300 + r1*c0303 + r2*c0306, i0*c0300 + i1*c0303 + i2*c0306));
        f(new Complex(r0*c0301 + r1*c0304 + r2*c0307, i0*c0301 + i1*c0304 + i2*c0307));
        f(new Complex(r0*c0302 + r1*c0305 + r2*c0308, i0*c0302 + i1*c0305 + i2*c0308));
    }

    //#############################################
    //# 4
    //#############################################

    function decimate4(v, f) {
        bufr[idx++] = v;
        if (idx >= decimation) {
            idx = 0;
            r0 = r4;
            r1 = r5;
            r2 = bufr[0];
            r3 = bufr[1];
            r4 = bufr[2];
            r5 = bufr[3];
            var sum = /*r0*c0400 + */r1*c0404 + r2*c0408 +
                      r1*c0401 + r2*c0405 + r3*c0409 +
                      r2*c0402 + r3*c0406 + r4*c0410 +
                      r3*c0403 + r4*c0407/* + r5*c0411*/;
            f(sum);
            }
    }

    function interpolate4(v, f) {
        r0 = r1; r1 = r2; r2 = v;
        f(r0*c0400 + r1*c0404 + r2*c0408);
        f(r0*c0401 + r1*c0405 + r2*c0409);
        f(r0*c0402 + r1*c0406 + r2*c0410);
        f(r0*c0403 + r1*c0407 + r2*c0411);
    }

    function decimate4x(v, f) {
        bufr[idx]   = v.r;
        bufi[idx++] = v.i;
        if (idx >= decimation) {
            idx = 0;
            r0 = r4;
            r1 = r5;
            r2 = bufr[0];
            r3 = bufr[1];
            r4 = bufr[2];
            r5 = bufr[3];
            var sumr = /*r0*c0400 + */r1*c0404 + r2*c0408 +
                       r1*c0401 + r2*c0405 + r3*c0409 +
                       r2*c0402 + r3*c0406 + r4*c0410 +
                       r3*c0403 + r4*c0407/* + r5*c0411*/;
            i0 = i4;
            i1 = i5;
            i2 = bufi[0];
            i3 = bufi[1];
            i4 = bufi[2];
            i5 = bufi[3];
            var sumi = /*i0*c0400 + */i1*c0404 + i2*c0408 +
                       i1*c0401 + i2*c0405 + i3*c0409 +
                       i2*c0402 + i3*c0406 + i4*c0410 +
                       i3*c0403 + i4*c0407/* + i5*c0411*/;
            f(new Complex(sumr, sumi));
            }
    }

    function interpolate4x(v, f) {
        r0 = r1; r1 = r2; r2 = v.r;
        i0 = i1; i1 = i2; i2 = v.i;
        f(new Complex(r0*c0400 + r1*c0404 + r2*c0408, i0*c0400 + i1*c0404 + i2*c0408));
        f(new Complex(r0*c0401 + r1*c0405 + r2*c0409, i0*c0401 + i1*c0405 + i2*c0409));
        f(new Complex(r0*c0402 + r1*c0406 + r2*c0410, i0*c0402 + i1*c0406 + i2*c0410));
        f(new Complex(r0*c0403 + r1*c0407 + r2*c0411, i0*c0403 + i1*c0407 + i2*c0411));
    }

    //#############################################
    //# 5
    //#############################################

    function decimate5(v, f) {
        bufr[idx++] = v;
        if (idx >= decimation) {
            idx = 0;
            r0 = r5;
            r1 = r6;
            r2 = bufr[0];
            r3 = bufr[1];
            r4 = bufr[2];
            r5 = bufr[3];
            r6 = bufr[4];
            var sum = /*r0*c0500 + */r1*c0505 + r2*c0510 +
                      r1*c0501 + r2*c0506 + r3*c0511 +
                      r2*c0502 + r3*c0507 + r4*c0512 +
                      r3*c0503 + r4*c0508 + r5*c0513 +
                      r4*c0504 + r5*c0509/* + r6*c0514*/;
            f(sum);
            }
    }

    function interpolate5(v, f) {
        r0 = r1; r1 = r2; r2 = v;
        f(r0*c0500 + r1*c0505 + r2*c0510);
        f(r0*c0501 + r1*c0506 + r2*c0511);
        f(r0*c0502 + r1*c0507 + r2*c0512);
        f(r0*c0503 + r1*c0508 + r2*c0513);
        f(r0*c0504 + r1*c0509 + r2*c0514);
    }

    function decimate5x(v, f) {
        bufr[idx]   = v.r;
        bufi[idx++] = v.i;
        if (idx >= decimation) {
            idx = 0;
            r0 = r5;
            r1 = r6;
            r2 = bufr[0];
            r3 = bufr[1];
            r4 = bufr[2];
            r5 = bufr[3];
            r6 = bufr[4];
            var sumr = /*r0*c0500 + */r1*c0505 + r2*c0510 +
                       r1*c0501 + r2*c0506 + r3*c0511 +
                       r2*c0502 + r3*c0507 + r4*c0512 +
                       r3*c0503 + r4*c0508 + r5*c0513 +
                       r4*c0504 + r5*c0509/* + r6*c0514*/;
            i0 = i5;
            i1 = i6;
            i2 = bufi[0];
            i3 = bufi[1];
            i4 = bufi[2];
            i5 = bufi[3];
            i6 = bufi[4];
            var sumi = /*i0*c0500 + */i1*c0505 + i2*c0510 +
                       i1*c0501 + i2*c0506 + i3*c0511 +
                       i2*c0502 + i3*c0507 + i4*c0512 +
                       i3*c0503 + i4*c0508 + i5*c0513 +
                       i4*c0504 + i5*c0509/* + i6*c0514*/;
            f(new Complex(sumr, sumi));
            }
    }

    function interpolate5x(v, f) {
        r0 = r1; r1 = r2; r2 = v.r;
        i0 = i1; i1 = i2; i2 = v.i;
        f(new Complex(r0*c0500 + r1*c0505 + r2*c0510, i0*c0500 + i1*c0505 + i2*c0510));
        f(new Complex(r0*c0501 + r1*c0506 + r2*c0511, i0*c0501 + i1*c0506 + i2*c0511));
        f(new Complex(r0*c0502 + r1*c0507 + r2*c0512, i0*c0502 + i1*c0507 + i2*c0512));
        f(new Complex(r0*c0503 + r1*c0508 + r2*c0513, i0*c0503 + i1*c0508 + i2*c0513));
        f(new Complex(r0*c0504 + r1*c0509 + r2*c0514, i0*c0504 + i1*c0509 + i2*c0514));
    }

    //#############################################
    //# 6
    //#############################################

    function decimate6(v, f) {
        bufr[idx++] = v;
        if (idx >= decimation){
            idx = 0;
            r0 = r6;
            r1 = r7;
            r2 = bufr[0];
            r3 = bufr[1];
            r4 = bufr[2];
            r5 = bufr[3];
            r6 = bufr[4];
            r7 = bufr[5];
            var sum = /*r0*c0600 +*/ r1*c0606 + r2*c0612 +
                      r1*c0601 + r2*c0607 + r3*c0613 +
                      r2*c0602 + r3*c0608 + r4*c0614 +
                      r3*c0603 + r4*c0609 + r5*c0615 +
                      r4*c0604 + r5*c0610 + r6*c0616 +
                      r5*c0605 + r6*c0611/* + r7*c0617*/;
            f(sum);
            }
    }

    function interpolate6(v, f) {
        r0 = r1; r1 = r2; r2 = v;
        f(r0*c0600 + r1*c0606 + r2*c0612);
        f(r0*c0601 + r1*c0607 + r2*c0613);
        f(r0*c0602 + r1*c0608 + r2*c0614);
        f(r0*c0603 + r1*c0609 + r2*c0615);
        f(r0*c0604 + r1*c0610 + r2*c0616);
        f(r0*c0605 + r1*c0611 + r2*c0617);
    }

    function decimate6x(v, f) {
        bufr[idx]   = v.r;
        bufi[idx++] = v.i;
        if (idx >= decimation){
            idx = 0;
            r0 = r6;
            r1 = r7;
            r2 = bufr[0];
            r3 = bufr[1];
            r4 = bufr[2];
            r5 = bufr[3];
            r6 = bufr[4];
            r7 = bufr[5];
            var sumr = /*r0*c0600 +*/ r1*c0606 + r2*c0612 +
                       r1*c0601 + r2*c0607 + r3*c0613 +
                       r2*c0602 + r3*c0608 + r4*c0614 +
                       r3*c0603 + r4*c0609 + r5*c0615 +
                       r4*c0604 + r5*c0610 + r6*c0616 +
                       r5*c0605 + r6*c0611/* + r7*c0617*/;
            i0 = i6;
            i1 = i7;
            i2 = bufi[0];
            i3 = bufi[1];
            i4 = bufi[2];
            i5 = bufi[3];
            i6 = bufi[4];
            i7 = bufi[5];
            var sumi = /*i0*c0600 +*/ i1*c0606 + i2*c0612 +
                       i1*c0601 + i2*c0607 + i3*c0613 +
                       i2*c0602 + i3*c0608 + i4*c0614 +
                       i3*c0603 + i4*c0609 + i5*c0615 +
                       i4*c0604 + i5*c0610 + i6*c0616 +
                       i5*c0605 + i6*c0611/* + i7*c0617*/;
            f(new Complex(sumr, sumi));
            }
    }

    function interpolate6x(v, f) {
        r0 = r1; r1 = r2; r2 = v;
        i0 = i1; i1 = i2; i2 = v;
        f(new Complex(r0*c0600 + r1*c0606 + r2*c0612, i0*c0600 + i1*c0606 + i2*c0612));
        f(new Complex(r0*c0601 + r1*c0607 + r2*c0613, i0*c0601 + i1*c0607 + i2*c0613));
        f(new Complex(r0*c0602 + r1*c0608 + r2*c0614, i0*c0602 + i1*c0608 + i2*c0614));
        f(new Complex(r0*c0603 + r1*c0609 + r2*c0615, i0*c0603 + i1*c0609 + i2*c0615));
        f(new Complex(r0*c0604 + r1*c0610 + r2*c0616, i0*c0604 + i1*c0610 + i2*c0616));
        f(new Complex(r0*c0605 + r1*c0611 + r2*c0617, i0*c0605 + i1*c0611 + i2*c0617));
    }

    //#############################################
    //# 7
    //#############################################

    function decimate7(v, f) {
        bufr[idx++] = v;
        if (idx >= decimation) {
            idx = 0;
            r0 = r7;
            r1 = r8;
            r2 = bufr[0];
            r3 = bufr[1];
            r4 = bufr[2];
            r5 = bufr[3];
            r6 = bufr[4];
            r7 = bufr[5];
            r8 = bufr[6];
            var sum = /*r0*c0700 + */r1*c0707 + r2*c0714 +
                      r1*c0701 + r2*c0708 + r3*c0715 +
                      r2*c0702 + r3*c0709 + r4*c0716 +
                      r3*c0703 + r4*c0710 + r5*c0717 +
                      r4*c0704 + r5*c0711 + r6*c0718 +
                      r5*c0705 + r6*c0712 + r7*c0719 +
                      r6*c0706 + r7*c0713/* + r8*c0720*/;
            f(sum);
            }
    }

    function interpolate7(v, f) {
        r0 = r1; r1 = r2; r2 = v;
        f(r0*c0700 + r1*c0707 + r2*c0714);
        f(r0*c0701 + r1*c0708 + r2*c0715);
        f(r0*c0702 + r1*c0709 + r2*c0716);
        f(r0*c0703 + r1*c0710 + r2*c0717);
        f(r0*c0704 + r1*c0711 + r2*c0718);
        f(r0*c0705 + r1*c0712 + r2*c0719);
        f(r0*c0706 + r1*c0713 + r2*c0720);
    }
    
    function decimate7x(v, f) {
        bufr[idx]   = v.r;
        bufi[idx++] = v.i;
        if (idx >= decimation) {
            idx = 0;
            r0 = r7;
            r1 = r8;
            r2 = bufr[0];
            r3 = bufr[1];
            r4 = bufr[2];
            r5 = bufr[3];
            r6 = bufr[4];
            r7 = bufr[5];
            r8 = bufr[6];
            var sumr = /*r0*c0700 + */r1*c0707 + r2*c0714 +
                       r1*c0701 + r2*c0708 + r3*c0715 +
                       r2*c0702 + r3*c0709 + r4*c0716 +
                       r3*c0703 + r4*c0710 + r5*c0717 +
                       r4*c0704 + r5*c0711 + r6*c0718 +
                       r5*c0705 + r6*c0712 + r7*c0719 +
                       r6*c0706 + r7*c0713/* + r8*c0720*/;
            i0 = i7;
            i1 = i8;
            i2 = bufi[0];
            i3 = bufi[1];
            i4 = bufi[2];
            i5 = bufi[3];
            i6 = bufi[4];
            i7 = bufi[5];
            i8 = bufi[6];
            var sumi = /*i0*c0700 + */i1*c0707 + i2*c0714 +
                       i1*c0701 + i2*c0708 + i3*c0715 +
                       i2*c0702 + i3*c0709 + i4*c0716 +
                       i3*c0703 + i4*c0710 + i5*c0717 +
                       i4*c0704 + i5*c0711 + i6*c0718 +
                       i5*c0705 + i6*c0712 + i7*c0719 +
                       i6*c0706 + i7*c0713/* + i8*c0720*/;
            f(new Complex(sumr, sumi));
            }
    }

    function interpolate7x(v, f) {
        r0 = r1; r1 = r2; r2 = v;
        i0 = i1; i1 = i2; i2 = v;
        f(new Complex(r0*c0700 + r1*c0707 + r2*c0714, i0*c0700 + i1*c0707 + i2*c0714));
        f(new Complex(r0*c0701 + r1*c0708 + r2*c0715, i0*c0701 + i1*c0708 + i2*c0715));
        f(new Complex(r0*c0702 + r1*c0709 + r2*c0716, i0*c0702 + i1*c0709 + i2*c0716));
        f(new Complex(r0*c0703 + r1*c0710 + r2*c0717, i0*c0703 + i1*c0710 + i2*c0717));
        f(new Complex(r0*c0704 + r1*c0711 + r2*c0718, i0*c0704 + i1*c0711 + i2*c0718));
        f(new Complex(r0*c0705 + r1*c0712 + r2*c0719, i0*c0705 + i1*c0712 + i2*c0719));
        f(new Complex(r0*c0706 + r1*c0713 + r2*c0720, i0*c0706 + i1*c0713 + i2*c0720));
    }

    //#############################################
    //# M A I N
    //#############################################
    
    switch (decimation) {
        case 1 : this.decimate  = decimate1;  this.interpolate  = interpolate1;
                 this.decimatex = decimate1;  this.interpolatex = interpolate1; break;
        case 2 : this.decimate  = decimate2;  this.interpolate  = interpolate2;
                 this.decimatex = decimate2x; this.interpolatex = interpolate2x; break;
        case 3 : this.decimate  = decimate3;  this.interpolate  = interpolate3;
                 this.decimatex = decimate3x; this.interpolatex = interpolate3x; break;
        case 4 : this.decimate  = decimate4;  this.interpolate  = interpolate4;
                 this.decimatex = decimate4x; this.interpolatex = interpolate4x; break;
        case 5 : this.decimate  = decimate5;  this.interpolate  = interpolate5;
                 this.decimatex = decimate5x; this.interpolatex = interpolate5x; break;
        case 6 : this.decimate  = decimate6;  this.interpolate  = interpolate6;
                 this.decimatex = decimate6x; this.interpolatex = interpolate6x; break;
        case 7 : this.decimate  = decimate7;  this.interpolate  = interpolate7;
                 this.decimatex = decimate7x; this.interpolatex = interpolate7x; break;
        default:  throw new IllegalArgumentException("Decimation " + decimation + " not supported");
        }


} // Resampler

module.exports.Resampler = Resampler;




