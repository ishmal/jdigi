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

/**
 * @param par Digi
 */
class Watcher {

    constructor(par) {
        this.par = par;

        //This regex's groups are prefix, digit, suffix
        this.prefix = "([A-Z]{1,2}|[0-9][A-Z]|[A-Z][0-9])";
        this.digits = "([0-9])";
        this.suffix = "(F[A-Z]{3}|[A-Z]{1,3})";  //note:  Fxxx is australian
        this.call = prefix + digits + suffix;
        this.spot = "[^a-z0-9](?:de|cq)\\s+(" + call + ")[^a-z0-9]";
        //var spot2 = "\\s+(" + call + ")\\s+[Kk]\\s";
        //var spot3 = "\\s+(" + call + ")\\s+[Cc][Qq]";
        //var spot = spot1 + "|" + spot2 + "|" + spot3;
        this.buf = "";
        this.calls = {};

        this.useQrz = false;

        this.timeout = 300000; //5 mins
    }


    showQrz(call) {
        if (this.useQrz)
            window.open("http://qrz.com/db/" + call,
                "qrzquery", "menubar=true,toolbar=true");
    }

    announce(call) {
        let msg = call.ts.toUTCString() + " : " + call.call + " : " +
            call.freq + " : " + call.mode + "/" + call.rate;
        this.par.status(msg);
        this.showQrz(call.call);
    }

    check(call) {
        let csn = call.call;
        if (csn in this.calls) {
            let curr = this.calls[csn];
            let diff = call.ts.getTime() - curr.ts.getTime();
            if (diff > this.timeout) {
                curr.ts = call.ts;
                this.announce(call);
            }
        } else {
            this.calls[csn] = call;
            this.announce(call);
        }
    }

    searchBuffer(str) {
        let rgx = new RegExp(spot, "ig");
        for (let res = rgx.exec(str); res !== null; res = rgx.exec(str)) {
            let mode = this.par.getMode();
            let name = mode.properties.name;
            let rate = mode.getRate();
            let call = {
                call: res[1].toLowerCase(),
                prefix: res[2].toLowerCase(),
                digit: res[3],
                suffix: res[4].toLowerCase(),
                freq: par.getFrequency(),
                mode: name,
                rate: rate,
                ts: new Date() //timestamp
            };
            this.check(call);
        }
    }

    update(str) {
        this.buf += str;
        this.searchBuffer(this.buf);
        let len = this.buf.length;
        if (len > 30) {
            this.buf = this.buf.substring(20, len);
        }
    }
}

export {Watcher};



