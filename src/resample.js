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

import {Complex} from "./math";


/**
 * ### decimation : 1
 */
function Resampler1() {
    this.value = 0;
    
    this.decimate = function(v) {
        value = v;
        return true;
    };

    this.decimatex = function(v) {
        value = v;
        return true;
    };

    this.interpolate = function(v, buf) {
        buf[0] = v;
    };

    this.interpolatex = function(v, buf) {
        buf[0] = v;
    };
}

//######################################
//## GENERATED
//######################################

/**
 * ### decimation : 2
 */
function Resampler2() {
    var d0=0; var d1=0; var d2=0; var d3=0; 
    var idx = 0;
    this.value = 0;

    this.decimate = function(v) {
        d0=d1; d1=d2; d2=d3; d3=v;
        if (++idx >= 2) {
            idx = 0;
            this.value = d2*0.90451;
            return true;
        } else {
            return false;
        }
    };

    this.decimatex = function(v) {
        d0=d1; d1=d2; d2=d3; d3=v;
        if (++idx >= 2) {
            idx = 0;
            var r = d2.r*0.90451;
            var i = d2.i*0.90451;
            this.value = { r:r, i:i };
            return true;
        } else {
            return false;
        }
    };

    this.interpolate = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = 0;
        buf[1] = d1 * 0.90451;
    };

    this.interpolatex = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = {r:0,i:0};
        buf[1] = {
            r: d1.r * 0.90451,
            i: d1.r * 0.90451
        };
    };

}

/**
 * ### decimation : 3
 */
function Resampler3() {
    var d0=0; var d1=0; var d2=0; var d3=0; var d4=0; 
    var idx = 0;
    this.value = 0;

    this.decimate = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=v;
        if (++idx >= 3) {
            idx = 0;
            this.value = d1*0.21783 + d2*0.48959 + d3*0.21783;
            return true;
        } else {
            return false;
        }
    };

    this.decimatex = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=v;
        if (++idx >= 3) {
            idx = 0;
            var r = d1.r*0.21783 + d2.r*0.48959 + d3.r*0.21783;
            var i = d1.i*0.21783 + d2.i*0.48959 + d3.i*0.21783;
            this.value = { r:r, i:i };
            return true;
        } else {
            return false;
        }
    };

    this.interpolate = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = d1 * 0.21783 + d2 * -0.06380;
        buf[1] = d1 * 0.61719;
        buf[2] = d0 * -0.06380 + d1 * 0.21783;
    };

    this.interpolatex = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = {
            r: d1.r * 0.21783 + d2.r * -0.06380,
            i: d1.r * 0.21783 + d2.r * -0.06380
        };
        buf[1] = {
            r: d1.r * 0.61719,
            i: d1.r * 0.61719
        };
        buf[2] = {
            r: d0.r * -0.06380 + d1.r * 0.21783,
            i: d0.r * -0.06380 + d1.r * 0.21783
        };
    };

}

/**
 * ### decimation : 4
 */
function Resampler4() {
    var d0=0; var d1=0; var d2=0; var d3=0; var d4=0; var d5=0; 
    var idx = 0;
    this.value = 0;

    this.decimate = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=v;
        if (++idx >= 4) {
            idx = 0;
            this.value = d1*0.00480 + d2*0.29652 + d3*0.37867 + d4*0.25042;
            return true;
        } else {
            return false;
        }
    };

    this.decimatex = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=v;
        if (++idx >= 4) {
            idx = 0;
            var r = d1.r*0.00480 + d2.r*0.29652 + d3.r*0.37867 + d4.r*0.25042;
            var i = d1.i*0.00480 + d2.i*0.29652 + d3.i*0.37867 + d4.i*0.25042;
            this.value = { r:r, i:i };
            return true;
        } else {
            return false;
        }
    };

    this.interpolate = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = 0;
        buf[1] = d0 * 0.00480 + d1 * 0.29652 + d2 * -0.02949;
        buf[2] = d1 * 0.46578;
        buf[3] = d0 * -0.05762 + d1 * 0.25042;
    };

    this.interpolatex = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = {r:0,i:0};
        buf[1] = {
            r: d0.r * 0.00480 + d1.r * 0.29652 + d2.r * -0.02949,
            i: d0.r * 0.00480 + d1.r * 0.29652 + d2.r * -0.02949
        };
        buf[2] = {
            r: d1.r * 0.46578,
            i: d1.r * 0.46578
        };
        buf[3] = {
            r: d0.r * -0.05762 + d1.r * 0.25042,
            i: d0.r * -0.05762 + d1.r * 0.25042
        };
    };

}

/**
 * ### decimation : 5
 */
