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
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Complex} from "./math";
import {Window} from "./window";


/**
 * Perform a relatively-efficient FFT
 */
function FFT(N) {

    let N2 = N / 2;
    let power = (Math.log(N) / Math.LN2) | 0;
    let nrStages = power;
    //todo: validate power-of-2, throw IAE if not

    function createBitReversedIndices(n) {
        let xs = new Array(n);
        for (let i = 0; i < n; i++) {
            let np = n;
            let index = i;
            let bitreversed = 0;
            while (np > 1) {
                bitreversed <<= 1;
                bitreversed += index & 1;
                index >>= 1;
                np >>= 1;
            }
            xs[i] = bitreversed;
        }
        return xs;
    }

    let bitReversedIndices = createBitReversedIndices(N);

    /**
     * This piece does not need to be fast, just correct
     */
    function generateStageData() {
        let xs = [];
        let span = 1;
        let wspan = N2;
        let ninv = 1 / N;
        for (let stage = 0; stage < nrStages; stage++, span <<= 1, wspan >>= 1) {
            let stageData = [];
            for (submatrix = 0; submatrix < N2 / span; submatrix++) {
                let np = submatrix * span * 2;
                let ni = np;
                for (node = 0; node < span; node++) {
                    let l = ni;
                    let r = ni + span;
                    let idx = node * wspan;
                    let wr = Math.cos(Math.PI * 2.0 * node * wspan * ninv);
                    let wi = Math.sin(Math.PI * 2.0 * node * wspan * ninv);
                    stageData[stageData.length] = {l: l, r: r, wr: wr, wi: wi, idx: idx};
                    ni++;
                }
            }
            xs[xs.length] = stageData;
        }
        return xs;
    }

    let stages = generateStageData();


    function apply(input) {

        //local refs
        let n2 = N2;
        let nrStgs = nrStages;
        let stgs = stages;

        let xr = new Array(N);
        let xi = new Array(N);
        for (let idx = 0; idx < N; idx++) {
            //todo:  apply Hann window here
            let bri = bitReversedIndices[idx];
            xr[idx] = input[bri];
            xi[idx] = 0;
        }

        for (let stage = 0; stage < nrStgs; stage++) {
            let stageData = stgs[stage];
            for (let i = 0; i < n2; i++) {
                let parms = stageData[i];
                let wr = parms.wr;
                let wi = parms.wi;
                let left = parms.l;
                let right = parms.r;
                let leftr = xr[left];
                let lefti = xi[left];
                let rightr = wr * xr[right] - wi * xi[right];
                let righti = wi * xr[right] + wr * xi[right];
                xr[left] = leftr + rightr;
                xi[left] = lefti + righti;
                xr[right] = leftr - rightr;
                xi[right] = lefti - righti;
            }
        }
        return {r: xr, i: xi};
    }


    function powerSpectrum(input) {

        let x = apply(input);
        let xr = x.r;
        let xi = x.i;
        let len = N2;

        let ps = new Array(len);
        for (let j = 0; j < len; j++) {
            let r = xr[j];
            let i = xi[j];
            ps[j] = r * r + i * i;
        }
        return ps;
    }

    this.powerSpectrum = powerSpectrum;

} //FFT


/**
 * Perform a very efficient FFT.  Split Radix!
 */
