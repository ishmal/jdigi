/**
 * Jdigi
 *
 * Copyright 2015, Bob Jamison
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
 *    along with this program.  If not, see <http:// www.gnu.org/licenses/>.
 */
import {Complex} from './complex';

 export interface Resampler {
   decimate(v: number): number;
   decimatex(vr: number, vi: number): Complex;
   interpolate(v:number, buf: number[]);
   interpolatex(vr: number, vi: number, buf: Complex[]);
 }

/**
 * ### decimation : 1
 */
function Resampler1(): Resampler {

    function dec(v: number): number {
        return v;
    }

    function decx(vr: number, vi: number): Complex {
        return {r: vr, i: vi};
    }

    function int(v: number, buf: number[]) {
        buf[0] = v;
    };

    function intx(vr: number, vi: number, buf: Complex[]) {
        buf[0] = {r: vr, i: vi};
    }

    return {
      decimate : dec,
      decimatex: decx,
      interpolate: int,
      interpolatex: intx
    };
}

// ######################################
// ## GENERATED
// ######################################
/**
 * ### decimation : 2
 */
function Resampler2(): Resampler {
    let idx = 0;
    let r0 = 0;
    let i0 = 0;
    let r1 = 0;
    let i1 = 0;
    let r2 = 0;
    let i2 = 0;
    let r3 = 0;
    let i3 = 0;


    function dec(v:number): number {
        r0 = r1;
        r1 = r2;
        r2 = r3;
        r3 = v;
        if (++idx >= 2) {
            idx = 0;
            return r2 * 0.90451;
        } else {
            return null;
        }
    }

    function decx(vr: number, vi: number): Complex {
        r0 = r1;
        i0 = i1;
        r1 = r2;
        i1 = i2;
        r2 = r3;
        i2 = i3;
        r3 = vr;
        i3 = vi;
        if (++idx >= 2) {
            idx = 0;
            return {
                r: r2 * 0.90451,
                i: i2 * 0.90451
            };
        } else {
            return null;
        }
    }

    function int(v: number, buf: number[]) {
        r0 = r1;
        r1 = r2;
        r2 = v;
        buf[0] = 0;
        buf[1] = r1 * 0.90451;
    }

    function intx(vr: number, vi: number, buf: Complex[]) {
        r0 = r1;
        r1 = r2;
        r2 = vr;
        i0 = i1;
        i1 = i2;
        i2 = vi;
        buf[0] = {r: 0, i: 0};
        buf[1] = {
            r: r1 * 0.90451,
            i: i1 * 0.90451
        };
    }

    return {
      decimate : dec,
      decimatex: decx,
      interpolate: int,
      interpolatex: intx
    };
}

/**
 * ### decimation : 3
 */
function Resampler3(): Resampler {
    let idx = 0;
    let r0 = 0;
    let i0 = 0;
    let r1 = 0;
    let i1 = 0;
    let r2 = 0;
    let i2 = 0;
    let r3 = 0;
    let i3 = 0;
    let r4 = 0;
    let i4 = 0;

    function dec(v:number): number {
        r0 = r1;
        r1 = r2;
        r2 = r3;
        r3 = r4;
        r4 = v;
        if (++idx >= 3) {
            idx = 0;
            return r1 * 0.21783 + r2 * 0.48959 + r3 * 0.21783;
        } else {
            return null;
        }
    }

    function decx(vr: number, vi: number): Complex {
        r0 = r1;
        i0 = i1;
        r1 = r2;
        i1 = i2;
        r2 = r3;
        i2 = i3;
        r3 = r4;
        i3 = i4;
        r4 = vr;
        i4 = vi;
        if (++idx >= 3) {
            idx = 0;
            return {
                r: r1 * 0.21783 + r2 * 0.48959 + r3 * 0.21783,
                i: i1 * 0.21783 + i2 * 0.48959 + i3 * 0.21783
            };
        } else {
            return null;
        }
    }

    function int(v: number, buf: number[]) {
        r0 = r1;
        r1 = r2;
        r2 = v;
        buf[0] = r1 * 0.21783 + r2 * -0.06380;
        buf[1] = r1 * 0.61719;
        buf[2] = r0 * -0.06380 + r1 * 0.21783;
    }

    function intx(vr: number, vi: number, buf: Complex[]) {
        r0 = r1;
        r1 = r2;
        r2 = vr;
        i0 = i1;
        i1 = i2;
        i2 = vi;
        buf[0] = {
            r: r1 * 0.21783 + r2 * -0.06380,
            i: i1 * 0.21783 + i2 * -0.06380
        };
        buf[1] = {
            r: r1 * 0.61719,
            i: i1 * 0.61719
        };
        buf[2] = {
            r: r0 * -0.06380 + r1 * 0.21783,
            i: i0 * -0.06380 + i1 * 0.21783
        };
    }
    return {
      decimate : dec,
      decimatex: decx,
      interpolate: int,
      interpolatex: intx
    };
}

