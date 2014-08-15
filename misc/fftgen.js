


function FftGen(N) {




    var PLUS = " + ";
    var COMMA = ", ";
    
    /* ####################################################################
    ##  JAVA
    #################################################################### */

    function javaDecl(pfx) {
        p("private double ");
        var col=0;
        for (var i=0 ; i<N ; i++) {
            p(pfx + i);
            if (i < N-1)
                p(",");
            if (++col >= 16) {
                col=0;
                nl();
            }
        }
        p(";");
    }
    
    function javaLoadReal() {

        var col = 0;
        for (var i=0 ; i<N ; i++) {
            p("r"+ i + "=b[" + i + "];");
            p("i"+ i + "=0; ");
            if (++col >= 6) {
                col=0;
                nl();
            }
        }
        nl();
    }
    
    
    /**
     * Note that here, we will not compute anything, but
     * will output the code that does
     */
    function javaCompute() {
        var ix, id, i0, i1, i2, i3;
        var j,k;
        var n2, n4;
        
        n2 = N;// == n>>(k-1) == n, n/2, n/4, ..., 4
        n4 = n2>>2; // == n/4, n/8, ..., 1
        for (k=1; k<power; k++, n2>>=1, n4>>=1) {

            id = (n2<<1);
            for (ix=0 ; ix<N ; ix=(id<<1)-n2, id <<= 2)  { //ix=j=0
                for (i0=ix; i0<N; i0+=id) {
                    i1 = i0 + n4;
                    i2 = i1 + n4;
                    i3 = i2 + n4;

                    //sumdiff3(x[i0], x[i2], t0);
                    //tr0 = xr[i0] - xr[i2];
                    //ti0 = xi[i0] - xi[i2];
                    //xr[i0] += xr[i2];
                    //xi[i0] += xi[i2];
                    //sumdiff3(x[i1], x[i3], t1);
                    //tr1 = xr[i1] - xr[i3];
                    //ti1 = xi[i1] - xi[i3];
                    //xr[i1] += xr[i3];
                    //xi[i1] += xi[i3];
                    jc("tr0=r" + i0 + "-r" + i2 + ";  ti0=i" + i0 + "-i"+ i2 + "; " +
                        "r"+i0 + "+=r" + i2 + ";  i"+i0 + "+=i" + i2 + "; " +
                        "tr1=r" + i1 + "-r" + i3 + "; ti1=i" + i1 + "-i" + i3 + "; " +
                        "r"+i1 + "+=r" + i3 + "; i"+i1 + "+=i" + i3 + ";"); 

                    // t1 *= Complex(0, 1);  // +isign
                    //tr = tr1;
                    //tr1 = -ti1;
                    //ti1 = tr;
                    jc("tr=tr1; tr1=-ti1; ti1=tr;");
       

                    //sumdiff(t0, t1);
                    //tr  = tr1 - tr0;
                    //ti  = ti1 - ti0;
                    //tr0 += tr1;
                    //ti0 += ti1;
                    //tr1 = tr;
                    //ti1 = ti;
                    jc("tr=tr1-tr0; ti=ti1-ti0; tr0+=tr1; ti0+=ti1; tr1=tr; ti1=ti;");

                    //xr[i2] = tr0;
                    //xi[i2] = ti0;
                    //xr[i3] = tr1;
                    //xi[i3] = ti1;
                    jc("r"+i2 + "=tr0; i"+i2 + "=ti0; r"+i3 + "=tr1; i"+i3 + "=ti1;");
               }
            }


        var e = 2.0 * Math.PI / n2;

        for (j=1; j<n4; j++) {

            var a = e * j;
            var wr1 = Math.cos(a).toFixed(4);
            var wi1 = Math.sin(a).toFixed(4);
            var wr3 = Math.cos(3.0*a).toFixed(4);
            var wi3 = Math.sin(3.0*a).toFixed(4);

            id = (n2<<1);
            for (ix=j ; ix<N ; ix = (id<<1)-n2+j, id <<= 2) {
                for (i0=ix; i0<N; i0+=id) {
                    i1 = i0 + n4;
                    i2 = i1 + n4;
                    i3 = i2 + n4;
                    
                    jc("tr0=r" + i0 + "-r" + i2 + ";  ti0=i" + i0 + "-i"+ i2 + "; " +
                        "r"+i0 + "+=r" + i2 + ";  i"+i0 + "+=i" + i2 + "; " +
                        "tr1=r" + i1 + "-r" + i3 + "; ti1=i" + i1 + "-i" + i3 + "; " +
                        "r"+i1 + "+=r" + i3 + "; i"+i1 + "+=i" + i3 + ";"); 

                    jc("tr=tr1; tr1=-ti1; ti1=tr;");

                    jc("tr=tr1-tr0; ti=ti1-ti0; tr0+=tr1; ti0+=ti1; tr1=tr; ti1=ti;");

                    //xr[i2] = tr0*wr1 - ti0*wi1;
                    //xi[i2] = ti0*wr1 + tr0*wi1;
                    //xr[i3] = tr1*wr3 - ti1*wi3;
                    //xi[i3] = ti1*wr3 + tr1*wi3;
                    jc("r" + i2 + "=tr0*" + wr1 + "-ti0*" + wi1 + "; i" + i2 + "=ti0*" + wr1 + "+tr0*" + wi1 + ";");
                    jc("r" + i3 + "=tr1*" + wr3 + "-ti1*" + wi3 + "; i" + i3 + "=ti1*" + wr3 + "+tr1*" + wi3 + ";");
                    }
                }
            }
        }

        for (ix=0, id=4 ;  ix<N ;  id<<=2) {
            for (i0=ix; i0<N; i0+=id) {
                i1 = i0+1;
                //tr = xr[i1] - xr[i0];
                //ti = xi[i1] - xi[i0];
                //xr[i0] += xr[i1];
                //xi[i0] += xi[i1];
                //xr[i1] = tr;
                //xi[i1] = ti;
                jc("tr=r" + i1 + "-r" + i0 + ";  ti=i" + i1 + "-i" + i0 + "; " +
                  "  r" + i0 + "+=r" + i1 + ";  i" + i0 + "+=i" + i1 + "; " +
                    "r" + i1 + "=tr; i" + i1 + "=ti;");
            }
            ix = id + id - 2; //2*(id-1);
        }

    }
    
    var jcMethodCount = 0;
    var jcLineCount = 0;
    
    function jc(s) {
        process.stdout.write(s); process.stdout.write("\n");
        if (++jcLineCount > 128) {
            jcLineCount = 0;
            process.stdout.write("}\n\n");
            process.stdout.write("public void f" + (jcMethodCount++) + "(){\n");
        }
    }
    
    
    function javaOutput() {
        p("public class FFTx {"); nl();
        nl();
        p("private double tr, ti, tr0, ti0, tr1, ti1;"); nl();
        javaDecl("r");
        nl();
        javaDecl("i");
        nl();
        nl();
        
        p("public void read(double b[]) {"); nl();
        javaLoadReal();
        p("}"); nl();
        nl();
        nl();
        
        p("public void f0() {"); nl();
        fMethodCount++;
        javaCompute();
        p("}"); nl();
                
        p("public void execute() {"); nl();
        var col = 0;
        for (var i=0 ; i<jcMethodCount ; i++) {
            p("f" + i + "();");
            if (++col >= 16) {
                col = 0;
                nl();
            }
        }
        nl();
        p("}"); nl();
        nl();
        nl();
        
        p("public void ps(double a[], double b[]) {"); nl();
        p("read(a);"); nl();
        for (var idx=0 ; idx<N ; idx++) {
            var i = bitReversedIndices[idx];
            p("b[" + idx + "]=r" + i + "*r" + i + "+i" + i + "*i" + i + ";"); nl();
        }
        p("}"); nl();
        nl();
        p("}//FFTx"); nl();
    
    }
       


    /* ####################################################################
    ##  JAVASCRIPT
    #################################################################### */


    function jsDecl(pfx) {
        p("var ");
        var col=0;
        for (var i=0 ; i<N ; i++) {
            p(pfx + i);
            if (i < N-1)
                p(",");
            if (++col >= 16) {
                col=0;
                nl();
            }
        }
        p(";");
    }
    
    function jsLoadReal() {

        var col = 0;
        for (var i=0 ; i<N ; i++) {
            p("r"+ i + "=b[" + i + "];");
            p("i"+ i + "=0; ");
            if (++col >= 6) {
                col=0;
                nl();
            }
        }
        nl();
    }
    
    
    /**
     * Note that here, we will not compute anything, but
     * will output the code that does
     */
    function jsCompute() {
        var ix, id, i0, i1, i2, i3;
        var j,k;
        var n2, n4;
        
        p("var tr, ti, tr0, ti0, tr1, ti1;"); nl();

        n2 = N;// == n>>(k-1) == n, n/2, n/4, ..., 4
        n4 = n2>>2; // == n/4, n/8, ..., 1
        for (k=1; k<power; k++, n2>>=1, n4>>=1) {

            id = (n2<<1);
            for (ix=0 ; ix<N ; ix=(id<<1)-n2, id <<= 2)  { //ix=j=0
                for (i0=ix; i0<N; i0+=id) {
                    i1 = i0 + n4;
                    i2 = i1 + n4;
                    i3 = i2 + n4;

                    //sumdiff3(x[i0], x[i2], t0);
                    //tr0 = xr[i0] - xr[i2];
                    //ti0 = xi[i0] - xi[i2];
                    //xr[i0] += xr[i2];
                    //xi[i0] += xi[i2];
                    //sumdiff3(x[i1], x[i3], t1);
                    //tr1 = xr[i1] - xr[i3];
                    //ti1 = xi[i1] - xi[i3];
                    //xr[i1] += xr[i3];
                    //xi[i1] += xi[i3];
                    p("tr0=r" + i0 + "-r" + i2 + ";  ti0=i" + i0 + "-i"+ i2 + "; ");
                    p("r"+i0 + "+=r" + i2 + ";  i"+i0 + "+=i" + i2 + "; ");
                    p("tr1=r" + i1 + "-r" + i3 + "; ti1=i" + i1 + "-i" + i3 + "; ");
                    p("r"+i1 + "+=r" + i3 + "; i"+i1 + "+=i" + i3 + ";"); nl(); 

                    // t1 *= Complex(0, 1);  // +isign
                    //tr = tr1;
                    //tr1 = -ti1;
                    //ti1 = tr;
                    p("tr=tr1; tr1=-ti1; ti1=tr;"); nl();
       

                    //sumdiff(t0, t1);
                    //tr  = tr1 - tr0;
                    //ti  = ti1 - ti0;
                    //tr0 += tr1;
                    //ti0 += ti1;
                    //tr1 = tr;
                    //ti1 = ti;
                    p("tr=tr1-tr0; ti=ti1-ti0; tr0+=tr1; ti0+=ti1; tr1=tr; ti1=ti;"); nl();

                    //xr[i2] = tr0;
                    //xi[i2] = ti0;
                    //xr[i3] = tr1;
                    //xi[i3] = ti1;
                    p("r"+i2 + "=tr0; i"+i2 + "=ti0; r"+i3 + "=tr1; i"+i3 + "=ti1;"); nl();
               }
            }


        var e = 2.0 * Math.PI / n2;

        for (j=1; j<n4; j++) {

            var a = e * j;
            var wr1 = Math.cos(a).toFixed(4);
            var wi1 = Math.sin(a).toFixed(4);
            var wr3 = Math.cos(3.0*a).toFixed(4);
            var wi3 = Math.sin(3.0*a).toFixed(4);

            id = (n2<<1);
            for (ix=j ; ix<N ; ix = (id<<1)-n2+j, id <<= 2) {
                for (i0=ix; i0<N; i0+=id) {
                    i1 = i0 + n4;
                    i2 = i1 + n4;
                    i3 = i2 + n4;
                    
                    p("tr0=r" + i0 + "-r" + i2 + ";  ti0=i" + i0 + "-i"+ i2 + "; ");
                    p("r"+i0 + "+=r" + i2 + ";  i"+i0 + "+=i" + i2 + "; ");
                    p("tr1=r" + i1 + "-r" + i3 + "; ti1=i" + i1 + "-i" + i3 + "; ");
                    p("r"+i1 + "+=r" + i3 + "; i"+i1 + "+=i" + i3 + ";"); nl(); 

                    p("tr=tr1; tr1=-ti1; ti1=tr;"); nl();

                    p("tr=tr1-tr0; ti=ti1-ti0; tr0+=tr1; ti0+=ti1; tr1=tr; ti1=ti;"); nl();

                    //xr[i2] = tr0*wr1 - ti0*wi1;
                    //xi[i2] = ti0*wr1 + tr0*wi1;
                    //xr[i3] = tr1*wr3 - ti1*wi3;
                    //xi[i3] = ti1*wr3 + tr1*wi3;
                    p("r" + i2 + "=tr0*" + wr1 + "-ti0*" + wi1 + "; i" + i2 + "=ti0*" + wr1 + "+tr0*" + wi1 + ";"); nl();
                    p("r" + i3 + "=tr1*" + wr3 + "-ti1*" + wi3 + "; i" + i3 + "=ti1*" + wr3 + "+tr1*" + wi3 + ";"); nl();
                    }
                }
            }
        }

        for (ix=0, id=4 ;  ix<N ;  id<<=2) {
            for (i0=ix; i0<N; i0+=id) {
                i1 = i0+1;
                //tr = xr[i1] - xr[i0];
                //ti = xi[i1] - xi[i0];
                //xr[i0] += xr[i1];
                //xi[i0] += xi[i1];
                //xr[i1] = tr;
                //xi[i1] = ti;
                p("tr=r" + i1 + "-r" + i0 + ";  ti=i" + i1 + "-i" + i0 + "; ");
                p("r" + i0 + "+=r" + i1 + ";  i" + i0 + "+=i" + i1 + "; ");
                p("r" + i1 + "=tr; i" + i1 + "=ti;"); nl();
            }
            ix = id + id - 2; //2*(id-1);
        }

    }
    
    
    function jsOutput() {
        p("function FFTx() {"); nl();
        nl();
        jsDecl("r");
        nl();
        jsDecl("i");
        nl();
        nl();
        
        p("function read(b) {"); nl();
        jsLoadReal();
        p("}"); nl();
        nl();
        nl();
        
        p("function execute() {"); nl();
        jsCompute();
        p("}"); nl();
        nl();
        nl();
        
        p("function ps(a, b) {"); nl();
        p("read(a);"); nl();
        for (var idx=0 ; idx<N ; idx++) {
            var i = bitReversedIndices[idx];
            p("b[" + idx + "]=r" + i + "*r" + i + "+i" + i + "*i" + i + ";"); nl();
        }
        p("}"); nl();
        nl();
        p("this.ps = ps;"); nl();
        nl();
        p("}//FFT"); nl();
    
        p("export {FFTx};"); nl();
    }
       

    /* ####################################################################
    ##  M A I N
    #################################################################### */

    var N2 = N/2;
    var power = (Math.log(N) / Math.LN2) | 0;

    function createBitReversedIndices(n) {
        var xs = new Array(n);
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
           xs[i] = bitreversed;
        }
        return xs;
    }
    var bitReversedIndices = createBitReversedIndices(N);

    var output = javaOutput;

    function makeWindow(size) {
        var w = new Array(size);
        for (var i=0 ; i<size ; i++) {
            w[i] = 0.5 - 0.5 * Math.cos(2.0 * Math.PI * i / (size - 1));  //Hann window
	    }
        return w;
    }
    
    function p(s) {
        process.stdout.write(s);
    }
    function nl() {
        process.stdout.write("\n");
    }
    

    this.doIt = function() {
        output();
    }


}


var fftgen = new FftGen(2048);
fftgen.doIt();