function FFTSR(N) {

    let power = (Math.log(N) / Math.LN2) | 0;
    let N2 = N >> 1;

    function generateBitReversedIndices(n) {
        let xs = new Array(n);
        for (let i = 0; i < n; i++) {
            let np = n;
            let index = i;
            let bitreversed = 0;
            while (np > 1) {
                bitreversed <<= 1;
                bitreversed += index & 1;
                index >>= 1;
                np >>= 1;
            }
            xs[i] = bitreversed;
        }
        return xs;
    }

    let bitReversedIndices = generateBitReversedIndices(N);

    //let's pre-generate anything we can
    function generateStageData(pwr) {
        let xs = [];
        let n2 = N;// == n>>(k-1) == n, n/2, n/4, ..., 4
        let n4 = n2 >> 2; // == n/4, n/8, ..., 1
        for (let k = 1; k < pwr; k++, n2 >>= 1, n4 >>= 1) {
            let stage = [];
            let e = 2.0 * Math.PI / n2;
            for (let j = 1; j < n4; j++) {
                let a = j * e;
                stage[stage.length] = {
                    wr1: Math.cos(a), wi1: Math.sin(a),
                    wr3: Math.cos(3 * a), wi3: Math.sin(3 * a)
                };
            }
            xs[xs.length] = stage;
        }
        return xs;
    }

    let stages = generateStageData(power);
    let W = Window.hann(N);
    let xr = new Float32Array(N);
    let xi = new Float32Array(N);
    let ZEROES = new Float32Array(N);


    /**
     * Real samples
     */
    function apply(input) {
        xr.set(input);
        xi.set(ZEROES);
        compute();
    }

    /**
     * Complex samples
     */
    function applyX(input) {
        for (let idx = 0; idx < N; idx++) {
            let cx = input[idx];
            xr[idx] = cx.r; // * W[idx];
            xi[idx] = cx.i;
        }
        compute();
    }


    function compute() {
        let ix, id, i0, i1, i2, i3;
        let j, k;
        let tr, ti, tr0, ti0, tr1, ti1;
        let n2, n4;

        let stageidx = 0;

        n2 = N;  // == n>>(k-1) == n, n/2, n/4, ..., 4
        n4 = n2 >> 2; // == n/4, n/8, ..., 1
        for (k = 1; k < power; k++, n2 >>= 1, n4 >>= 1) {

            let stage = stages[stageidx++];

            id = (n2 << 1);
            for (ix = 0; ix < N; ix = (id << 1) - n2, id <<= 2) { //ix=j=0
                for (i0 = ix; i0 < N; i0 += id) {
                    i1 = i0 + n4;
                    i2 = i1 + n4;
                    i3 = i2 + n4;

                    //sumdiff3(x[i0], x[i2], t0);
                    tr0 = xr[i0] - xr[i2];
                    ti0 = xi[i0] - xi[i2];
                    xr[i0] += xr[i2];
                    xi[i0] += xi[i2];
                    //sumdiff3(x[i1], x[i3], t1);
                    tr1 = xr[i1] - xr[i3];
                    ti1 = xi[i1] - xi[i3];
                    xr[i1] += xr[i3];
                    xi[i1] += xi[i3];

                    // t1 *= Complex(0, 1);  // +isign
                    tr = tr1;
                    tr1 = -ti1;
                    ti1 = tr;

                    //sumdiff(t0, t1);
                    tr = tr1 - tr0;
                    ti = ti1 - ti0;
                    tr0 += tr1;
                    ti0 += ti1;
                    tr1 = tr;
                    ti1 = ti;

                    xr[i2] = tr0;  // .mul(w1);
                    xi[i2] = ti0;  // .mul(w1);
                    xr[i3] = tr1;  // .mul(w3);
                    xi[i3] = ti1;  // .mul(w3);
                }
            }


            let dataindex = 0;

            for (j = 1; j < n4; j++) {

                let data = stage[dataindex++];
                let wr1 = data.wr1;
                let wi1 = data.wi1;
                let wr3 = data.wr3;
                let wi3 = data.wi3;

                id = (n2 << 1);
                for (ix = j; ix < N; ix = (id << 1) - n2 + j, id <<= 2) {
                    for (i0 = ix; i0 < N; i0 += id) {
                        i1 = i0 + n4;
                        i2 = i1 + n4;
                        i3 = i2 + n4;

                        //sumdiff3(x[i0], x[i2], t0);
                        tr0 = xr[i0] - xr[i2];
                        ti0 = xi[i0] - xi[i2];
                        xr[i0] += xr[i2];
                        xi[i0] += xi[i2];
                        //sumdiff3(x[i1], x[i3], t1);
                        tr1 = xr[i1] - xr[i3];
                        ti1 = xi[i1] - xi[i3];
                        xr[i1] += xr[i3];
                        xi[i1] += xi[i3];

                        // t1 *= Complex(0, 1);  // +isign
                        tr = tr1;
                        tr1 = -ti1;
                        ti1 = tr;

                        //sumdiff(t0, t1);
                        tr = tr1 - tr0;
                        ti = ti1 - ti0;
                        tr0 += tr1;
                        ti0 += ti1;
                        tr1 = tr;
                        ti1 = ti;

                        xr[i2] = tr0 * wr1 - ti0 * wi1;  // .mul(w1);
                        xi[i2] = ti0 * wr1 + tr0 * wi1;  // .mul(w1);
                        xr[i3] = tr1 * wr3 - ti1 * wi3;  // .mul(w3);
                        xi[i3] = ti1 * wr3 + tr1 * wi3;  // .mul(w3);
                    }
                }
            }
        }

        for (ix = 0, id = 4; ix < N; id <<= 2) {
            for (i0 = ix; i0 < N; i0 += id) {
                i1 = i0 + 1;
                tr = xr[i1] - xr[i0];
                ti = xi[i1] - xi[i0];
                xr[i0] += xr[i1];
                xi[i0] += xi[i1];
                xr[i1] = tr;
                xi[i1] = ti;
            }
            ix = id + id - 2; //2*(id-1);
        }

    }//apply


    function computePowerSpectrum(ps) {
        let len = N2;
        let indices = bitReversedIndices;
        for (let j = 0; j < len; j++) {
            let bri = indices[j];
            let r = xr[bri];
            let i = xi[bri];
            ps[j] = r * r + i * i;
        }
    }

    function powerSpectrum(input, ps) {
        apply(input);
        computePowerSpectrum(ps);
    }

    this.powerSpectrum = powerSpectrum;

    function powerSpectrumX(input, ps) {
        applyX(input);
        computePowerSpectrum(ps);
    }

    this.powerSpectrumX = powerSpectrumX;


} //FFTSR