function Resampler5() {
    var d0=0; var d1=0; var d2=0; var d3=0; var d4=0; var d5=0; var d6=0; 
    var idx = 0;
    this.value = 0;

    this.decimate = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=v;
        if (++idx >= 5) {
            idx = 0;
            this.value = d1*0.07325 + d2*0.23311 + d3*0.31859 + d4*0.23311 + 
                d5*0.07325;
            return true;
        } else {
            return false;
        }
    };

    this.decimatex = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=v;
        if (++idx >= 5) {
            idx = 0;
            var r = d1.r*0.07325 + d2.r*0.23311 + d3.r*0.31859 + d4.r*0.23311 + 
                d5.r*0.07325;
            var i = d1.i*0.07325 + d2.i*0.23311 + d3.i*0.31859 + d4.i*0.23311 + 
                d5.i*0.07325;
            this.value = { r:r, i:i };
            return true;
        } else {
            return false;
        }
    };

    this.interpolate = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = d1 * 0.07092 + d2 * -0.03560;
        buf[1] = d0 * 0.00233 + d1 * 0.26871 + d2 * -0.02747;
        buf[2] = d1 * 0.37354;
        buf[3] = d0 * -0.02747 + d1 * 0.26871 + d2 * 0.00233;
        buf[4] = d0 * -0.03560 + d1 * 0.07092;
    };

    this.interpolatex = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = {
            r: d1.r * 0.07092 + d2.r * -0.03560,
            i: d1.r * 0.07092 + d2.r * -0.03560
        };
        buf[1] = {
            r: d0.r * 0.00233 + d1.r * 0.26871 + d2.r * -0.02747,
            i: d0.r * 0.00233 + d1.r * 0.26871 + d2.r * -0.02747
        };
        buf[2] = {
            r: d1.r * 0.37354,
            i: d1.r * 0.37354
        };
        buf[3] = {
            r: d0.r * -0.02747 + d1.r * 0.26871 + d2.r * 0.00233,
            i: d0.r * -0.02747 + d1.r * 0.26871 + d2.r * 0.00233
        };
        buf[4] = {
            r: d0.r * -0.03560 + d1.r * 0.07092,
            i: d0.r * -0.03560 + d1.r * 0.07092
        };
    };

}

/**
 * ### decimation : 6
 */
function Resampler6() {
    var d0=0; var d1=0; var d2=0; var d3=0; var d4=0; var d5=0; var d6=0; var d7=0; 
                
    var idx = 0;
    this.value = 0;

    this.decimate = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=v;
        if (++idx >= 6) {
            idx = 0;
            this.value = d1*0.00110 + d2*0.12515 + d3*0.22836 + d4*0.27379 + 
                d5*0.19920 + d6*0.10546;
            return true;
        } else {
            return false;
        }
    };

    this.decimatex = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=v;
        if (++idx >= 6) {
            idx = 0;
            var r = d1.r*0.00110 + d2.r*0.12515 + d3.r*0.22836 + d4.r*0.27379 + 
                d5.r*0.19920 + d6.r*0.10546;
            var i = d1.i*0.00110 + d2.i*0.12515 + d3.i*0.22836 + d4.i*0.27379 + 
                d5.i*0.19920 + d6.i*0.10546;
            this.value = { r:r, i:i };
            return true;
        } else {
            return false;
        }
    };

    this.interpolate = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = 0;
        buf[1] = d0 * 0.00110 + d1 * 0.12030 + d2 * -0.02951;
        buf[2] = d0 * 0.00485 + d1 * 0.25787 + d2 * -0.01442;
        buf[3] = d1 * 0.31182;
        buf[4] = d0 * -0.02361 + d1 * 0.24061 + d2 * 0.00125;
        buf[5] = d0 * -0.04141 + d1 * 0.10420;
    };

    this.interpolatex = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = {r:0,i:0};
        buf[1] = {
            r: d0.r * 0.00110 + d1.r * 0.12030 + d2.r * -0.02951,
            i: d0.r * 0.00110 + d1.r * 0.12030 + d2.r * -0.02951
        };
        buf[2] = {
            r: d0.r * 0.00485 + d1.r * 0.25787 + d2.r * -0.01442,
            i: d0.r * 0.00485 + d1.r * 0.25787 + d2.r * -0.01442
        };
        buf[3] = {
            r: d1.r * 0.31182,
            i: d1.r * 0.31182
        };
        buf[4] = {
            r: d0.r * -0.02361 + d1.r * 0.24061 + d2.r * 0.00125,
            i: d0.r * -0.02361 + d1.r * 0.24061 + d2.r * 0.00125
        };
        buf[5] = {
            r: d0.r * -0.04141 + d1.r * 0.10420,
            i: d0.r * -0.04141 + d1.r * 0.10420
        };
    };

}

/**
 * ### decimation : 7
 */
