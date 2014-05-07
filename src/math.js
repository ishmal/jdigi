

function Complex(r, i) {

    this.r = r;
    this.i = i;

    this.add = function(other) { return new Complex(r + other.r, i + other.i); };

}




function FFT(N) {

    var N2 = N/2;

    var cosines = [];
    var sines = [];
    (function () {
        for (var i=0 ; i < N ; i++) {
            var cos = Math.cos(i/N);
            var sin = Math.sin(i/N);
            cosines.push(cos);
            sines.push(sin);
        }
    })();

    var pwrCosines = [];
    var pwrSines = [];
    (function() {
        for (var i=1 ; i < 65536 ; i *= 2) {
            var cos = Math.cos(Math.PI / i);
            var sin = Math.sin(Math.PI / i);
            pwrCosines.push(cos);
            pwrSines.push(sin);
        }
    })();

    var bitReversedIndices = [];
    (function () {
        var xs = [];
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
        return xs;
    })();

    var butterflies = [];
    (function () {
        var span = N2;
        for (var w=1 ; w < N ; w *= 2) {
            var left = [];
            var right = [];
            for (var i=0 ; i < w ; i++) {
                for (var j=i ; j < i+span ; j++) {
                   left.push(j);
                   right.push(j+span);
                }
            }
            span /= 2;
            butterflies.push({left:left, right:right});
        }
    })();
    this.butterflies = butterflies;

    function execute(input) {

        var output_r = [];
        var output_i = [];
        for (var idx = 0 ; idx< N ; idx++) {
            outputr[bitReversedIndices[idx]] = input[idx];
            outputi.push(0);
        }

        var width = 1;
        var pwr = 0;

        while (width < N) {
            var left = lefts[pwr];
            var right = rights[pwr];
            var del_f_r = pwrCosines[pwr];
            var del_f_i = pwrSines[pwr];
            for (var i = 0; i < N2; i++) {
                var f_r = 1;
                var f_i = 0;
                var l_index = left[i];
                var r_index = right[i];
                var left_r = output_r[l_index];
                var left_i = output_i[l_index];
                var right_r = f_r * output_r[r_index] - f_i * output_i[r_index];
                var right_i = f_i * output_r[r_index] + f_r * output_i[r_index];

                output_r[l_index] = SQRT1_2 * (left_r + right_r);
                output_i[l_index] = SQRT1_2 * (left_i + right_i);
                output_r[r_index] = SQRT1_2 * (left_r - right_r);
                output_i[r_index] = SQRT1_2 * (left_i - right_i);
                var temp = f_r * del_f_r - f_i * del_f_i;
                f_i = f_r * del_f_i + f_i * del_f_r;
                f_r = temp;
            }
        width <<= 1;
        ispan >>= 1;
        pwr++;
        }

      var output = { r : output_r, i: output_i };
      return output;
      }

}


exports._test = {
    FFT: FFT
};
