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
/* jslint node: true */
System.register(["./fsk"], function(exports_1) {
    "use strict";
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var fsk_1;
    var CrcTables, Crc, PacketAddr, Types, IFRAME, SFRAME, UFRAME, Packet, RxStart, RxTxd, RxData, RxFlag1, RxFlag2, FLAG, RXLEN, PacketMode;
    function trace(msg) {
        console.log(msg);
    }
    return {
        setters:[
            function (fsk_1_1) {
                fsk_1 = fsk_1_1;
            }],
        execute: function() {
            /**
             * CRC-CCITT-16 calculator, that handles both big and little-endian byte
             * streams
             */
            CrcTables = {
                crcTable: [
                    0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
                    0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
                    0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
                    0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
                    0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485,
                    0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
                    0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4,
                    0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
                    0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
                    0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
                    0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12,
                    0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
                    0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41,
                    0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
                    0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
                    0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
                    0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f,
                    0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
                    0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e,
                    0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
                    0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
                    0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
                    0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c,
                    0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
                    0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab,
                    0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
                    0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
                    0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
                    0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9,
                    0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
                    0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8,
                    0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
                ],
                crcTableLE: [
                    0x0000, 0x1189, 0x2312, 0x329b, 0x4624, 0x57ad, 0x6536, 0x74bf,
                    0x8c48, 0x9dc1, 0xaf5a, 0xbed3, 0xca6c, 0xdbe5, 0xe97e, 0xf8f7,
                    0x1081, 0x0108, 0x3393, 0x221a, 0x56a5, 0x472c, 0x75b7, 0x643e,
                    0x9cc9, 0x8d40, 0xbfdb, 0xae52, 0xdaed, 0xcb64, 0xf9ff, 0xe876,
                    0x2102, 0x308b, 0x0210, 0x1399, 0x6726, 0x76af, 0x4434, 0x55bd,
                    0xad4a, 0xbcc3, 0x8e58, 0x9fd1, 0xeb6e, 0xfae7, 0xc87c, 0xd9f5,
                    0x3183, 0x200a, 0x1291, 0x0318, 0x77a7, 0x662e, 0x54b5, 0x453c,
                    0xbdcb, 0xac42, 0x9ed9, 0x8f50, 0xfbef, 0xea66, 0xd8fd, 0xc974,
                    0x4204, 0x538d, 0x6116, 0x709f, 0x0420, 0x15a9, 0x2732, 0x36bb,
                    0xce4c, 0xdfc5, 0xed5e, 0xfcd7, 0x8868, 0x99e1, 0xab7a, 0xbaf3,
                    0x5285, 0x430c, 0x7197, 0x601e, 0x14a1, 0x0528, 0x37b3, 0x263a,
                    0xdecd, 0xcf44, 0xfddf, 0xec56, 0x98e9, 0x8960, 0xbbfb, 0xaa72,
                    0x6306, 0x728f, 0x4014, 0x519d, 0x2522, 0x34ab, 0x0630, 0x17b9,
                    0xef4e, 0xfec7, 0xcc5c, 0xddd5, 0xa96a, 0xb8e3, 0x8a78, 0x9bf1,
                    0x7387, 0x620e, 0x5095, 0x411c, 0x35a3, 0x242a, 0x16b1, 0x0738,
                    0xffcf, 0xee46, 0xdcdd, 0xcd54, 0xb9eb, 0xa862, 0x9af9, 0x8b70,
                    0x8408, 0x9581, 0xa71a, 0xb693, 0xc22c, 0xd3a5, 0xe13e, 0xf0b7,
                    0x0840, 0x19c9, 0x2b52, 0x3adb, 0x4e64, 0x5fed, 0x6d76, 0x7cff,
                    0x9489, 0x8500, 0xb79b, 0xa612, 0xd2ad, 0xc324, 0xf1bf, 0xe036,
                    0x18c1, 0x0948, 0x3bd3, 0x2a5a, 0x5ee5, 0x4f6c, 0x7df7, 0x6c7e,
                    0xa50a, 0xb483, 0x8618, 0x9791, 0xe32e, 0xf2a7, 0xc03c, 0xd1b5,
                    0x2942, 0x38cb, 0x0a50, 0x1bd9, 0x6f66, 0x7eef, 0x4c74, 0x5dfd,
                    0xb58b, 0xa402, 0x9699, 0x8710, 0xf3af, 0xe226, 0xd0bd, 0xc134,
                    0x39c3, 0x284a, 0x1ad1, 0x0b58, 0x7fe7, 0x6e6e, 0x5cf5, 0x4d7c,
                    0xc60c, 0xd785, 0xe51e, 0xf497, 0x8028, 0x91a1, 0xa33a, 0xb2b3,
                    0x4a44, 0x5bcd, 0x6956, 0x78df, 0x0c60, 0x1de9, 0x2f72, 0x3efb,
                    0xd68d, 0xc704, 0xf59f, 0xe416, 0x90a9, 0x8120, 0xb3bb, 0xa232,
                    0x5ac5, 0x4b4c, 0x79d7, 0x685e, 0x1ce1, 0x0d68, 0x3ff3, 0x2e7a,
                    0xe70e, 0xf687, 0xc41c, 0xd595, 0xa12a, 0xb0a3, 0x8238, 0x93b1,
                    0x6b46, 0x7acf, 0x4854, 0x59dd, 0x2d62, 0x3ceb, 0x0e70, 0x1ff9,
                    0xf78f, 0xe606, 0xd49d, 0xc514, 0xb1ab, 0xa022, 0x92b9, 0x8330,
                    0x7bc7, 0x6a4e, 0x58d5, 0x495c, 0x3de3, 0x2c6a, 0x1ef1, 0x0f78
                ]
            };
            Crc = (function () {
                function Crc() {
                    this.reset();
                }
                Crc.prototype.update = function (c) {
                    var table = CrcTables.crcTable;
                    var crc = this._crc;
                    var j = (c ^ (crc >> 8)) & 0xff;
                    this._crc = table[j] ^ (crc << 8);
                };
                Crc.prototype.value = function () {
                    return (this._crc ^ 0) & 0xffff;
                };
                Crc.prototype.updateLE = function (c) {
                    var table = CrcTables.crcTableLE;
                    var crc = this._crc;
                    this._crc = ((crc >> 8) ^ table[(crc ^ c) & 0xff]) & 0xffff;
                };
                Crc.prototype.valueLE = function () {
                    return this._crc;
                };
                Crc.prototype.reset = function () {
                    this._crc = 0xffff;
                };
                return Crc;
            }());
            PacketAddr = (function () {
                function PacketAddr(call, ssid) {
                    this._call = call;
                    this._ssid = ssid;
                    this._add = null;
                }
                PacketAddr.prototype.encoded = function () {
                    var add = this._add;
                    if (add === null) {
                        var call = this._call;
                        var newadd = new Array(7);
                        var len = call.length;
                        for (var i = 0; i < 7; i++) {
                            if (i < len)
                                newadd[i] = (parseInt(call[i]) << 1);
                            else if (i == 6)
                                newadd[i] = (0x60 | (this._ssid << 1));
                            else
                                newadd[i] = 0x40; // shifted space
                        }
                        this._add = newadd.toString();
                    }
                    return add;
                };
                PacketAddr.fromData = function (arr, offset) {
                    var buf = "";
                    var bytes = arr.slice(offset, offset + 6).map(function (v) {
                        return v >> 1;
                    });
                    var call = String.fromCharCode.apply(null, bytes).trim();
                    var ssid = (arr[offset + 6] >> 1) & 0xf;
                    return new PacketAddr(call, ssid);
                };
                PacketAddr.prototype.toString = function () {
                    return (this._ssid >= 0) ? this._call + "-" + this._ssid : this._call;
                };
                return PacketAddr;
            }());
            Types = {
                PID_X25: 0x01,
                PID_TCPIP_COMP: 0x06,
                PID_TCPIP_UNCOMP: 0x07,
                PID_FRAG: 0x08,
                PID_AX25_FLAG1: 0x10,
                PID_AX25_FLAG2: 0x20,
                PID_AX25_MASK: 0x30,
                PID_TEXNET: 0xc3,
                PID_LQP: 0xc4,
                PID_APPLETALK: 0xca,
                PID_APPLETALK_ARP: 0xcb,
                PID_ARPA_IP: 0xcc,
                PID_ARPA_ARP: 0xcd,
                PID_FLEXNET: 0xce,
                PID_NETROM: 0xcf,
                PID_NO_3: 0xf0,
                PID_ESCAPE: 0xff,
                /**
                 * Frame identifiers
                 */
                FID_NONE: 0,
                FID_C: 1,
                FID_SABM: 2,
                FID_D: 3,
                FID_DISC: 4,
                FID_I: 5,
                FID_RR: 6,
                FID_RNR: 7,
                FID_NR: 8,
                FID_RJ: 9,
                FID_REJ: 10,
                FID_FRMR: 11,
                FID_UI: 12,
                FID_DM: 13,
                IFRAME: 0,
                SFRAME: 1,
                UFRAME: 2
            };
            IFRAME = 0;
            SFRAME = 1;
            UFRAME = 2;
            Packet = (function () {
                function Packet(dest, src, rpts, ctrl, pid, info) {
                    this._dest = dest;
                    this._src = src;
                    this._rpts = rpts;
                    this._ctrl = ctrl;
                    this._pid = pid;
                    this._info = info;
                }
                Packet.prototype.toOctets = function () {
                    var buf = [];
                    buf[buf.length] = 0x7e; // flag
                    buf = buf.concat(this._dest.encoded());
                    buf = buf.concat(this._src.encoded());
                    for (var ridx = 0; ridx < this._rpts.length; ridx++) {
                        buf = buf.concat(this._rpts[ridx].encoded());
                    }
                    buf[buf.length] = this._ctrl;
                    buf[buf.length] = this._pid;
                    var info = this._info;
                    var ilen = info.length;
                    for (var iidx = 0; iidx < ilen; iidx++) {
                        buf[buf.length] = info[iidx];
                    }
                    var crc = new Crc();
                    for (var bidx = 0; bidx < buf.length; bidx++) {
                        crc.update(buf[bidx]);
                    }
                    var crcv = crc.value();
                    var fcslo = (crcv & 0xff) ^ 0xff;
                    var fcshi = (crcv >> 8) ^ 0xff;
                    buf[buf.length] = fcslo;
                    buf[buf.length] = fcshi;
                    buf[buf.length] = 0x7e; // flag
                    return buf;
                };
                Packet.create = function (data) {
                    var pos = 0;
                    var dest = null; //FIXME this.getAddr(data, pos);
                    pos += 7;
                    var src = null; //FIXME this.getAddr(data, pos);
                    pos += 7;
                    var rpts = [];
                    //println("lastbyte:"+data(pos-1))
                    while (rpts.length < 8 && pos < data.length - 7 && ((data[pos - 1] & 128) !== 0)) {
                        // FIXME rpts[rpts.length] = getAddr(data, pos);
                        pos += 7;
                    }
                    var ctrl = data[pos++];
                    var typ = ((ctrl & 1) === 0) ? IFRAME : ((ctrl & 2) === 0) ? SFRAME : UFRAME;
                    var pid = (typ === IFRAME) ? data[pos] : 0;
                    if (typ === IFRAME)
                        pos++;
                    var info = data.slice(pos, data.length);
                    return new Packet(dest, src, rpts, 0, 0, info);
                };
                Packet.prototype.toString = function () {
                    var buf = this._src.toString() + "=>" + this._dest.toString();
                    var r = this._rpts;
                    var len = r.length;
                    for (var ridx = 0; ridx < len; ridx++) {
                        buf += ":";
                        buf += r.toString();
                    }
                    buf += " [" + this._pid.toString() + "]: ";
                    if (this._pid !== 0) {
                        buf += String.fromCharCode.apply(null, this._info);
                    }
                    else {
                        //for (v <- info)
                        //    buf.append(",").append(v.toString)
                        buf += "{" + this._info[0] + "," + this._info.length + "}";
                        buf += String.fromCharCode.apply(null, this._info);
                    }
                    return buf;
                };
                return Packet;
            }());
            RxStart = 0; //the initial state
            RxTxd = 1; //after the first flag, wait until no more flags
            RxData = 2; //after the flag.  all octets until another flag
            RxFlag1 = 3; //Test whether we have a flag or a stuffed bit
            RxFlag2 = 4; //It was a flag.  grab the last bit
            FLAG = 0x7e; // 01111110 , the start/stop flag
            RXLEN = 4096;
            /**
             * Mode for AX-25 packet communications.
             *
             * Note:  apparently 4800s/s seems to be necessary for this to work on 1200baud
             *
             * @see http://www.tapr.org/pub_ax25.html
             */
            PacketMode = (function (_super) {
                __extends(PacketMode, _super);
                function PacketMode(par) {
                    _super.call(this, par, PacketMode.props);
                    this.shift = 200.0;
                    this.rate = 300.0;
                    this._state = RxStart;
                    this._bitcount = 0;
                    this._octet = 0;
                    this._ones = 0;
                    this._bufPtr = 0;
                    this._rxbuf = new Array(RXLEN);
                    this._lastBit = false;
                }
                PacketMode.props = function (self) {
                    return {
                        name: "packet",
                        tooltip: "AX.25 and APRS",
                        controls: [
                            {
                                name: "rate",
                                type: "choice",
                                tooltip: "packet data rate",
                                get value() {
                                    return self.rate;
                                },
                                set value(v) {
                                    self.rate = parseFloat(v);
                                },
                                values: [
                                    { name: "300", value: 300.0 },
                                    { name: "1200", value: 1200.0 }
                                ]
                            },
                            {
                                name: "shift",
                                type: "choice",
                                tooltip: "frequency distance between mark and space",
                                get value() {
                                    return self.shift;
                                },
                                set value(v) {
                                    self.shift = parseFloat(v);
                                },
                                values: [
                                    { name: "200", value: 200.0 },
                                    { name: "1000", value: 1000.0 }
                                ]
                            }
                        ]
                    };
                };
                /**
                 * Attempt to decode a packet.  It will be in NRZI form, so when
                 * we sample at mid-pulse (period == halflen) we need to sense then
                 * if the bit has flipped or not.  Do -not- check this for every sample.
                 * the packet will be in the form:
                 * 01111110 76543210 76543210 76543210 01234567 01234567 01111110
                 *   flag    octet     octet   octet    fcs_hi   fcs_lo    flag
                 */
                PacketMode.prototype.processBit = function (inBit) {
                    if (!this.isMiddleBit(inBit)) {
                        return;
                    }
                    //shift right for the next bit, since ax.25 is lsb-first
                    var octet = (this._octet >> 1) & 0x7f; //0xff? we dont want the msb
                    this._octet = octet;
                    var bit = (inBit === this._lastBit); //google "nrzi"
                    this._lastBit = inBit;
                    if (bit) {
                        this._ones += 1;
                        octet |= 128;
                    }
                    else
                        this._ones = 0;
                    switch (this._state) {
                        case RxStart:
                            //trace("RxStart");
                            //trace("st octet: %02x".format(octet));
                            if (octet === FLAG) {
                                this._state = RxTxd;
                                this._bitcount = 0;
                            }
                            break;
                        case RxTxd:
                            //trace("RxTxd");
                            if (++this._bitcount >= 8) {
                                //trace("txd octet: %02x".format(octet));
                                this._bitcount = 0;
                                if (octet !== FLAG) {
                                    this._state = RxData;
                                    this._rxbuf[0] = octet & 0xff;
                                    this._bufPtr = 1;
                                }
                            }
                            break;
                        case RxData:
                            //trace("RxData");
                            if (this._ones === 5) {
                                this._state = RxFlag1;
                            }
                            else {
                                if (++this._bitcount >= 8) {
                                    this._bitcount = 0;
                                    if (this._bufPtr >= RXLEN) {
                                        //trace("drop")
                                        this._state = RxStart;
                                    }
                                    else {
                                        this._rxbuf[this._bufPtr++] = octet & 0xff;
                                    }
                                }
                            }
                            break;
                        case RxFlag1:
                            //trace("RxFlag");
                            if (bit) {
                                this._state = RxFlag2;
                            }
                            else {
                                octet = (octet << 1) & 0xfe;
                                this._state = RxData;
                            }
                            break;
                        case RxFlag2:
                            //we simply wanted that last bit
                            this.processPacket(this._rxbuf, this._bufPtr);
                            for (var rdx = 0; rdx < RXLEN; rdx++)
                                this._rxbuf[rdx] = 0;
                            this._state = RxStart;
                            break;
                        default:
                    } //switch
                };
                PacketMode.prototype.rawPacket = function (ibytes, offset, len) {
                    var str = "";
                    for (var i = 0; i < len; i++) {
                        var b = (ibytes[offset + i]); // >> 1;
                        str += String.fromCharCode(b);
                    }
                    return str;
                };
                PacketMode.prototype.processPacket = function (data, len) {
                    //trace("raw:" + len)
                    if (len < 14)
                        return true;
                    var str = this.rawPacket(data, 14, len - 2);
                    trace("txt: " + str);
                    var crc = new Crc();
                    for (var i = 0; i < len; i++) {
                        crc.updateLE(data[i]);
                    }
                    var v = crc.valueLE();
                    trace("crc: " + v.toString(16));
                    //theory is, if you calculate the CRC of the data, -including- the crc field,
                    //a correct result will always be 0xf0b8
                    if (v === 0xf0b8) {
                        var p = Packet.create(data);
                        this.par.putText(p.toString() + "\n");
                    }
                    return true;
                };
                return PacketMode;
            }(fsk_1.FskBase));
            exports_1("Crc", Crc);
            exports_1("PacketMode", PacketMode);
        }
    }
});
//# sourceMappingURL=packet.js.map