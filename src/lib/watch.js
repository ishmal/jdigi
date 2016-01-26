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
System.register([], function(exports_1) {
    "use strict";
    var Watcher;
    return {
        setters:[],
        execute: function() {
            /**
             * @param par Digi
             */
            Watcher = (function () {
                function Watcher(par) {
                    this.par = par;
                    //This regex's groups are prefix, digit, suffix
                    this.prefix = "([A-Z]{1,2}|[0-9][A-Z]|[A-Z][0-9])";
                    this.digits = "([0-9])";
                    this.suffix = "(F[A-Z]{3}|[A-Z]{1,3})"; //note:  Fxxx is australian
                    this.call = this.prefix + this.digits + this.suffix;
                    this.spot = "[^a-z0-9](?:de|cq)\\s+(" + this.call + ")[^a-z0-9]";
                    //var spot2 = "\\s+(" + call + ")\\s+[Kk]\\s";
                    //var spot3 = "\\s+(" + call + ")\\s+[Cc][Qq]";
                    //var spot = spot1 + "|" + spot2 + "|" + spot3;
                    this.buf = "";
                    this.calls = {};
                    this.useQrz = false;
                    this.timeout = 300000; //5 mins
                }
                Watcher.prototype.showQrz = function (call) {
                    if (this.useQrz)
                        window.open("http://qrz.com/db/" + call, "qrzquery", "menubar=true,toolbar=true");
                };
                Watcher.prototype.announce = function (call) {
                    var msg = call.ts.toUTCString() + " : " + call.call + " : " +
                        call.freq + " : " + call.mode + "/" + call.rate;
                    this.par.status(msg);
                    this.showQrz(call.call);
                };
                Watcher.prototype.check = function (call) {
                    var csn = call.call;
                    if (csn in this.calls) {
                        var curr = this.calls[csn];
                        var diff = call.ts.getTime() - curr.ts.getTime();
                        if (diff > this.timeout) {
                            curr.ts = call.ts;
                            this.announce(call);
                        }
                    }
                    else {
                        this.calls[csn] = call;
                        this.announce(call);
                    }
                };
                Watcher.prototype.searchBuffer = function (str) {
                    var rgx = new RegExp(this.spot, "ig");
                    for (var res = rgx.exec(str); res !== null; res = rgx.exec(str)) {
                        var mode = this.par.mode;
                        var name_1 = mode.properties.name;
                        var rate = mode.rate;
                        var call = {
                            call: res[1].toLowerCase(),
                            prefix: res[2].toLowerCase(),
                            digit: res[3],
                            suffix: res[4].toLowerCase(),
                            freq: this.par.frequency,
                            mode: name_1,
                            rate: rate,
                            ts: new Date() //timestamp
                        };
                        this.check(call);
                    }
                };
                Watcher.prototype.update = function (str) {
                    this.buf += str;
                    this.searchBuffer(this.buf);
                    var len = this.buf.length;
                    if (len > 30) {
                        this.buf = this.buf.substring(20, len);
                    }
                };
                return Watcher;
            }());
            exports_1("Watcher", Watcher);
        }
    }
});
//# sourceMappingURL=watch.js.map