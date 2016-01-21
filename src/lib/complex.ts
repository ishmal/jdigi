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

export interface Complex {
  r: number;
  i: number;
}

export class ComplexOps {

  static add(a: Complex, b: Complex): Complex {
      return {r: a.r + b.r, i: a.i + b.i};
  }

  static sub(a: Complex, b: Complex): Complex {
      return {r: a.r - b.r, i: a.i - b.i};
  }
  static scale(a: Complex, v: number): Complex {
        return {r: a.r * v, i: a.i * v};
  }

  static mul(a: Complex, b: Complex): Complex {
        let ar = a.r;
        let ai = a.i;
        let br = b.r;
        let bi = b.i;
        return {r: ar * br - ai * bi, i: ar * bi + ai * br};
  }

  static neg(a: Complex): Complex {
        return {r: -a.r, i: -a.i};
  }

  static conj(a: Complex): Complex {
        return {r: a.r, i: -a.i};
  }

  static mag(a: Complex): number {
        let r = a.r;
        let i = a.i;
        return r * r + i * i;
  }

  static abs(a: Complex): number {
        return Math.hypot(a.r, a.i);
  }

  static arg(a: Complex): number {
        return Math.atan2(a.i, a.r);
  }

  static ZERO: Complex = {r:0, i:0};
  static ONE: Complex = {r:1, i:0};
  static I: Complex = {r:0, i:1};
}