/**
 * ### decimation : 4
 */
function Resampler4(): Resampler {
    let idx = 0;
    let r0 = 0;
    let i0 = 0;
    let r1 = 0;
    let i1 = 0;
    let r2 = 0;
    let i2 = 0;
    let r3 = 0;
    let i3 = 0;
    let r4 = 0;
    let i4 = 0;
    let r5 = 0;
    let i5 = 0;

    function dec(v:number): number {
        r0 = r1;
        r1 = r2;
        r2 = r3;
        r3 = r4;
        r4 = r5;
        r5 = v;
        if (++idx >= 4) {
            idx = 0;
            return r1 * 0.00480 + r2 * 0.29652 + r3 * 0.37867 + r4 * 0.25042;
        } else {
            return null;
        }
    }

    function decx(vr: number, vi: number): Complex {
        r0 = r1;
        i0 = i1;
        r1 = r2;
        i1 = i2;
        r2 = r3;
        i2 = i3;
        r3 = r4;
        i3 = i4;
        r4 = r5;
        i4 = i5;
        r5 = vr;
        i5 = vi;

        if (++idx >= 4) {
            idx = 0;
            return {
                r: r1 * 0.00480 + r2 * 0.29652 + r3 * 0.37867 + r4 * 0.25042,
                i: i1 * 0.00480 + i2 * 0.29652 + i3 * 0.37867 + i4 * 0.25042
            };
        } else {
            return null;
        }
    }

    function int(v: number, buf: number[]) {
        r0 = r1;
        r1 = r2;
        r2 = v;
        buf[0] = 0;
        buf[1] = r0 * 0.00480 + r1 * 0.29652 + r2 * -0.02949;
        buf[2] = r1 * 0.46578;
        buf[3] = r0 * -0.05762 + r1 * 0.25042;
    }

    function intx(vr: number, vi: number, buf: Complex[]) {
        r0 = r1;
        r1 = r2;
        r2 = vr;
        i0 = i1;
        i1 = i2;
        i2 = vi;
        buf[0] = {r: 0, i: 0};
        buf[1] = {
            r: r0 * 0.00480 + r1 * 0.29652 + r2 * -0.02949,
            i: i0 * 0.00480 + i1 * 0.29652 + i2 * -0.02949
        };
        buf[2] = {
            r: r1 * 0.46578,
            i: i1 * 0.46578
        };
        buf[3] = {
            r: r0 * -0.05762 + r1 * 0.25042,
            i: i0 * -0.05762 + i1 * 0.25042
        };
    }

    return {
      decimate : dec,
      decimatex: decx,
      interpolate: int,
      interpolatex: intx
    };

}

/**
 * ### decimation : 5
 */
