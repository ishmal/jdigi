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
'use strict';

import {Complex} from './complex';

function createCossinTable(): Complex[] {
    let twopi = Math.PI * 2.0;
    let two16 = 65536;
    let delta = twopi / two16;
    let xs = new Array(two16);

    for (let idx = 0; idx < two16; idx++) {
        let angle = delta * idx;
        xs[idx] = {r: Math.cos(angle), i: Math.sin(angle)};
    }
    return xs;
}

const ncoTable = createCossinTable();

export interface Nco {
  setFrequency(v: number): void;
  setError(v: number): void;
  next(): Complex;
  mixNext(v: number): Complex;
}

/**
 * A sine generator with a 31-bit accumulator and a 16-bit
 * lookup table.  Much faster than Math.whatever
 */
export function NcoCreate(frequency, sampleRate): Nco {

    let hzToInt = 0x7fffffff / sampleRate;
    let freq = 0 | 0;
    let phase = 0 | 0;
    let table = ncoTable;
    let err = 0;
    let maxErr = (50 * hzToInt) | 0;  // in hertz
    console.log('NCO maxErr: ' + maxErr);
    let minErr = -(50 * hzToInt) | 0;  // in hertz
    setFrequency(frequency);

    function setFrequency(v: number): void {
        freq = (v * hzToInt) | 0;
    }


    function setError(v: number): void {
        err = (err * 0.9 + v * 100000.0) | 0;
        // console.log('err:' + err + '  v:' + v);
        if (err > maxErr) {
            err = maxErr;
        } else if (err < minErr) {
            err = minErr;
        }
    }

    function next(): Complex {
        phase = (phase + (freq + err)) & 0x7fffffff;
        return table[(phase >> 16) & 0xffff];
    }

    function mixNext(v: number): Complex {
        phase = (phase + (freq + err)) & 0x7fffffff;
        let cs = table[(phase >> 16) & 0xffff];
        return {r: v * cs.r, i: -v * cs.i};
    }

    return {
      setFrequency: setFrequency,
      setError: setError,
      next: next,
      mixNext: mixNext
    };
}
