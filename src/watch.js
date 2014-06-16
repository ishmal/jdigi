/**
 * Jdigi
 *
 * Copyright 2014, Bob Jamison
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

var Digi  = require("./digi").Digi;


function Watcher(par) {
    "use strict";

    //This regex's groups are prefix, digit, suffix
    var prefix = "([A-Z]{1,2}|[0-9][A-Z]|[A-Z][0-9])";
    var digits = "([0-9])";
    var suffix = "(F[A-Z]{3}|[A-Z]{1,3})";  //note:  Fxxx is australian
    var call = prefix + digits + suffix;
    var spot = "[^a-zA-Z0-9]de\\s+(" + call + ")[^a-zA-Z0-9]";
    
    var buf = "";
    var calls = {};
    
    function announce(call) {
        var msg = call.ts.toUTCString() + " : " + call.call + " : " +
            call.freq + " : " + call.mode + "/" + call.rate;
        par.status(msg);
    }
    
    function check(call) {
        var csn = call.call;
        if (csn in calls) {
            var curr = calls[csn];
            var diff = call.ts.getTime() - curr.ts.getTime();
            if (diff > 300000) { //5 mins
                curr.ts = call.ts;
                announce(call);
            }
        } else {
            calls[csn] = call;
            announce(call);
        }
    
    }
    
    function searchBuffer(str) {
        var rgx = new RegExp(spot, "ig");
        var calls = {};
        for (var res=rgx.exec(str) ; res !== null ; res=rgx.exec(str)) {
            var mode = par.getMode();
            var name = mode.properties.name;
            var rate = mode.getRate();
            var call = {
                call   : res[1].toLowerCase(),
                prefix : res[2].toLowerCase(),
                digit  : res[3],
                suffix : res[4].toLowerCase(),
                freq   : par.getFrequency(),
                mode   : name,
                rate   : rate,
                ts     : new Date() //timestamp
            };
            check(call);
        }
        return calls;
    }
    
    this.update = function(str) {
        buf += str;
        searchBuffer(buf);
        var len = buf.length;
        if (len > 30) {
           buf = buf.substring(20, len);
        }
    
    };
}

module.exports.Watcher = Watcher;


