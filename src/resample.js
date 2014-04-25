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

    var d0 = 0.0;
    var d1 = 0.0;
    var d2 = 0.0;
    var d3 = 0.0;
    var d4 = 0.0;
    var d5 = 0.0;
    var d6 = 0.0;
    var d7 = 0.0;
    var d8 = 0.0;
    var d9 = 0.0;

    var idx = 0;
    var buf = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    
    function decimate1(v, f) { f(v); }
    function interpolate1(v, f) { f(v); }

        
    function decimate2(v,f) {
        buf[idx++] = v;
        if (idx >= decimation) {
            idx = 0;
            d0 = d2;
            d1 = d3;
            d2 = buf[0];
            d3 = buf[1];
            var sum = /*d0 * c0200 +*/ d1 * c0202 + d2 * c0204 +
                      d1 * c0201 + d2 * c0203/* + d3 * c0205*/;
            f(sum);
            }
    }

    function interpolate2(v, f) {
        d0 = d1; d1 = d2; d2 = v;
        f(/*d0 * c0200 + */d1 * c0202 + d2 * c0204);
        f(d0 * c0201 + d1 * c0203/* + d2 * c0205*/);
    }

    function decimate3(v, f) {
        buf[idx++] = v;
        if (idx >= decimation) {
            idx = 0;
            d0 = d3;
            d1 = d4;
            d2 = buf[0];
            d3 = buf[1];
            d4 = buf[2];
            var sum = /*d0 * c0300 + */d1 * c0303 + d2 * c0306 +
                      d1 * c0301 + d2 * c0304 + d3 * c0307 +
                      d2 * c0302 + d3 * c0305/* + d4 * c0308*/;
            f(sum);
            }
    }

    function interpolate3(v, f) {
        d0 = d1; d1 = d2; d2 = v;
        f(d0 * c0300 + d1 * c0303 + d2 * c0306);
        f(d0 * c0301 + d1 * c0304 + d2 * c0307);
        f(d0 * c0302 + d1 * c0305 + d2 * c0308);
    }

    function decimate4(v, f) {
        buf[idx++] = v;
        if (idx >= decimation) {
            idx = 0;
            d0 = d4;
            d1 = d5;
            d2 = buf[0];
            d3 = buf[1];
            d4 = buf[2];
            d5 = buf[3];
            var sum = /*d0 * c0400 + */d1 * c0404 + d2 * c0408 +
                      d1 * c0401 + d2 * c0405 + d3 * c0409 +
                      d2 * c0402 + d3 * c0406 + d4 * c0410 +
                      d3 * c0403 + d4 * c0407/* + d5 * c0411*/;
            f(sum);
            }
    }

    function interpolate4(v, f) {
        d0 = d1; d1 = d2; d2 = v;
        f(d0 * c0400 + d1 * c0404 + d2 * c0408);
        f(d0 * c0401 + d1 * c0405 + d2 * c0409);
        f(d0 * c0402 + d1 * c0406 + d2 * c0410);
        f(d0 * c0403 + d1 * c0407 + d2 * c0411);
    }

    function decimate5(v, f) {
        buf[idx++] = v;
        if (idx >= decimation) {
            idx = 0;
            d0 = d5;
            d1 = d6;
            d2 = buf[0];
            d3 = buf[1];
            d4 = buf[2];
            d5 = buf[3];
            d6 = buf[4];
            var sum = /*d0 * c0500 + */d1 * c0505 + d2 * c0510 +
                      d1 * c0501 + d2 * c0506 + d3 * c0511 +
                      d2 * c0502 + d3 * c0507 + d4 * c0512 +
                      d3 * c0503 + d4 * c0508 + d5 * c0513 +
                      d4 * c0504 + d5 * c0509/* + d6 * c0514*/;
            f(sum);
            }
    }

    function interpolate5(v, f) {
        d0 = d1; d1 = d2; d2 = v;
        f(d0 * c0500 + d1 * c0505 + d2 * c0510);
        f(d0 * c0501 + d1 * c0506 + d2 * c0511);
        f(d0 * c0502 + d1 * c0507 + d2 * c0512);
        f(d0 * c0503 + d1 * c0508 + d2 * c0513);
        f(d0 * c0504 + d1 * c0509 + d2 * c0514);
    }

    function decimate6(v, f) {
        buf[idx++] = v;
        if (idx >= decimation){
            idx = 0;
            d0 = d6;
            d1 = d7;
            d2 = buf[0];
            d3 = buf[1];
            d4 = buf[2];
            d5 = buf[3];
            d6 = buf[4];
            d7 = buf[5];
            var sum = /*d0 * c0600 +*/ d1 * c0606 + d2 * c0612 +
                      d1 * c0601 + d2 * c0607 + d3 * c0613 +
                      d2 * c0602 + d3 * c0608 + d4 * c0614 +
                      d3 * c0603 + d4 * c0609 + d5 * c0615 +
                      d4 * c0604 + d5 * c0610 + d6 * c0616 +
                      d5 * c0605 + d6 * c0611/* + d7 * c0617*/;
            f(sum);
            }
    }

    function interpolate6(v, f) {
        d0 = d1; d1 = d2; d2 = v;
        f(d0 * c0600 + d1 * c0606 + d2 * c0612);
        f(d0 * c0601 + d1 * c0607 + d2 * c0613);
        f(d0 * c0602 + d1 * c0608 + d2 * c0614);
        f(d0 * c0603 + d1 * c0609 + d2 * c0615);
        f(d0 * c0604 + d1 * c0610 + d2 * c0616);
        f(d0 * c0605 + d1 * c0611 + d2 * c0617);
    }

    function decimate7(v, f) {
        buf[idx++] = v;
        if (idx >= decimation) {
            idx = 0;
            d0 = d7;
            d1 = d8;
            d2 = buf[0];
            d3 = buf[1];
            d4 = buf[2];
            d5 = buf[3];
            d6 = buf[4];
            d7 = buf[5];
            d8 = buf[6];
            var sum = /*d0 * c0700 + */d1 * c0707 + d2 * c0714 +
                      d1 * c0701 + d2 * c0708 + d3 * c0715 +
                      d2 * c0702 + d3 * c0709 + d4 * c0716 +
                      d3 * c0703 + d4 * c0710 + d5 * c0717 +
                      d4 * c0704 + d5 * c0711 + d6 * c0718 +
                      d5 * c0705 + d6 * c0712 + d7 * c0719 +
                      d6 * c0706 + d7 * c0713/* + d8 * c0720*/;
            f(sum);
            }
    }

    function interpolate7(v, f) {
        d0 = d1; d1 = d2; d2 = v;
        f(d0 * c0700 + d1 * c0707 + d2 * c0714);
        f(d0 * c0701 + d1 * c0708 + d2 * c0715);
        f(d0 * c0702 + d1 * c0709 + d2 * c0716);
        f(d0 * c0703 + d1 * c0710 + d2 * c0717);
        f(d0 * c0704 + d1 * c0711 + d2 * c0718);
        f(d0 * c0705 + d1 * c0712 + d2 * c0719);
        f(d0 * c0706 + d1 * c0713 + d2 * c0720);
    }

    
    switch (decimation) {
        case 1 : this.decimate = decimate1; this.interpolate = interpolate1; break;
        case 2 : this.decimate = decimate2; this.interpolate = interpolate2; break;
        case 3 : this.decimate = decimate3; this.interpolate = interpolate3; break;
        case 4 : this.decimate = decimate4; this.interpolate = interpolate4; break;
        case 5 : this.decimate = decimate5; this.interpolate = interpolate5; break;
        case 6 : this.decimate = decimate6; this.interpolate = interpolate6; break;
        case 7 : this.decimate = decimate7; this.interpolate = interpolate7; break;
        default:  throw new IllegalArgumentException("Decimation " + decimation + " not supported");
        }
}





