

function Complex(r, i) {

    this.r = r;
    this.i = i;

    this.add = function(other) ( return new Complex(this.r + other.r, this.i + other.i);


}




function FFT(N) {

    var cosines = [];
    var sines = [];
    for (var i=0 ; i < N ; i++) {
        var cos = Math.cos(i/N);
        var sin = Math.sin(i/N);
    }
    
    var bitReversedIndices = [];
    for (var i=0 ; i < N ; i++) {
        var n = N;
        var index = i;
        var bitreversed = 0;
        while (n > 1) {
          bitreversed <<= 1;
          bitreversed += index & 1;
          index >>= 1;
          n >>= 1;
        }
        bitReversedIndices.push(bitreversed);
    }

    function execute(input) {
        var  // Counters.
          i, j,
          output, output_r, output_i,
          // Complex multiplier and its delta.
          f_r, f_i, del_f_r, del_f_i, temp,
          // Temporary loop variables.
          l_index, r_index,
          left_r, left_i, right_r, right_i,
          // width of each sub-array for which we're iteratively calculating FFT.
          width

        var output_r = [];
        var output_i = [];
        for (var i = 0 ; i< N ; i++) {
            outputr[bitReversedIndices[i]] = input[i];
            outputi.push(0);
        }

        width = 1
        while (width < n) {
            del_f_r = cos(PI/width)
            del_f_i = sin(PI/width)
            for (i = 0; i < n/(2*width); i++) {
                f_r = 1
                f_i = 0
                for (j = 0; j < width; j++) {
                  l_index = 2*i*width + j
                  r_index = l_index + width

                  left_r = output_r[l_index]
                  left_i = output_i[l_index]
                  right_r = f_r * output_r[r_index] - f_i * output_i[r_index]
                  right_i = f_i * output_r[r_index] + f_r * output_i[r_index]

                  output_r[l_index] = SQRT1_2 * (left_r + right_r)
                  output_i[l_index] = SQRT1_2 * (left_i + right_i)
                  output_r[r_index] = SQRT1_2 * (left_r - right_r)
                  output_i[r_index] = SQRT1_2 * (left_i - right_i)
                  temp = f_r * del_f_r - f_i * del_f_i
                  f_i = f_r * del_f_i + f_i * del_f_r
                  f_r = temp
                }
            }
        width <<= 1
        }

        return output
      }

}