function Resampler7() {
    var d0=0; var d1=0; var d2=0; var d3=0; var d4=0; var d5=0; var d6=0; var d7=0; 
                var d8=0; 
    var idx = 0;
    this.value = 0;

    this.decimate = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=d8; d8=v;
        if (++idx >= 7) {
            idx = 0;
            this.value = d1*0.03499 + d2*0.11298 + d3*0.19817 + d4*0.24057 + 
                d5*0.19817 + d6*0.11298 + d7*0.03499;
            return true;
        } else {
            return false;
        }
    };

    this.decimatex = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=d8; d8=v;
        if (++idx >= 7) {
            idx = 0;
            var r = d1.r*0.03499 + d2.r*0.11298 + d3.r*0.19817 + d4.r*0.24057 + 
                d5.r*0.19817 + d6.r*0.11298 + d7.r*0.03499;
            var i = d1.i*0.03499 + d2.i*0.11298 + d3.i*0.19817 + d4.i*0.24057 + 
                d5.i*0.19817 + d6.i*0.11298 + d7.i*0.03499;
            this.value = { r:r, i:i };
            return true;
        } else {
            return false;
        }
    };

    this.interpolate = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = d1 * 0.03420 + d2 * -0.02115;
        buf[1] = d0 * 0.00079 + d1 * 0.13135 + d2 * -0.02904;
        buf[2] = d0 * 0.00278 + d1 * 0.22721 + d2 * -0.01341;
        buf[3] = d1 * 0.26740;
        buf[4] = d0 * -0.01341 + d1 * 0.22721 + d2 * 0.00278;
        buf[5] = d0 * -0.02904 + d1 * 0.13135 + d2 * 0.00079;
        buf[6] = d0 * -0.02115 + d1 * 0.03420;
    };

    this.interpolatex = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = {
            r: d1.r * 0.03420 + d2.r * -0.02115,
            i: d1.r * 0.03420 + d2.r * -0.02115
        };
        buf[1] = {
            r: d0.r * 0.00079 + d1.r * 0.13135 + d2.r * -0.02904,
            i: d0.r * 0.00079 + d1.r * 0.13135 + d2.r * -0.02904
        };
        buf[2] = {
            r: d0.r * 0.00278 + d1.r * 0.22721 + d2.r * -0.01341,
            i: d0.r * 0.00278 + d1.r * 0.22721 + d2.r * -0.01341
        };
        buf[3] = {
            r: d1.r * 0.26740,
            i: d1.r * 0.26740
        };
        buf[4] = {
            r: d0.r * -0.01341 + d1.r * 0.22721 + d2.r * 0.00278,
            i: d0.r * -0.01341 + d1.r * 0.22721 + d2.r * 0.00278
        };
        buf[5] = {
            r: d0.r * -0.02904 + d1.r * 0.13135 + d2.r * 0.00079,
            i: d0.r * -0.02904 + d1.r * 0.13135 + d2.r * 0.00079
        };
        buf[6] = {
            r: d0.r * -0.02115 + d1.r * 0.03420,
            i: d0.r * -0.02115 + d1.r * 0.03420
        };
    };

}

/**
 * ### decimation : 11
 */
function Resampler11() {
    var d0=0; var d1=0; var d2=0; var d3=0; var d4=0; var d5=0; var d6=0; var d7=0; 
                var d8=0; var d9=0; var d10=0; var d11=0; var d12=0; 
    var idx = 0;
    this.value = 0;

    this.decimate = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=d8; d8=d9; d9=d10; 
                d10=d11; d11=d12; d12=v;
        if (++idx >= 11) {
            idx = 0;
            this.value = d1*0.01322 + d2*0.03922 + d3*0.07264 + d4*0.11402 + 
                d5*0.14759 + d6*0.16043 + d7*0.14759 + d8*0.11402 + d9*0.07264 + 
                d10*0.03922 + d11*0.01322;
            return true;
        } else {
            return false;
        }
    };

    this.decimatex = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=d8; d8=d9; d9=d10; 
                d10=d11; d11=d12; d12=v;
        if (++idx >= 11) {
            idx = 0;
            var r = d1.r*0.01322 + d2.r*0.03922 + d3.r*0.07264 + d4.r*0.11402 + 
                d5.r*0.14759 + d6.r*0.16043 + d7.r*0.14759 + d8.r*0.11402 + 
                d9.r*0.07264 + d10.r*0.03922 + d11.r*0.01322;
            var i = d1.i*0.01322 + d2.i*0.03922 + d3.i*0.07264 + d4.i*0.11402 + 
                d5.i*0.14759 + d6.i*0.16043 + d7.i*0.14759 + d8.i*0.11402 + 
                d9.i*0.07264 + d10.i*0.03922 + d11.i*0.01322;
            this.value = { r:r, i:i };
            return true;
        } else {
            return false;
        }
    };

    this.interpolate = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = d1 * 0.01307 + d2 * -0.00968;
        buf[1] = d0 * 0.00014 + d1 * 0.04810 + d2 * -0.01924;
        buf[2] = d0 * 0.00080 + d1 * 0.09012 + d2 * -0.01845;
        buf[3] = d0 * 0.00176 + d1 * 0.13050 + d2 * -0.01213;
        buf[4] = d0 * 0.00197 + d1 * 0.15972 + d2 * -0.00498;
        buf[5] = d1 * 0.17038;
        buf[6] = d0 * -0.00498 + d1 * 0.15972 + d2 * 0.00197;
        buf[7] = d0 * -0.01213 + d1 * 0.13050 + d2 * 0.00176;
        buf[8] = d0 * -0.01845 + d1 * 0.09012 + d2 * 0.00080;
        buf[9] = d0 * -0.01924 + d1 * 0.04810 + d2 * 0.00014;
        buf[10] = d0 * -0.00968 + d1 * 0.01307;
    };

    this.interpolatex = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = {
            r: d1.r * 0.01307 + d2.r * -0.00968,
            i: d1.r * 0.01307 + d2.r * -0.00968
        };
        buf[1] = {
            r: d0.r * 0.00014 + d1.r * 0.04810 + d2.r * -0.01924,
            i: d0.r * 0.00014 + d1.r * 0.04810 + d2.r * -0.01924
        };
        buf[2] = {
            r: d0.r * 0.00080 + d1.r * 0.09012 + d2.r * -0.01845,
            i: d0.r * 0.00080 + d1.r * 0.09012 + d2.r * -0.01845
        };
        buf[3] = {
            r: d0.r * 0.00176 + d1.r * 0.13050 + d2.r * -0.01213,
            i: d0.r * 0.00176 + d1.r * 0.13050 + d2.r * -0.01213
        };
        buf[4] = {
            r: d0.r * 0.00197 + d1.r * 0.15972 + d2.r * -0.00498,
            i: d0.r * 0.00197 + d1.r * 0.15972 + d2.r * -0.00498
        };
        buf[5] = {
            r: d1.r * 0.17038,
            i: d1.r * 0.17038
        };
        buf[6] = {
            r: d0.r * -0.00498 + d1.r * 0.15972 + d2.r * 0.00197,
            i: d0.r * -0.00498 + d1.r * 0.15972 + d2.r * 0.00197
        };
        buf[7] = {
            r: d0.r * -0.01213 + d1.r * 0.13050 + d2.r * 0.00176,
            i: d0.r * -0.01213 + d1.r * 0.13050 + d2.r * 0.00176
        };
        buf[8] = {
            r: d0.r * -0.01845 + d1.r * 0.09012 + d2.r * 0.00080,
            i: d0.r * -0.01845 + d1.r * 0.09012 + d2.r * 0.00080
        };
        buf[9] = {
            r: d0.r * -0.01924 + d1.r * 0.04810 + d2.r * 0.00014,
            i: d0.r * -0.01924 + d1.r * 0.04810 + d2.r * 0.00014
        };
        buf[10] = {
            r: d0.r * -0.00968 + d1.r * 0.01307,
            i: d0.r * -0.00968 + d1.r * 0.01307
        };
    };

}

