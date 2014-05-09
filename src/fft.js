


function FFT(N) {

    var N2 = N/2;
    var nrStages = Math.log(N) / Math.LN2;
    //todo: validate power-of-2, throw IAE if not

    var bitReversedIndices = 
        (function (n) {
            var xs = [];
            for (var i=0 ; i < n ; i++) {
               var np = n;
               var index = i;
               var bitreversed = 0;
               while (np > 1) {
                   bitreversed <<= 1;
                   bitreversed += index & 1;
                   index >>= 1;
                   np >>= 1;
               }
               xs.push(bitreversed);
            }
            return xs;
        })(N);


    /**
     * This piece does not need to be fast, just correct
     */
    var stages = 
        (function (n) {
            var xs = [];
            var span  = 1;
            var wspan = N2;
            for (var stage=0 ; stage < nrStages ; stage++, span <<= 1, wspan >>= 1) {
                var stageData  = [];
                for (submatrix=0; submatrix<N2/span; submatrix++) {
                    var np = submatrix * span * 2;
                    var ni = np;
                    for (node=0; node<span ; node++) {
                       var l = ni;
                       var r = ni + span;
                       var idx = node * wspan;
                       var wr = Math.cos(Math.PI*2.0*node*wspan / n);
                       var wi = Math.sin(Math.PI*2.0*node*wspan / n);
                       stageData.push({l:l,r:r,wr:wr,wi:wi,idx:idx});
                       ni++;
                    }
                }
                xs.push(stageData);
            }
            return xs;
        })(N);
    this.stages = stages;


    function execute(input) {
    
        //local refs
        var n2     = N2;
        var nrStgs = nrStages;
        var stgs   = stages;

        var outr = [];
        var outi = [];
        for (var idx = 0 ; idx< N ; idx++) {
            //todo:  apply Hann window here
            var bri = bitReversedIndices[idx];
            var v = input[bri];
            //console.log("v:" + bri + " : " + v);
            outr.push(v);
            outi.push(0);
        }
        
        for (var stage=0 ; stage<nrStgs ; stage++) {
            var stageData = stgs[stage];
            for (var i = 0; i < n2; i++) {
                var parms   = stageData[i];
                var wr      = parms.wr;
                var wi      = parms.wi;
                var left    = parms.l;
                var right   = parms.r;
                var leftr   = outr[left];
                var lefti   = outi[left];
                var rightr  = wr * outr[right] - wi * outi[right];
                var righti  = wi * outr[right] + wr * outi[right];
                outr[left]  = leftr + rightr;
                outi[left]  = lefti + righti;
                outr[right] = leftr - rightr;
                outi[right] = lefti - righti;
            }
        }

        var output = { r : outr, i: outi };
        return output;
    }
      
    function powerSpectrum(input) {
    
        var out = execute(input);
        var rarr = out.r;
        var iarr = out.i;
        
        var len = rarr.length;
        
        var ps = [];
        for (var j = 0 ; j < len ; j++) {
            var r = rarr[j];
            var i = iarr[j];
            //console.log("v:" + r + " / " + i);
            //ps.push(Math.sqrt(r*r + i*i));
            ps.push(r*r + i*i);
        }
    
        return ps;
    }
    this.powerSpectrum = powerSpectrum;

}


/*
exports._test = {
    FFT: FFT
};
*/
