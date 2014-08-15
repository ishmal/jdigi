


function PpGen(columns) {


    var PLUS = " + ";
    var COMMA = ", ";
    
    /* ####################################################################
    ##  JAVA
    #################################################################### */
    
    function javaDecl(pfx, decimation) {
        var sep = "";
        for (var i=0 ; i<decimation+2 ; i++) {
            p(sep + pfx + i + "=0.0");
            sep = COMMA;
        }
        p(";"); nl();
    }
    
    function javaDecShift(pfx, decimation, rhs) {
        for (i=0 ; i<decimation+1 ; i++) {
            p(pfx + i + "=" + pfx + (i+1) + "; ");
        }
        p(pfx + (decimation+1) + "=" + rhs + ";"); nl();
    }
    
    function javaDecCalc(pfx, coeffs, suffix) {
        var sep = "";
        var len = coeffs.length;
        for (var i=0 ; i<len ; i++) {
            var c = coeffs[i];
            //p("c:" + c + ""); nl();
            if (Math.abs(c) > 0.000001) {
                p(sep);
                p(pfx + i + suffix + "*" + c.toFixed(5));
                sep = PLUS;
            }
        }
    }    
    
    function javaIntCalc(pfx, row, suffix) {
        var sep = "";
        var len = row.length;
        for (var col=0 ; col<len ; col++) {
            var c = row[col];
            if (Math.abs(c) > 0.00001) {
                p(sep);
                p(pfx + col + suffix + " * " + c.toFixed(5));
                sep = PLUS;
            }
        }
    }    
    
    function javaOutput(decimation, size, table) {
       //showTable(table); return;
        var coeffs = decimationCoefficients(table);
        p("/**"); nl();
        p(" * ### decimation : " + decimation); nl(); 
        p(" */"); nl();
        p("public static class RS" + decimation + " implements RS {"); nl();
        p("    private double ");
        javaDecl("r", decimation);
        p("    private double ");
        javaDecl("i", decimation);
        p("    private int idx = 0;"); nl();
        p("    private double r = 0.0;"); nl();
        p("    private double i = 0.0;"); nl();
        p("    public double getR(){ return r; }"); nl();
        p("    public double getI(){ return i; }"); nl();
        nl();
 
        /**
         * REAL DECIMATION
         */
        p("    public boolean decimate(double v) {"); nl();
        p("        ");
        javaDecShift("r", decimation, "v");
        p("        if (++idx >= " + decimation + ") {"); nl();
        p("            idx = 0;"); nl();
        p("            r = ");
        javaDecCalc("r", coeffs, "");
        p(";"); nl();
        p("            return true;"); nl();
        p("        } else {"); nl();
        p("            return false;"); nl();
        p("        }"); nl();
        p("    }"); nl();
        nl();
        
        /**
         * COMPLEX DECIMATION
         */
        p("    public boolean decimate(double r, double i) {"); nl();
        p("        ");
        javaDecShift("r", decimation, "r");
        p("        ");
        javaDecShift("i", decimation, "i");
        p("        if (++idx >= " + decimation + ") {"); nl();
        p("            idx = 0;"); nl();
        p("            this.r = ");
        javaDecCalc("r", coeffs, "");
        p(";"); nl();
        p("            this.i = ");
        javaDecCalc("i", coeffs, "");
        p(";"); nl();
        p("            return true;"); nl();
        p("        } else {"); nl();
        p("            return false;"); nl();
        p("        }"); nl();
        p("    };"); nl();
        nl();
        
        /**
         * REAL INTERPOLATION
         */
        p("    public void interpolate(double v, double buf[]) {"); nl();
        p("        r0 = r1; r1 = r2; r2 = v;"); nl();
        for (var row = 0 ; row < decimation ; row++) {
            var rowarr = table[row];
            p("        buf[" + row + "] = ");
            if (Math.abs(arrsum(rowarr)) < 0.0001) {
                p("0");
            } else {
                javaIntCalc("r", rowarr, "");
            }
            p(";"); nl();
        }
        p("    };"); nl();
        nl();
        
       /**
         * COMPLEX INTERPOLATION
         */
        p("    public void interpolate(double r, double i, double rbuf[], double ibuf[]) {"); nl();
        p("        r0 = r1; r1 = r2; r2 = r;"); nl();
        p("        i0 = i1; i1 = i2; i2 = i;"); nl();
        for (row = 0 ; row < decimation ; row++) {
            var rowarr2 = table[row];
            p("        rbuf[" + row + "] = ");
            if (Math.abs(arrsum(rowarr2)) < 0.0001) {
                p("0.0;"); nl();
            } else {
                javaIntCalc("r", rowarr2, "");
                p(";"); nl();
            }
            p("        ibuf[" + row + "] = ");
            if (Math.abs(arrsum(rowarr2)) < 0.0001) {
                p("0.0;"); nl();
            } else {
                javaIntCalc("i", rowarr2, "");
                p(";"); nl();
            }
        }
        p("    };"); nl();
        nl();
        
        //# END
        p("}"); nl();
        nl();
    }
    
    function javaHeader() {
        p("public class Resampler {"); nl();
        p("    public interface RS {"); nl();
        p("        public boolean decimate(double v);"); nl();
        p("        public boolean decimate(double r, double i);"); nl();
        p("        public void interpolate(double v, double buf[]);"); nl();
        p("        public void interpolate(double r, double i, double rbuf[], double ibuf[]);"); nl();
        p("        public double getR();"); nl();
        p("        public double getI();"); nl();
        p("    }"); nl();
        nl();
        p("    public static class RS1 implements RS {"); nl();
        p("        private double r; double i;"); nl();
        p("        public boolean decimate(double v) { r = v ; return true; }"); nl();
        p("        public boolean decimate(double r, double i) { this.r=r; this.i=i; return true; }"); nl();
        p("        public void interpolate(double v, double buf[]) { buf[0] = v; }"); nl();
        p("        public void interpolate(double r, double i, double rbuf[], double ibuf[]) "); nl();
        p("            { rbuf[0]=r; ibuf[0] = i; }"); nl();
        p("        public double getR() { return r; }"); nl();
        p("        public double getI() { return i; }"); nl();
        p("    }"); nl();
        nl();
    }
    
    
    function javaFooter() {
        p("    public static RS create(int decimation) {"); nl();
        p("        switch (decimation) {"); nl();
        p("            case 2 : return new RS2();"); nl();
        p("            case 3 : return new RS3();"); nl();
        p("            case 4 : return new RS4();"); nl();
        p("            case 5 : return new RS5();"); nl();
        p("            case 6 : return new RS6();"); nl();
        p("            case 7 : return new RS7();"); nl();
        p("            default :"); nl();
        p("                throw new IllegalArgumentException(\"Decimation \" + decimation + \" is not supported\");"); nl();
        p("        }"); nl();
        p("    }"); nl();
        p("}"); nl();
    }
    
    
    
    /* ####################################################################
    ##  JAVASCRIPT
    #################################################################### */
    function jsDecCalc(coeffs, suffix) {
        var sep = "";
        var len = coeffs.length;
        for (var i=0 ; i<len ; i++) {
            var c = coeffs[i];
            //p("c:" + c + ""); nl();
            if (Math.abs(c) > 0.000001) {
                p(sep);
                p("d" + i + suffix + "*" + c.toFixed(5));
                sep = PLUS;
            }
        }
    }    
    
    function jsIntCalc(row, suffix) {
        var sep = "";
        var len = row.length;
        for (var col=0 ; col<len ; col++) {
            var c = row[col];
            if (Math.abs(c) > 0.00001) {
                p(sep);
                p("d" + col + suffix + " * " + c.toFixed(5));
                sep = PLUS;
            }
        }
    }    
    
    function jsOutput(decimation, size, table) {
        //showTable(table); return;
        var coeffs = decimationCoefficients(table);
        p("/**"); nl();
        p(" * ### decimation : " + decimation); nl(); 
        p(" */"); nl();
        p("function Resampler" + decimation + "() {"); nl();
        p("    ");
        for (var i=0 ; i<decimation+2 ; i++) {
            p("var d" + i + "=0; ");
        }
        nl();
        p("    var idx = 0;"); nl();
        p("    this.value = 0;"); nl();
        nl();
        
        /**
         * REAL DECIMATION
         */
        p("    this.decimate = function(v) {"); nl();
        p("        ");
        for (i=0 ; i<decimation+1 ; i++) {
            p("d" + i + "=d" + (i+1) + "; ");
        }
        p("d" + (decimation+1) + "=v;"); nl();
        p("        if (++idx >= " + decimation + ") {"); nl();
        p("            idx = 0;"); nl();
        p("            this.value = ");
        jsDecCalc(coeffs, "");
        p(";"); nl();
        p("            return true;"); nl();
        p("        } else {"); nl();
        p("            return false;"); nl();
        p("        }"); nl();
        p("    };"); nl();
        nl();
        
        /**
         * COMPLEX DECIMATION
         */
        p("    this.decimatex = function(v) {"); nl();
        p("        ");
        for (i=0 ; i<decimation+1 ; i++) {
            p("d" + i + "=d" + (i+1) + "; ");
        }
        p("d" + (decimation+1) + "=v;"); nl();
        p("        if (++idx >= " + decimation + ") {"); nl();
        p("            idx = 0;"); nl();
        p("            var r = ");
        jsDecCalc(coeffs, ".r");
        p(";"); nl();
        p("            var i = ");
        jsDecCalc(coeffs, ".i");
        p(";"); nl();
        p("            this.value = { r:r, i:i };"); nl();
        p("            return true;"); nl();
        p("        } else {"); nl();
        p("            return false;"); nl();
        p("        }"); nl();
        p("    };"); nl();
        nl();
        
        /**
         * REAL INTERPOLATION
         */
        p("    this.interpolate = function(v, buf) {"); nl();
        p("        d0 = d1; d1 = d2; d2 = v;"); nl();
        for (var row = 0 ; row < decimation ; row++) {
            var rowarr = table[row];
            p("        buf[" + row + "] = ");
            if (Math.abs(arrsum(rowarr)) < 0.0001) {
                p("0");
            } else {
                jsIntCalc(rowarr, "");
            }
            p(";"); nl();
        }
        p("    };"); nl();
        nl();
        
       /**
         * COMPLEX INTERPOLATION
         */
        p("    this.interpolatex = function(v, buf) {"); nl();
        p("        d0 = d1; d1 = d2; d2 = v;"); nl();
        for (row = 0 ; row < decimation ; row++) {
            var rowarr2 = table[row];
            p("        buf[" + row + "] = ");
            if (Math.abs(arrsum(rowarr2)) < 0.0001) {
                p("{r:0,i:0};"); nl();
            } else {
                p("{"); nl();
                p("            r: ");
                jsIntCalc(rowarr2, ".r");
                p(","); nl();
                p("            i: ");
                jsIntCalc(rowarr2, ".r");
                nl();
                p("        };"); nl();
            }
        }
        p("    };"); nl();
        nl();
        
        //# END
        p("}"); nl();
        nl();
    
    }
    
    var header = javaHeader;
    var output = javaOutput;
    var footer = javaFooter;

    /* ####################################################################
    ##  M A I N
    #################################################################### */

    function makeWindow(size) {
        var w = new Array(size);
        for (var i=0 ; i<size ; i++) {
            w[i] = 0.5 - 0.5 * Math.cos(2.0 * Math.PI * i / (size - 1));  //Hann window
	    }
        return w;
    }
    
    var col = 0;
    function p(s) {
        process.stdout.write(s);
        col += s.length;
        if ((col > 65 && s=== " + ") || col>78) {
            nl();
            process.stdout.write("                ");
            col = 12;
        }
    }
    function nl() {
        process.stdout.write("\n");
        col = 0;
    }
    
    function showTable(table) {
        var len = table.length;
        p("=== decimation: " + len + "\n");
        for (var row=0 ; row<len ; row++) {
            for (var col=0 ; col< columns ; col++) {
                var v = table[row][col];
                var s = v.toFixed(5);
                var strlen = s.length;
                var fs = "                ".substring(0, 10-strlen) + s;
                p(fs);
                
            }
        p("\n");
        }
    
    }
    
    function decimationCoefficients(table) {
        var size = columns + table.length;
        var coeffs = new Array(size);
        for (var i=0 ; i<size ; i++) {
            coeffs[i] = 0.0;
        }
        for (var row = 0 ; row < table.length ; row++) {
            for (var col = 0 ; col < columns ; col++) {
                var idx = row + col;
                var v = table[row][col];
                //p("v:" + v.toFixed(5) + "\n");
                coeffs[idx] += v;
            }
         }
        return coeffs;
   }
   
    function arrsum(arr) {
        var sum = 0;
        for (var i=0 ; i<arr.length ; i++) {
            sum += arr[i];
        }
        return sum;
    }
    function generate(decimation) {
        
        // generate the normal FIR coefficients for the decimation
        var omega = Math.PI * 2.0 / decimation;
        var size = columns * decimation;
        var half = size>>1;
        var w = makeWindow(size);
        var sum = 0;
        var coeffs = new Array(size);
        for (var idx=0 ; idx < size ; idx++) {
            var i = idx - half;
            var coeff = (i === 0) ? omega / Math.PI : Math.sin(omega * i) / (Math.PI * i);
            sum += coeff;
            coeffs[idx] = coeff * w[idx];
        }
        
        //Normalize gain
        for (var ii=0 ; ii<size ; ii++) {
            coeffs[ii] /= sum;
        }
        
        /**
         * Now arrange into rows&columns for polyphase.
         * 0  4  8
         * 1  5  9
         * 2  6 10
         * 3  7 11
        */
        var table = new Array(decimation);
        for (var ij=0 ; ij<decimation ; ij++) {
            table[ij] = new Array(columns);
        }
        
        var cptr = 0;
        for (var col=0 ; col<columns ; col++) {
            for (var row=0 ; row<decimation ; row++) {
                table[row][col] = coeffs[cptr++];
            }
        }
        output(decimation, size, table);   
    }
    
    function doIt() {
    
        header();
        
        for (var decim=2 ; decim<=7 ; decim++) {
            generate(decim);
        }
        generate(11);
        
        footer();
    }
    
    this.doIt = doIt;

}

var ppg = new PpGen(3);
ppg.doIt();