/**
 * ### decimation : 13
 */
function Resampler13() {
    var d0=0; var d1=0; var d2=0; var d3=0; var d4=0; var d5=0; var d6=0; var d7=0; 
                var d8=0; var d9=0; var d10=0; var d11=0; var d12=0; var d13=0; var d14=0; 
                
    var idx = 0;
    this.value = 0;

    this.decimate = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=d8; d8=d9; d9=d10; 
                d10=d11; d11=d12; d12=d13; d13=d14; d14=v;
        if (++idx >= 13) {
            idx = 0;
            this.value = d1*0.00928 + d2*0.02648 + d3*0.04811 + d4*0.07773 + 
                d5*0.10746 + d6*0.12929 + d7*0.13729 + d8*0.12929 + d9*0.10746 + 
                d10*0.07773 + d11*0.04811 + d12*0.02648 + d13*0.00928;
            return true;
        } else {
            return false;
        }
    };

    this.decimatex = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=d8; d8=d9; d9=d10; 
                d10=d11; d11=d12; d12=d13; d13=d14; d14=v;
        if (++idx >= 13) {
            idx = 0;
            var r = d1.r*0.00928 + d2.r*0.02648 + d3.r*0.04811 + d4.r*0.07773 + 
                d5.r*0.10746 + d6.r*0.12929 + d7.r*0.13729 + d8.r*0.12929 + 
                d9.r*0.10746 + d10.r*0.07773 + d11.r*0.04811 + d12.r*0.02648 + 
                d13.r*0.00928;
            var i = d1.i*0.00928 + d2.i*0.02648 + d3.i*0.04811 + d4.i*0.07773 + 
                d5.i*0.10746 + d6.i*0.12929 + d7.i*0.13729 + d8.i*0.12929 + 
                d9.i*0.10746 + d10.i*0.07773 + d11.i*0.04811 + d12.i*0.02648 + 
                d13.i*0.00928;
            this.value = { r:r, i:i };
            return true;
        } else {
            return false;
        }
    };

    this.interpolate = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = d1 * 0.00920 + d2 * -0.00715;
        buf[1] = d0 * 0.00007 + d1 * 0.03319 + d2 * -0.01540;
        buf[2] = d0 * 0.00044 + d1 * 0.06239 + d2 * -0.01678;
        buf[3] = d0 * 0.00112 + d1 * 0.09278 + d2 * -0.01359;
        buf[4] = d0 * 0.00173 + d1 * 0.11945 + d2 * -0.00842;
        buf[5] = d0 * 0.00160 + d1 * 0.13771 + d2 * -0.00346;
        buf[6] = d1 * 0.14421;
        buf[7] = d0 * -0.00346 + d1 * 0.13771 + d2 * 0.00160;
        buf[8] = d0 * -0.00842 + d1 * 0.11945 + d2 * 0.00173;
        buf[9] = d0 * -0.01359 + d1 * 0.09278 + d2 * 0.00112;
        buf[10] = d0 * -0.01678 + d1 * 0.06239 + d2 * 0.00044;
        buf[11] = d0 * -0.01540 + d1 * 0.03319 + d2 * 0.00007;
        buf[12] = d0 * -0.00715 + d1 * 0.00920;
    };

    this.interpolatex = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = {
            r: d1.r * 0.00920 + d2.r * -0.00715,
            i: d1.r * 0.00920 + d2.r * -0.00715
        };
        buf[1] = {
            r: d0.r * 0.00007 + d1.r * 0.03319 + d2.r * -0.01540,
            i: d0.r * 0.00007 + d1.r * 0.03319 + d2.r * -0.01540
        };
        buf[2] = {
            r: d0.r * 0.00044 + d1.r * 0.06239 + d2.r * -0.01678,
            i: d0.r * 0.00044 + d1.r * 0.06239 + d2.r * -0.01678
        };
        buf[3] = {
            r: d0.r * 0.00112 + d1.r * 0.09278 + d2.r * -0.01359,
            i: d0.r * 0.00112 + d1.r * 0.09278 + d2.r * -0.01359
        };
        buf[4] = {
            r: d0.r * 0.00173 + d1.r * 0.11945 + d2.r * -0.00842,
            i: d0.r * 0.00173 + d1.r * 0.11945 + d2.r * -0.00842
        };
        buf[5] = {
            r: d0.r * 0.00160 + d1.r * 0.13771 + d2.r * -0.00346,
            i: d0.r * 0.00160 + d1.r * 0.13771 + d2.r * -0.00346
        };
        buf[6] = {
            r: d1.r * 0.14421,
            i: d1.r * 0.14421
        };
        buf[7] = {
            r: d0.r * -0.00346 + d1.r * 0.13771 + d2.r * 0.00160,
            i: d0.r * -0.00346 + d1.r * 0.13771 + d2.r * 0.00160
        };
        buf[8] = {
            r: d0.r * -0.00842 + d1.r * 0.11945 + d2.r * 0.00173,
            i: d0.r * -0.00842 + d1.r * 0.11945 + d2.r * 0.00173
        };
        buf[9] = {
            r: d0.r * -0.01359 + d1.r * 0.09278 + d2.r * 0.00112,
            i: d0.r * -0.01359 + d1.r * 0.09278 + d2.r * 0.00112
        };
        buf[10] = {
            r: d0.r * -0.01678 + d1.r * 0.06239 + d2.r * 0.00044,
            i: d0.r * -0.01678 + d1.r * 0.06239 + d2.r * 0.00044
        };
        buf[11] = {
            r: d0.r * -0.01540 + d1.r * 0.03319 + d2.r * 0.00007,
            i: d0.r * -0.01540 + d1.r * 0.03319 + d2.r * 0.00007
        };
        buf[12] = {
            r: d0.r * -0.00715 + d1.r * 0.00920,
            i: d0.r * -0.00715 + d1.r * 0.00920
        };
    };

}