function Resampler5(): Resampler {
    let idx = 0;
    let r0 = 0;
    let i0 = 0;
    let r1 = 0;
    let i1 = 0;
    let r2 = 0;
    let i2 = 0;
    let r3 = 0;
    let i3 = 0;
    let r4 = 0;
    let i4 = 0;
    let r5 = 0;
    let i5 = 0;
    let r6 = 0;
    let i6 = 0;

    function dec(v:number): number {
        r0 = r1;
        r1 = r2;
        r2 = r3;
        r3 = r4;
        r4 = r5;
        r5 = r6;
        r6 = v;
        if (++idx >= 5) {
            idx = 0;
            return r1 * 0.07325 + r2 * 0.23311 + r3 * 0.31859 + r4 * 0.23311 +
                r5 * 0.07325;
        } else {
            return null;
        }
    }

    function decx(vr: number, vi: number): Complex {
        r0 = r1;
        i0 = i1;
        r1 = r2;
        i1 = i2;
        r2 = r3;
        i2 = i3;
        r3 = r4;
        i3 = i4;
        r4 = r5;
        i4 = i5;
        r5 = r6;
        i5 = i6;
        r6 = vr;
        i6 = vi;
        if (++idx >= 5) {
            idx = 0;
            return {
                r: r1 * 0.07325 + r2 * 0.23311 + r3 * 0.31859 + r4 * 0.23311 +
                r5 * 0.07325,
                i: i1 * 0.07325 + i2 * 0.23311 + i3 * 0.31859 + i4 * 0.23311 +
                i5 * 0.07325
            };
        } else {
            return null;
        }
    }

    function int(v: number, buf: number[]) {
        r0 = r1;
        r1 = r2;
        r2 = v;
        buf[0] = r1 * 0.07092 + r2 * -0.03560;
        buf[1] = r0 * 0.00233 + r1 * 0.26871 + r2 * -0.02747;
        buf[2] = r1 * 0.37354;
        buf[3] = r0 * -0.02747 + r1 * 0.26871 + r2 * 0.00233;
        buf[4] = r0 * -0.03560 + r1 * 0.07092;
    }

    function intx(vr: number, vi: number, buf: Complex[]) {
        r0 = r1;
        r1 = r2;
        r2 = vr;
        i0 = i1;
        i1 = i2;
        i2 = vi;
        buf[0] = {
            r: r1 * 0.07092 + r2 * -0.03560,
            i: i1 * 0.07092 + i2 * -0.03560
        };
        buf[1] = {
            r: r0 * 0.00233 + r1 * 0.26871 + r2 * -0.02747,
            i: i0 * 0.00233 + i1 * 0.26871 + i2 * -0.02747
        };
        buf[2] = {
            r: r1 * 0.37354,
            i: i1 * 0.37354
        };
        buf[3] = {
            r: r0 * -0.02747 + r1 * 0.26871 + r2 * 0.00233,
            i: i0 * -0.02747 + i1 * 0.26871 + i2 * 0.00233
        };
        buf[4] = {
            r: r0 * -0.03560 + r1 * 0.07092,
            i: i0 * -0.03560 + i1 * 0.07092
        };
    }

    return {
      decimate : dec,
      decimatex: decx,
      interpolate: int,
      interpolatex: intx
    };
}

/**
 * ### decimation : 6
 */
function Resampler6(): Resampler {
    let idx = 0;
    let r0 = 0;
    let i0 = 0;
    let r1 = 0;
    let i1 = 0;
    let r2 = 0;
    let i2 = 0;
    let r3 = 0;
    let i3 = 0;
    let r4 = 0;
    let i4 = 0;
    let r5 = 0;
    let i5 = 0;
    let r6 = 0;
    let i6 = 0;
    let r7 = 0;
    let i7 = 0;

    function dec(v:number): number {
        r0 = r1;
        r1 = r2;
        r2 = r3;
        r3 = r4;
        r4 = r5;
        r5 = r6;
        r6 = r7;
        r7 = v;
        if (++idx >= 6) {
            idx = 0;
            return r1 * 0.00110 + r2 * 0.12515 + r3 * 0.22836 + r4 * 0.27379 +
                r5 * 0.19920 + r6 * 0.10546;
        } else {
            return null;
        }
    }

    function decx(vr: number, vi: number): Complex {
        r0 = r1;
        i0 = i1;
        r1 = r2;
        i1 = i2;
        r2 = r3;
        i2 = i3;
        r3 = r4;
        i3 = i4;
        r4 = r5;
        i4 = i5;
        r5 = r6;
        i5 = i6;
        r6 = r7;
        i6 = i7;
        r7 = vr;
        i7 = vi;
        if (++idx >= 6) {
            idx = 0;
            return {
                r: r1 * 0.00110 + r2 * 0.12515 + r3 * 0.22836 + r4 * 0.27379 +
                r5 * 0.19920 + r6 * 0.10546,
                i: i1 * 0.00110 + i2 * 0.12515 + i3 * 0.22836 + i4 * 0.27379 +
                i5 * 0.19920 + i6 * 0.10546
            };
        } else {
            return null;
        }
    }

    function int(v: number, buf: number[]) {
        r0 = r1;
        r1 = r2;
        r2 = v;
        buf[0] = 0;
        buf[1] = r0 * 0.00110 + r1 * 0.12030 + r2 * -0.02951;
        buf[2] = r0 * 0.00485 + r1 * 0.25787 + r2 * -0.01442;
        buf[3] = r1 * 0.31182;
        buf[4] = r0 * -0.02361 + r1 * 0.24061 + r2 * 0.00125;
        buf[5] = r0 * -0.04141 + r1 * 0.10420;
    }

    function intx(vr: number, vi: number, buf: Complex[]) {
        r0 = r1;
        r1 = r2;
        r2 = vr;
        i0 = i1;
        i1 = i2;
        i2 = vi;
        buf[0] = {r: 0, i: 0};
        buf[1] = {
            r: r0 * 0.00110 + r1 * 0.12030 + r2 * -0.02951,
            i: i0 * 0.00110 + i1 * 0.12030 + i2 * -0.02951
        };
        buf[2] = {
            r: r0 * 0.00485 + r1 * 0.25787 + r2 * -0.01442,
            i: i0 * 0.00485 + i1 * 0.25787 + i2 * -0.01442
        };
        buf[3] = {
            r: r1 * 0.31182,
            i: i1 * 0.31182
        };
        buf[4] = {
            r: r0 * -0.02361 + r1 * 0.24061 + r2 * 0.00125,
            i: i0 * -0.02361 + i1 * 0.24061 + i2 * 0.00125
        };
        buf[5] = {
            r: r0 * -0.04141 + r1 * 0.10420,
            i: i0 * -0.04141 + i1 * 0.10420
        };
    }

    return {
      decimate : dec,
      decimatex: decx,
      interpolate: int,
      interpolatex: intx
    };
}

