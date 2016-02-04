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

import {Window} from './window';
import {Complex} from './complex';


export interface Filter {
    update(v: number): number;
    updatex(v: Complex): Complex;
}


/**
 * Hardcoded filter for size 13.  Pick 13!
 */
function newFilter13(coeffs: number[]): Filter {

    let c0 = coeffs[0], c1 = coeffs[1], c2 = coeffs[2], c3 = coeffs[3],
        c4 = coeffs[4], c5 = coeffs[5], c6 = coeffs[6], c7 = coeffs[7],
        c8 = coeffs[8], c9 = coeffs[9], c10 = coeffs[10], c11 = coeffs[11],
        c12 = coeffs[12];

    let r0 = 0, r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0, r6 = 0,
        r7 = 0, r8 = 0, r9 = 0, r10 = 0, r11 = 0, r12 = 0;
    let i0 = 0, i1 = 0, i2 = 0, i3 = 0, i4 = 0, i5 = 0, i6 = 0,
        i7 = 0, i8 = 0, i9 = 0, i10 = 0, i11 = 0, i12 = 0;

    return {
        update: function (v: number): number {
            r12 = r11;
            r11 = r10;
            r10 = r9;
            r9 = r8;
            r8 = r7;
            r7 = r6;
            r6 = r5;
            r5 = r4;
            r4 = r3;
            r3 = r2;
            r2 = r1;
            r1 = r0;
            r0 = v;

            return c0 * r12 + c1 * r11 + c2 * r10 + c3 * r9 + c4 * r8 + c5 * r7 + c6 * r6 +
                c7 * r5 + c8 * r4 + c9 * r3 + c10 * r2 + c11 * r1 + c12 * r0;
        },

        updatex: function (v: Complex): Complex {
            r12 = r11;
            r11 = r10;
            r10 = r9;
            r9 = r8;
            r8 = r7;
            r7 = r6;
            r6 = r5;
            r5 = r4;
            r4 = r3;
            r3 = r2;
            r2 = r1;
            r1 = r0;
            r0 = v.r;
            i12 = i11;
            i11 = i10;
            i10 = i9;
            i9 = i8;
            i8 = i7;
            i7 = i6;
            i6 = i5;
            i5 = i4;
            i4 = i3;
            i3 = i2;
            i2 = i1;
            i1 = i0;
            i0 = v.i;

            return {
                r: c0 * r12 + c1 * r11 + c2 * r10 + c3 * r9 + c4 * r8 + c5 * r7 + c6 * r6 +
                c7 * r5 + c8 * r4 + c9 * r3 + c10 * r2 + c11 * r1 + c12 * r0,
                i: c0 * i12 + c1 * i11 + c2 * i10 + c3 * i9 + c4 * i8 + c5 * i7 + c6 * i6 +
                c7 * i5 + c8 * i4 + c9 * i3 + c10 * i2 + c11 * i1 + c12 * i0
            };
        }
    };
}


function genCoeffs(size, window, func): number[] {
      window = window || Window.hann;
      let W = window(size);
      let center = size * 0.5;
      let sum = 0.0;
      let arr = [];
      for (let i = 0; i < size; i++) {
          let v = func(i - center) * W[i];
          sum += v;
          arr[arr.length] = v;
      }
      for (let j = 0; j < size; j++) {
          arr[j] /= sum;
      }
   return arr;
}

function newFilter(size, coeffs) {
      let sizeless = size - 1;
      let dlr = new Array(size);
      let dli = new Array(size);
      let dptr = 0;

      let filter = {
          update: function (v) {
              dlr[dptr++] = v;
              dptr %= size;
              let ptr = dptr;
              let sum = 0;
              for (let i = 0; i < size; i++) {
                  sum += coeffs[i] * dlr[ptr];
                  ptr = (ptr + sizeless) % size;
              }
              return sum;
          },

          updatex: function (v) {
              dlr[dptr] = v.r;
              dli[dptr++] = v.i;
              dptr %= size;
              let ptr = dptr;
              let sumr = 0;
              let sumi = 0;
              for (let i = 0; i < size; i++) {
                  sumr += coeffs[i] * dlr[ptr];
                  sumi += coeffs[i] * dli[ptr];
                  ptr = (ptr + sizeless) % size;
              }
              return {r: sumr, i: sumi};
          }
      };
    return filter;
}

export class FIR {

      static average(size: number, window?: Window): Filter {
          let omega = 1.0 / size;
          let coeffs = genCoeffs(size, window, function (i) {
              return omega;
          });
          return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
      }

      static boxcar(size: number, window?: Window): Filter {
          let coeffs = genCoeffs(size, window, function (i) {
              return 1.0;
          });
          return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
      }

      static lowpass(size: number, cutoffFreq: number, sampleRate: number, window?: Window) {
          let omega = 2.0 * Math.PI * cutoffFreq / sampleRate;
          let coeffs = genCoeffs(size, window, function (i) {
              return (i === 0) ? omega / Math.PI : Math.sin(omega * i) / (Math.PI * i);
          });
          return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
      }

      static highpass(size: number, cutoffFreq: number, sampleRate: number, window?: Window) {
          let omega = 2.0 * Math.PI * cutoffFreq / sampleRate;
          let coeffs = genCoeffs(size, window, function (i) {
              return (i === 0) ? 1.0 - omega / Math.PI : -Math.sin(omega * i) / (Math.PI * i);
          });
          return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
      }