/**
 * ### decimation : 17
 */
function Resampler17() {
    var d0=0; var d1=0; var d2=0; var d3=0; var d4=0; var d5=0; var d6=0; var d7=0; 
                var d8=0; var d9=0; var d10=0; var d11=0; var d12=0; var d13=0; var d14=0; 
                var d15=0; var d16=0; var d17=0; var d18=0; 
    var idx = 0;
    this.value = 0;

    this.decimate = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=d8; d8=d9; d9=d10; 
                d10=d11; d11=d12; d12=d13; d13=d14; d14=d15; d15=d16; d16=d17; d17=d18; 
                d18=v;
        if (++idx >= 17) {
            idx = 0;
            this.value = d1*0.00529 + d2*0.01419 + d3*0.02449 + d4*0.03995 + 
                d5*0.05826 + d6*0.07665 + d7*0.09228 + d8*0.10275 + d9*0.10643 + 
                d10*0.10275 + d11*0.09228 + d12*0.07665 + d13*0.05826 + 
                d14*0.03995 + d15*0.02449 + d16*0.01419 + d17*0.00529;
            return true;
        } else {
            return false;
        }
    };

    this.decimatex = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=d8; d8=d9; d9=d10; 
                d10=d11; d11=d12; d12=d13; d13=d14; d14=d15; d15=d16; d16=d17; d17=d18; 
                d18=v;
        if (++idx >= 17) {
            idx = 0;
            var r = d1.r*0.00529 + d2.r*0.01419 + d3.r*0.02449 + d4.r*0.03995 + 
                d5.r*0.05826 + d6.r*0.07665 + d7.r*0.09228 + d8.r*0.10275 + 
                d9.r*0.10643 + d10.r*0.10275 + d11.r*0.09228 + d12.r*0.07665 + 
                d13.r*0.05826 + d14.r*0.03995 + d15.r*0.02449 + d16.r*0.01419 + 
                d17.r*0.00529;
            var i = d1.i*0.00529 + d2.i*0.01419 + d3.i*0.02449 + d4.i*0.03995 + 
                d5.i*0.05826 + d6.i*0.07665 + d7.i*0.09228 + d8.i*0.10275 + 
                d9.i*0.10643 + d10.i*0.10275 + d11.i*0.09228 + d12.i*0.07665 + 
                d13.i*0.05826 + d14.i*0.03995 + d15.i*0.02449 + d16.i*0.01419 + 
                d17.i*0.00529;
            this.value = { r:r, i:i };
            return true;
        } else {
            return false;
        }
    };

    this.interpolate = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = d1 * 0.00526 + d2 * -0.00434;
        buf[1] = d0 * 0.00003 + d1 * 0.01838 + d2 * -0.01028;
        buf[2] = d0 * 0.00016 + d1 * 0.03431 + d2 * -0.01285;
        buf[3] = d0 * 0.00046 + d1 * 0.05193 + d2 * -0.01271;
        buf[4] = d0 * 0.00088 + d1 * 0.06970 + d2 * -0.01071;
        buf[5] = d0 * 0.00128 + d1 * 0.08592 + d2 * -0.00775;
        buf[6] = d0 * 0.00143 + d1 * 0.09895 + d2 * -0.00463;
        buf[7] = d0 * 0.00109 + d1 * 0.10738 + d2 * -0.00193;
        buf[8] = d1 * 0.11030;
        buf[9] = d0 * -0.00193 + d1 * 0.10738 + d2 * 0.00109;
        buf[10] = d0 * -0.00463 + d1 * 0.09895 + d2 * 0.00143;
        buf[11] = d0 * -0.00775 + d1 * 0.08592 + d2 * 0.00128;
        buf[12] = d0 * -0.01071 + d1 * 0.06970 + d2 * 0.00088;
        buf[13] = d0 * -0.01271 + d1 * 0.05193 + d2 * 0.00046;
        buf[14] = d0 * -0.01285 + d1 * 0.03431 + d2 * 0.00016;
        buf[15] = d0 * -0.01028 + d1 * 0.01838 + d2 * 0.00003;
        buf[16] = d0 * -0.00434 + d1 * 0.00526;
    };

    this.interpolatex = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = {
            r: d1.r * 0.00526 + d2.r * -0.00434,
            i: d1.r * 0.00526 + d2.r * -0.00434
        };
        buf[1] = {
            r: d0.r * 0.00003 + d1.r * 0.01838 + d2.r * -0.01028,
            i: d0.r * 0.00003 + d1.r * 0.01838 + d2.r * -0.01028
        };
        buf[2] = {
            r: d0.r * 0.00016 + d1.r * 0.03431 + d2.r * -0.01285,
            i: d0.r * 0.00016 + d1.r * 0.03431 + d2.r * -0.01285
        };
        buf[3] = {
            r: d0.r * 0.00046 + d1.r * 0.05193 + d2.r * -0.01271,
            i: d0.r * 0.00046 + d1.r * 0.05193 + d2.r * -0.01271
        };
        buf[4] = {
            r: d0.r * 0.00088 + d1.r * 0.06970 + d2.r * -0.01071,
            i: d0.r * 0.00088 + d1.r * 0.06970 + d2.r * -0.01071
        };
        buf[5] = {
            r: d0.r * 0.00128 + d1.r * 0.08592 + d2.r * -0.00775,
            i: d0.r * 0.00128 + d1.r * 0.08592 + d2.r * -0.00775
        };
        buf[6] = {
            r: d0.r * 0.00143 + d1.r * 0.09895 + d2.r * -0.00463,
            i: d0.r * 0.00143 + d1.r * 0.09895 + d2.r * -0.00463
        };
        buf[7] = {
            r: d0.r * 0.00109 + d1.r * 0.10738 + d2.r * -0.00193,
            i: d0.r * 0.00109 + d1.r * 0.10738 + d2.r * -0.00193
        };
        buf[8] = {
            r: d1.r * 0.11030,
            i: d1.r * 0.11030
        };
        buf[9] = {
            r: d0.r * -0.00193 + d1.r * 0.10738 + d2.r * 0.00109,
            i: d0.r * -0.00193 + d1.r * 0.10738 + d2.r * 0.00109
        };
        buf[10] = {
            r: d0.r * -0.00463 + d1.r * 0.09895 + d2.r * 0.00143,
            i: d0.r * -0.00463 + d1.r * 0.09895 + d2.r * 0.00143
        };
        buf[11] = {
            r: d0.r * -0.00775 + d1.r * 0.08592 + d2.r * 0.00128,
            i: d0.r * -0.00775 + d1.r * 0.08592 + d2.r * 0.00128
        };
        buf[12] = {
            r: d0.r * -0.01071 + d1.r * 0.06970 + d2.r * 0.00088,
            i: d0.r * -0.01071 + d1.r * 0.06970 + d2.r * 0.00088
        };
        buf[13] = {
            r: d0.r * -0.01271 + d1.r * 0.05193 + d2.r * 0.00046,
            i: d0.r * -0.01271 + d1.r * 0.05193 + d2.r * 0.00046
        };
        buf[14] = {
            r: d0.r * -0.01285 + d1.r * 0.03431 + d2.r * 0.00016,
            i: d0.r * -0.01285 + d1.r * 0.03431 + d2.r * 0.00016
        };
        buf[15] = {
            r: d0.r * -0.01028 + d1.r * 0.01838 + d2.r * 0.00003,
            i: d0.r * -0.01028 + d1.r * 0.01838 + d2.r * 0.00003
        };
        buf[16] = {
            r: d0.r * -0.00434 + d1.r * 0.00526,
            i: d0.r * -0.00434 + d1.r * 0.00526
        };
    };

}