/**
 * ### decimation : 7
 */
function Resampler7(): Resampler {
    let idx = 0;
    let r0 = 0;
    let i0 = 0;
    let r1 = 0;
    let i1 = 0;
    let r2 = 0;
    let i2 = 0;
    let r3 = 0;
    let i3 = 0;
    let r4 = 0;
    let i4 = 0;
    let r5 = 0;
    let i5 = 0;
    let r6 = 0;
    let i6 = 0;
    let r7 = 0;
    let i7 = 0;
    let r8 = 0;
    let i8 = 0;

    function dec(v:number): number {
        r0 = r1;
        r1 = r2;
        r2 = r3;
        r3 = r4;
        r4 = r5;
        r5 = r6;
        r6 = r7;
        r7 = r8;
        r8 = v;
        if (++idx >= 7) {
            idx = 0;
            return r1 * 0.03499 + r2 * 0.11298 + r3 * 0.19817 + r4 * 0.24057 +
                r5 * 0.19817 + r6 * 0.11298 + r7 * 0.03499;
        } else {
            return null;
        }
    }

    function decx(vr: number, vi: number): Complex {
        r0 = r1;
        i0 = i1;
        r1 = r2;
        i1 = i2;
        r2 = r3;
        i2 = i3;
        r3 = r4;
        i3 = i4;
        r4 = r5;
        i4 = i5;
        r5 = r6;
        i5 = i6;
        r6 = r7;
        i6 = i7;
        r7 = r8;
        i7 = i8;
        r8 = vr;
        i8 = vi;
        if (++idx >= 7) {
            idx = 0;
            return {
                r: r1 * 0.03499 + r2 * 0.11298 + r3 * 0.19817 + r4 * 0.24057 +
                r5 * 0.19817 + r6 * 0.11298 + r7 * 0.03499,
                i: i1 * 0.03499 + i2 * 0.11298 + i3 * 0.19817 + i4 * 0.24057 +
                i5 * 0.19817 + i6 * 0.11298 + i7 * 0.03499
            };
        } else {
            return null;
        }
    }

    function int(v: number, buf: number[]) {
        r0 = r1;
        r1 = r2;
        r2 = v;
        buf[0] = r1 * 0.03420 + r2 * -0.02115;
        buf[1] = r0 * 0.00079 + r1 * 0.13135 + r2 * -0.02904;
        buf[2] = r0 * 0.00278 + r1 * 0.22721 + r2 * -0.01341;
        buf[3] = r1 * 0.26740;
        buf[4] = r0 * -0.01341 + r1 * 0.22721 + r2 * 0.00278;
        buf[5] = r0 * -0.02904 + r1 * 0.13135 + r2 * 0.00079;
        buf[6] = r0 * -0.02115 + r1 * 0.03420;
    }

    function intx(vr: number, vi: number, buf: Complex[]) {
        r0 = r1;
        r1 = r2;
        r2 = vr;
        i0 = i1;
        i1 = i2;
        i2 = vi;
        buf[0] = {
            r: r1 * 0.03420 + r2 * -0.02115,
            i: i1 * 0.03420 + i2 * -0.02115
        };
        buf[1] = {
            r: r0 * 0.00079 + r1 * 0.13135 + r2 * -0.02904,
            i: i0 * 0.00079 + i1 * 0.13135 + i2 * -0.02904
        };
        buf[2] = {
            r: r0 * 0.00278 + r1 * 0.22721 + r2 * -0.01341,
            i: i0 * 0.00278 + i1 * 0.22721 + i2 * -0.01341
        };
        buf[3] = {
            r: r1 * 0.26740,
            i: i1 * 0.26740
        };
        buf[4] = {
            r: r0 * -0.01341 + r1 * 0.22721 + r2 * 0.00278,
            i: i0 * -0.01341 + i1 * 0.22721 + i2 * 0.00278
        };
        buf[5] = {
            r: r0 * -0.02904 + r1 * 0.13135 + r2 * 0.00079,
            i: i0 * -0.02904 + i1 * 0.13135 + i2 * 0.00079
        };
        buf[6] = {
            r: r0 * -0.02115 + r1 * 0.03420,
            i: i0 * -0.02115 + i1 * 0.03420
        };
    }

    return {
      decimate : dec,
      decimatex: decx,
      interpolate: int,
      interpolatex: intx
    };
}