      static bandpass(size: number, loCutoffFreq: number, hiCutoffFreq: number, sampleRate: number, window?: Window) {
          let omega1 = 2.0 * Math.PI * hiCutoffFreq / sampleRate;
          let omega2 = 2.0 * Math.PI * loCutoffFreq / sampleRate;
          let coeffs = genCoeffs(size, window, function (i) {
              return (i === 0) ? (omega2 - omega1) / Math.PI :
              (Math.sin(omega2 * i) - Math.sin(omega1 * i)) / (Math.PI * i);
          });
          return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
      }

      static bandreject(size: number, loCutoffFreq: number, hiCutoffFreq: number, sampleRate: number, window?: Window) {
          let omega1 = 2.0 * Math.PI * hiCutoffFreq / sampleRate;
          let omega2 = 2.0 * Math.PI * loCutoffFreq / sampleRate;
          let coeffs = genCoeffs(size, window, function (i) {
              return (i === 0) ? 1.0 - (omega2 - omega1) / Math.PI :
              (Math.sin(omega1 * i) - Math.sin(omega2 * i)) / (Math.PI * i);
          });
          return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
      }

      static raisedcosine(size: number, rolloff: number, symbolFreq: number, sampleRate: number, window?: Window) {
          let T = sampleRate / symbolFreq;
          let a = rolloff;

          let coeffs = genCoeffs(size, window, (i) => {
              let nT = i / T;
              let anT = a * nT;
              let c = 0;
              if (i === 0) {
                  c = 1.0;
              } else if (anT === 0.5 || anT === -0.5) { // look at denominator below
                  c = Math.sin(Math.PI * nT) / (Math.PI * nT) * Math.PI / 4.0;
              } else {
                  c = Math.sin(Math.PI * nT) / (Math.PI * nT) * Math.cos(Math.PI * anT) /
                      (1.0 - 4.0 * anT * anT);
              }
              return c;
          });
          return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
      }

  };





// ########################################################################
// #  B I Q U A D
// ########################################################################

/**
 * A biquad filter
 * @see http:// en.wikipedia.org/wiki/Digital_biquad_filter
 */
function BiquadFilter(b0: number, b1: number,
    b2: number, a1: number, a2: number): Filter {

      let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      let x1r = 0, x2r = 0, y1r = 0, y2r = 0;
      let x1i = 0, x2i = 0, y1i = 0, y2i = 0;

      return {

        update: function (x:number): number {
            let y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
            x2 = x1;
            x1 = x;
            y2 = y1;
            y1 = y;
            return y;
        },

        updatex: function (x:Complex): Complex {
            let r = x.r;
            let i = x.i;
            let yr = b0 * r + b1 * x1r + b2 * x2r - a1 * y1r - a2 * y2r;
            let yi = b0 * i + b1 * x1i + b2 * x2i - a1 * y1i - a2 * y2i;
            x2r = x1r;
            x1r = r;
            x2i = x1i;
            x1i = i;
            y2r = y1r;
            y1r = yr;
            y2i = y1i;
            y1i = yi;
            return {r: yr, i: yi};
        }
    };

}

export class Biquad {

        static lowPass(frequency:number, sampleRate: number, q?: number): Filter {
            q = typeof q !== 'undefined' ? q : 0.707;
            let freq = 2.0 * Math.PI * frequency / sampleRate;
            let alpha = Math.sin(freq) / (2.0 * q);
            let b0 = (1.0 - Math.cos(freq)) / 2.0;
            let b1 = 1.0 - Math.cos(freq);
            let b2 = (1.0 - Math.cos(freq)) / 2.0;
            let a0 = 1.0 + alpha;
            let a1 = -2.0 * Math.cos(freq);
            let a2 = 1.0 - alpha;
            return BiquadFilter(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0);
        }

        static highPass(frequency:number, sampleRate: number, q?: number): Filter {
            q = typeof q !== 'undefined' ? q : 0.707;
            let freq = 2.0 * Math.PI * frequency / sampleRate;
            let alpha = Math.sin(freq) / (2.0 * q);
            let b0 = (1.0 + Math.cos(freq)) / 2.0;
            let b1 = -(1.0 + Math.cos(freq));
            let b2 = (1.0 + Math.cos(freq)) / 2.0;
            let a0 = 1.0 + alpha;
            let a1 = -2.0 * Math.cos(freq);
            let a2 = 1.0 - alpha;
            return BiquadFilter(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0);
        }

        static bandPass(frequency:number, sampleRate: number, q?: number): Filter {
            q = typeof q !== 'undefined' ? q : 0.5;
            let freq = 2.0 * Math.PI * frequency / sampleRate;
            let alpha = Math.sin(freq) / (2.0 * q);
            let b0 = Math.sin(freq) / 2.0;   //  = q*alpha
            let b1 = 0.0;
            let b2 = -Math.sin(freq) / 2.0;  //  = -q*alpha
            let a0 = 1.0 + alpha;
            let a1 = -2.0 * Math.cos(freq);
            let a2 = 1.0 - alpha;
            return BiquadFilter(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0);
        }

        static bandReject(frequency:number, sampleRate: number, q?: number): Filter {
            q = typeof q !== 'undefined' ? q : 0.5;
            let freq = 2.0 * Math.PI * frequency / sampleRate;
            let alpha = Math.sin(freq) / (2.0 * q);
            let b0 = 1.0;
            let b1 = -2.0 * Math.cos(freq);
            let b2 = 1.0;
            let a0 = 1.0 + alpha;
            let a1 = -2.0 * Math.cos(freq);
            let a2 = 1.0 - alpha;
            return BiquadFilter(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0);
        }

}