/**
 * ### decimation : 19
 */
function Resampler19() {
    var d0=0; var d1=0; var d2=0; var d3=0; var d4=0; var d5=0; var d6=0; var d7=0; 
                var d8=0; var d9=0; var d10=0; var d11=0; var d12=0; var d13=0; var d14=0; 
                var d15=0; var d16=0; var d17=0; var d18=0; var d19=0; var d20=0; 
    var idx = 0;
    this.value = 0;

    this.decimate = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=d8; d8=d9; d9=d10; 
                d10=d11; d11=d12; d12=d13; d13=d14; d14=d15; d15=d16; d16=d17; d17=d18; 
                d18=d19; d19=d20; d20=v;
        if (++idx >= 19) {
            idx = 0;
            this.value = d1*0.00420 + d2*0.01100 + d3*0.01849 + d4*0.03001 + 
                d5*0.04420 + d6*0.05937 + d7*0.07366 + d8*0.08535 + d9*0.09300 + 
                d10*0.09565 + d11*0.09300 + d12*0.08535 + d13*0.07366 + 
                d14*0.05937 + d15*0.04420 + d16*0.03001 + d17*0.01849 + 
                d18*0.01100 + d19*0.00420;
            return true;
        } else {
            return false;
        }
    };

    this.decimatex = function(v) {
        d0=d1; d1=d2; d2=d3; d3=d4; d4=d5; d5=d6; d6=d7; d7=d8; d8=d9; d9=d10; 
                d10=d11; d11=d12; d12=d13; d13=d14; d14=d15; d15=d16; d16=d17; d17=d18; 
                d18=d19; d19=d20; d20=v;
        if (++idx >= 19) {
            idx = 0;
            var r = d1.r*0.00420 + d2.r*0.01100 + d3.r*0.01849 + d4.r*0.03001 + 
                d5.r*0.04420 + d6.r*0.05937 + d7.r*0.07366 + d8.r*0.08535 + 
                d9.r*0.09300 + d10.r*0.09565 + d11.r*0.09300 + d12.r*0.08535 + 
                d13.r*0.07366 + d14.r*0.05937 + d15.r*0.04420 + d16.r*0.03001 + 
                d17.r*0.01849 + d18.r*0.01100 + d19.r*0.00420;
            var i = d1.i*0.00420 + d2.i*0.01100 + d3.i*0.01849 + d4.i*0.03001 + 
                d5.i*0.04420 + d6.i*0.05937 + d7.i*0.07366 + d8.i*0.08535 + 
                d9.i*0.09300 + d10.i*0.09565 + d11.i*0.09300 + d12.i*0.08535 + 
                d13.i*0.07366 + d14.i*0.05937 + d15.i*0.04420 + d16.i*0.03001 + 
                d17.i*0.01849 + d18.i*0.01100 + d19.i*0.00420;
            this.value = { r:r, i:i };
            return true;
        } else {
            return false;
        }
    };

    this.interpolate = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = d1 * 0.00418 + d2 * -0.00352;
        buf[1] = d0 * 0.00002 + d1 * 0.01441 + d2 * -0.00859;
        buf[2] = d0 * 0.00011 + d1 * 0.02678 + d2 * -0.01119;
        buf[3] = d0 * 0.00031 + d1 * 0.04058 + d2 * -0.01169;
        buf[4] = d0 * 0.00061 + d1 * 0.05493 + d2 * -0.01062;
        buf[5] = d0 * 0.00096 + d1 * 0.06875 + d2 * -0.00856;
        buf[6] = d0 * 0.00124 + d1 * 0.08095 + d2 * -0.00607;
        buf[7] = d0 * 0.00128 + d1 * 0.09051 + d2 * -0.00361;
        buf[8] = d0 * 0.00091 + d1 * 0.09661 + d2 * -0.00152;
        buf[9] = d1 * 0.09870;
        buf[10] = d0 * -0.00152 + d1 * 0.09661 + d2 * 0.00091;
        buf[11] = d0 * -0.00361 + d1 * 0.09051 + d2 * 0.00128;
        buf[12] = d0 * -0.00607 + d1 * 0.08095 + d2 * 0.00124;
        buf[13] = d0 * -0.00856 + d1 * 0.06875 + d2 * 0.00096;
        buf[14] = d0 * -0.01062 + d1 * 0.05493 + d2 * 0.00061;
        buf[15] = d0 * -0.01169 + d1 * 0.04058 + d2 * 0.00031;
        buf[16] = d0 * -0.01119 + d1 * 0.02678 + d2 * 0.00011;
        buf[17] = d0 * -0.00859 + d1 * 0.01441 + d2 * 0.00002;
        buf[18] = d0 * -0.00352 + d1 * 0.00418;
    };

    this.interpolatex = function(v, buf) {
        d0 = d1; d1 = d2; d2 = v;
        buf[0] = {
            r: d1.r * 0.00418 + d2.r * -0.00352,
            i: d1.r * 0.00418 + d2.r * -0.00352
        };
        buf[1] = {
            r: d0.r * 0.00002 + d1.r * 0.01441 + d2.r * -0.00859,
            i: d0.r * 0.00002 + d1.r * 0.01441 + d2.r * -0.00859
        };
        buf[2] = {
            r: d0.r * 0.00011 + d1.r * 0.02678 + d2.r * -0.01119,
            i: d0.r * 0.00011 + d1.r * 0.02678 + d2.r * -0.01119
        };
        buf[3] = {
            r: d0.r * 0.00031 + d1.r * 0.04058 + d2.r * -0.01169,
            i: d0.r * 0.00031 + d1.r * 0.04058 + d2.r * -0.01169
        };
        buf[4] = {
            r: d0.r * 0.00061 + d1.r * 0.05493 + d2.r * -0.01062,
            i: d0.r * 0.00061 + d1.r * 0.05493 + d2.r * -0.01062
        };
        buf[5] = {
            r: d0.r * 0.00096 + d1.r * 0.06875 + d2.r * -0.00856,
            i: d0.r * 0.00096 + d1.r * 0.06875 + d2.r * -0.00856
        };
        buf[6] = {
            r: d0.r * 0.00124 + d1.r * 0.08095 + d2.r * -0.00607,
            i: d0.r * 0.00124 + d1.r * 0.08095 + d2.r * -0.00607
        };
        buf[7] = {
            r: d0.r * 0.00128 + d1.r * 0.09051 + d2.r * -0.00361,
            i: d0.r * 0.00128 + d1.r * 0.09051 + d2.r * -0.00361
        };
        buf[8] = {
            r: d0.r * 0.00091 + d1.r * 0.09661 + d2.r * -0.00152,
            i: d0.r * 0.00091 + d1.r * 0.09661 + d2.r * -0.00152
        };
        buf[9] = {
            r: d1.r * 0.09870,
            i: d1.r * 0.09870
        };
        buf[10] = {
            r: d0.r * -0.00152 + d1.r * 0.09661 + d2.r * 0.00091,
            i: d0.r * -0.00152 + d1.r * 0.09661 + d2.r * 0.00091
        };
        buf[11] = {
            r: d0.r * -0.00361 + d1.r * 0.09051 + d2.r * 0.00128,
            i: d0.r * -0.00361 + d1.r * 0.09051 + d2.r * 0.00128
        };
        buf[12] = {
            r: d0.r * -0.00607 + d1.r * 0.08095 + d2.r * 0.00124,
            i: d0.r * -0.00607 + d1.r * 0.08095 + d2.r * 0.00124
        };
        buf[13] = {
            r: d0.r * -0.00856 + d1.r * 0.06875 + d2.r * 0.00096,
            i: d0.r * -0.00856 + d1.r * 0.06875 + d2.r * 0.00096
        };
        buf[14] = {
            r: d0.r * -0.01062 + d1.r * 0.05493 + d2.r * 0.00061,
            i: d0.r * -0.01062 + d1.r * 0.05493 + d2.r * 0.00061
        };
        buf[15] = {
            r: d0.r * -0.01169 + d1.r * 0.04058 + d2.r * 0.00031,
            i: d0.r * -0.01169 + d1.r * 0.04058 + d2.r * 0.00031
        };
        buf[16] = {
            r: d0.r * -0.01119 + d1.r * 0.02678 + d2.r * 0.00011,
            i: d0.r * -0.01119 + d1.r * 0.02678 + d2.r * 0.00011
        };
        buf[17] = {
            r: d0.r * -0.00859 + d1.r * 0.01441 + d2.r * 0.00002,
            i: d0.r * -0.00859 + d1.r * 0.01441 + d2.r * 0.00002
        };
        buf[18] = {
            r: d0.r * -0.00352 + d1.r * 0.00418,
            i: d0.r * -0.00352 + d1.r * 0.00418
        };
    };

}

//######################################
//## END GENERATED
//######################################



/**
 * Exported factory for resamplers
 */
var Resampler = {
  
    
   create :  function(decimation) {

        function BadDecimationSpecException(message) {
            this.message = message;
            this.name = "BadDecimationSpecException";
        }


        switch (decimation) {
            case 1 : return new Resampler1();
            case 2 : return new Resampler2();
            case 3 : return new Resampler3();
            case 4 : return new Resampler4();
            case 5 : return new Resampler5();
            case 6 : return new Resampler6();
            case 7 : return new Resampler7();
            default:  throw new BadDecimationSpecException("Decimation " +
                 decimation + " not supported");
        }
    }
    
};

export {Resampler};