/**
 * ### decimation : 11
 */
function Resampler11(): Resampler {
    let idx = 0;
    let r0 = 0;
    let i0 = 0;
    let r1 = 0;
    let i1 = 0;
    let r2 = 0;
    let i2 = 0;
    let r3 = 0;
    let i3 = 0;
    let r4 = 0;
    let i4 = 0;
    let r5 = 0;
    let i5 = 0;
    let r6 = 0;
    let i6 = 0;
    let r7 = 0;
    let i7 = 0;
    let r8 = 0;
    let i8 = 0;
    let r9 = 0;
    let i9 = 0;
    let r10 = 0;
    let i10 = 0;
    let r11 = 0;
    let i11 = 0;
    let r12 = 0;
    let i12 = 0;

    function dec(v:number): number {
        r0 = r1;
        r1 = r2;
        r2 = r3;
        r3 = r4;
        r4 = r5;
        r5 = r6;
        r6 = r7;
        r7 = r8;
        r8 = r9;
        r9 = r10;
        r10 = r11;
        r11 = r12;
        r12 = v;
        if (++idx >= 11) {
            idx = 0;
            return r1 * 0.01322 + r2 * 0.03922 + r3 * 0.07264 + r4 * 0.11402 +
                r5 * 0.14759 + r6 * 0.16043 + r7 * 0.14759 + r8 * 0.11402 + r9 * 0.07264 +
                r10 * 0.03922 + r11 * 0.01322;
        } else {
            return null;
        }
    }

    function decx(vr: number, vi: number): Complex {
        r0 = r1;
        i0 = i1;
        r1 = r2;
        i1 = i2;
        r2 = r3;
        i2 = i3;
        r3 = r4;
        i3 = i4;
        r4 = r5;
        i4 = i5;
        r5 = r6;
        i5 = i6;
        r6 = r7;
        i6 = i7;
        r7 = r8;
        i7 = i8;
        r8 = r9;
        i8 = i9;
        r9 = r10;
        i9 = i10;
        r10 = r11;
        i10 = i11;
        r11 = r12;
        i11 = i12;
        r12 = vr;
        i12 = vi;
        if (++idx >= 11) {
            idx = 0;
            return {
                r: r1 * 0.01322 + r2 * 0.03922 + r3 * 0.07264 + r4 * 0.11402 +
                r5 * 0.14759 + r6 * 0.16043 + r7 * 0.14759 + r8 * 0.11402 + r9 * 0.07264 +
                r10 * 0.03922 + r11 * 0.01322,
                i: i1 * 0.01322 + i2 * 0.03922 + i3 * 0.07264 + i4 * 0.11402 +
                i5 * 0.14759 + i6 * 0.16043 + i7 * 0.14759 + i8 * 0.11402 + i9 * 0.07264 +
                i10 * 0.03922 + i11 * 0.01322
            };
        } else {
            return null;
        }
    }

    function int(v: number, buf: number[]) {
        r0 = r1;
        r1 = r2;
        r2 = v;
        buf[0] = r1 * 0.01307 + r2 * -0.00968;
        buf[1] = r0 * 0.00014 + r1 * 0.04810 + r2 * -0.01924;
        buf[2] = r0 * 0.00080 + r1 * 0.09012 + r2 * -0.01845;
        buf[3] = r0 * 0.00176 + r1 * 0.13050 + r2 * -0.01213;
        buf[4] = r0 * 0.00197 + r1 * 0.15972 + r2 * -0.00498;
        buf[5] = r1 * 0.17038;
        buf[6] = r0 * -0.00498 + r1 * 0.15972 + r2 * 0.00197;
        buf[7] = r0 * -0.01213 + r1 * 0.13050 + r2 * 0.00176;
        buf[8] = r0 * -0.01845 + r1 * 0.09012 + r2 * 0.00080;
        buf[9] = r0 * -0.01924 + r1 * 0.04810 + r2 * 0.00014;
        buf[10] = r0 * -0.00968 + r1 * 0.01307;
    }

    function intx(vr: number, vi: number, buf: Complex[]) {
        r0 = r1;
        r1 = r2;
        r2 = vr;
        i0 = i1;
        i1 = i2;
        i2 = vi;
        buf[0] = {
            r: r1 * 0.01307 + r2 * -0.00968,
            i: i1 * 0.01307 + i2 * -0.00968
        };
        buf[1] = {
            r: r0 * 0.00014 + r1 * 0.04810 + r2 * -0.01924,
            i: i0 * 0.00014 + i1 * 0.04810 + i2 * -0.01924
        };
        buf[2] = {
            r: r0 * 0.00080 + r1 * 0.09012 + r2 * -0.01845,
            i: i0 * 0.00080 + i1 * 0.09012 + i2 * -0.01845
        };
        buf[3] = {
            r: r0 * 0.00176 + r1 * 0.13050 + r2 * -0.01213,
            i: i0 * 0.00176 + i1 * 0.13050 + i2 * -0.01213
        };
        buf[4] = {
            r: r0 * 0.00197 + r1 * 0.15972 + r2 * -0.00498,
            i: i0 * 0.00197 + i1 * 0.15972 + i2 * -0.00498
        };
        buf[5] = {
            r: r1 * 0.17038,
            i: i1 * 0.17038
        };
        buf[6] = {
            r: r0 * -0.00498 + r1 * 0.15972 + r2 * 0.00197,
            i: i0 * -0.00498 + i1 * 0.15972 + i2 * 0.00197
        };
        buf[7] = {
            r: r0 * -0.01213 + r1 * 0.13050 + r2 * 0.00176,
            i: i0 * -0.01213 + i1 * 0.13050 + i2 * 0.00176
        };
        buf[8] = {
            r: r0 * -0.01845 + r1 * 0.09012 + r2 * 0.00080,
            i: i0 * -0.01845 + i1 * 0.09012 + i2 * 0.00080
        };
        buf[9] = {
            r: r0 * -0.01924 + r1 * 0.04810 + r2 * 0.00014,
            i: i0 * -0.01924 + i1 * 0.04810 + i2 * 0.00014
        };
        buf[10] = {
            r: r0 * -0.00968 + r1 * 0.01307,
            i: i0 * -0.00968 + i1 * 0.01307
        };
    }

    return {
      decimate : dec,
      decimatex: decx,
      interpolate: int,
      interpolatex: intx
    };
}


// ######################################
// ## END GENERATED
// ######################################



/**
 * Exported factory for resamplers
 */
export class Resampler {


    static create(decimation: number) : Resampler {

        function BadDecimationSpecException(message) {
            this.message = message;
            this.name = 'BadDecimationSpecException';
        }


        switch (decimation) {
            case 1 :
                return Resampler1();
            case 2 :
                return Resampler2();
            case 3 :
                return Resampler3();
            case 4 :
                return Resampler4();
            case 5 :
                return Resampler5();
            case 6 :
                return Resampler6();
            case 7 :
                return Resampler7();
            case 11 :
                return Resampler11();
            default:
                throw new BadDecimationSpecException('Decimation ' +
                    decimation + ' not supported');
        }
    }// /create

}