function SimpleGoertzel(frequency, binWidth, sampleRate) {

    //how many bins would there be for this binWidth? Integer
    let N = (sampleRate / binWidth) | 0;
    //which bin out of N are we? Must be an integer.
    let bin = (0.5 + frequency / sampleRate * N) | 0;
    let w = 2.0 * Math.PI / N * bin;  //omega
    let wr = Math.cos(w);
    let wr2 = 2.0 * wr;
    let wi = Math.sin(w);
    let pr1 = 0, pr2 = 0, pi1 = 0, pi2 = 0;
    let damping = 0.999;

    this.N = N;

    this.reset = function () {
        pr1 = 0;
        pr2 = 0;
        pi1 = 0;
        pi2 = 0;
    };

    //use this if computed with update()
    this.x = function () {
        return new Complex(wr * pr1 - pr2, wi * pr1);
    };

    //use this if computed with updateX()
    this.X = function () {
        let realr = wr * pr1 - pr2;
        let reali = wi * pr1;
        let imagr = wr * pi1 - p12;
        let imagi = wi * pi1;
        return {r: realr - imagi, i: reali + imagr};
    };

    //faster for power spectrum
    this.mag = function () {
        return pr1 * pr1 + pr2 * pr2;
    };

    //correct
    this.mag2 = function () {
        return pr1 * pr1 + pr2 * pr2 - wr2 * pr1 * pr2;
    };

    //for complex values
    this.magX = function () {
        return Complex.mag(this.X());
    };

    this.update = function (point) {
        let r = point + (pr1 * wr2 - pr2);
        pr2 = pr1 - point;
        pr1 = r;
    };

    this.updateX = function (point) {
        let r = point.r + (pr1 * wr2 - pr2);
        pr2 = pr1 - point.r;
        pr1 = r * damping;
        let i = point.i + (pi1 * wr2 - pi2);
        pi2 = pi1 - point.i;
        pi1 = i * damping;
    };


}


export {FFT,FFTSR,SimpleGoertzel};
