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

import {FskBase} from "./fsk";
import {Biquad,FIR} from "../filter";

/**
 * CRC-CCITT-16 calculator, that handles both big and little-endian byte
 * streams
 */
const CrcTables = {

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


class Crc {

    constructor() {
        this.reset();
    }

    update(c) {
        let table = CrcTables.crcTable;
        let crc = this.crc;
        let j = (c ^ (crc >> 8)) & 0xff;
        this.crc = table[j] ^ (crc << 8);
    }

    value() {
        return (this.crc ^ 0) & 0xffff;
    }

    updateLE(c) {
        let table = CrcTables.crcTableLE;
        let crc = this.crc;
        this.crc = ((crc >> 8) ^ table[(crc ^ c) & 0xff]) & 0xffff;
    }

    valueLE() {
        return this.crc;
    }

    reset() {
        this.crc = 0xffff;
    }
}


class PacketAddr {

    constructor(call, ssid) {
        this.call = call;
        this.ssid = ssid;
        this.add = null;
    }

    encoded() {
        let add = this.add;
        if (add === null) {
            let call = this.call;
            add = new Array(7);
            let len = call.length;
            for (let i = 0; i < 7; i++) {
                if (i < len)
                    add[i] = ((call[i].toInt) << 1);
                else if (i == 6)
                    add[i] = (0x60 | (this.ssid << 1));
                else
                    add[i] = 0x40;   // shifted space
            }
            this.add = add;
        }
        return add;
    }

    static fromData(arr, offset) {
        let buf = "";
        let bytes = arr.slice(offset, offset + 6).map(function (v) {
            return v >> 1;
        });
        let call = String.fromCharCode.apply(null, bytes).trim();
        let ssid = (arr[offset + 6] >> 1) & 0xf;
        return new PacketAddr(call, ssid);
    }


    toString() {
        return (this.ssid >= 0) ? this.call + "-" + this.ssid : this.call;
    }

}


const Types = {
    PID_X25: 0x01,  // ISO 8208/CCITT X.25 PLP
    PID_TCPIP_COMP: 0x06,  // Compressed TCP/IP packet. Van Jacobson (RFC 1144)
    PID_TCPIP_UNCOMP: 0x07,  // Uncompressed TCP/IP packet. Van Jacobson (RFC 1144)
    PID_FRAG: 0x08,  // Segmentation fragment
    PID_AX25_FLAG1: 0x10,  // AX.25 layer 3 implemented.
    PID_AX25_FLAG2: 0x20,  // AX.25 layer 3 implemented.
    PID_AX25_MASK: 0x30,  // AX.25 layer 3 implemented.
    PID_TEXNET: 0xc3,  // TEXNET datagram protocol
    PID_LQP: 0xc4,  // Link Quality Protocol
    PID_APPLETALK: 0xca,  // Appletalk
    PID_APPLETALK_ARP: 0xcb,  // Appletalk ARP
    PID_ARPA_IP: 0xcc,  // ARPA Internet Protocol
    PID_ARPA_ARP: 0xcd,  // ARPA Address Resolution
    PID_FLEXNET: 0xce,  // FlexNet
    PID_NETROM: 0xcf,  // NET/ROM
    PID_NO_3: 0xf0,  // No layer 3 protocol implemented.
    PID_ESCAPE: 0xff,  // Escape character. Next octet contains more Level 3 protocol information.

    /**
     * Frame identifiers
     */
    FID_NONE: 0,  // Not an ID
    FID_C: 1,  // Layer 2 Connect Request
    FID_SABM: 2,  // Layer 2 Connect Request
    FID_D: 3,  // Layer 2 Disconnect Request
    FID_DISC: 4,  // Layer 2 Disconnect Request
    FID_I: 5,  // Information frame
    FID_RR: 6,  // Receive Ready. System Ready To Receive
    FID_RNR: 7,  // Receive Not Ready. TNC Buffer Full
    FID_NR: 8,  // Receive Not Ready. TNC Buffer Full
    FID_RJ: 9,  // Reject Frame. Out of Sequence or Duplicate
    FID_REJ: 10,  // Reject Frame. Out of Sequence or Duplicate
    FID_FRMR: 11,  // Frame Reject. Fatal Error
    FID_UI: 12,  // Unnumbered Information Frame. "Unproto"
    FID_DM: 13,  // Disconnect Mode. System Busy or Disconnected.

    IFRAME: 0,
    SFRAME: 1,
    UFRAME: 2
};


class Packet {

    constructor(dest, src, rpts, ctrl, pid, info) {
        this.dest = dest;
        this.src = src;
        this.rpts = rpts;
        this.ctrl = ctrl;
        this.pid = pid;
        this.info = info;
    }

    toOctets() {
        let buf = [];
        buf[buf.length] = 0x7e; // flag
        buf = buf.concat(this.dest.encoded());
        buf = buf.concat(this.src.encoded());
        for (let ridx = 0; ridx < this.rpts.length; ridx++) {
            buf = buf.concat(this.rpts[ridx].encoded());
        }
        buf[buf.length] = this.ctrl;
        buf[buf.length] = this.pid;
        let ilen = info.length;
        for (let iidx = 0; iidx < ilen; iidx++) {
            buf[buf.length] = info[iidx];
        }
        let crc = new Crc();
        for (let bidx = 0; bidx < buf.length; bidx++) {
            crc.update(buf[bidx]);
        }
        let crcv = crc.value();
        let fcslo = (crcv & 0xff) ^ 0xff;
        let fcshi = (crcv >> 8) ^ 0xff;
        buf[buf.length] = fcslo;
        buf[buf.length] = fcshi;
        buf[buf.length] = 0x7e; // flag
        return buf;
    }

    static create() {
        var pos = 0;
        var dest = getAddr(data, pos);
        pos += 7;
        var src = getAddr(data, pos);
        pos += 7;
        var rpts = [];
        //println("lastbyte:"+data(pos-1))
        while (rpts.length < 8 && pos < data.length - 7 && ((data[pos - 1] & 128) !== 0)) {
            rpts[rpts.length] = getAddr(data, pos);
            pos += 7;
        }

        var ctrl = data[pos++];

        var typ = ((ctrl & 1) === 0) ? IFRAME : ((ctrl & 2) === 0) ? SFRAME : UFRAME;

        var pid = (typ === IFRAME) ? data[pos] : 0;
        if (typ === IFRAME) pos++;

        var info = data.slice(pos, data.length);

        return new Packet(dest, src, rpts, 0, 0, info);
    }

    toString() {
        let buf = src.toString() + "=>" + dest.toString();

        let len = rpts.length;
        for (let ridx = 0; ridx < len; ridx++) {
            buf += ":";
            buf += r.toString();
        }
        buf += " [" + pid.toString() + "]: ";
        if (pid !== 0) {
            buf += String.fromCharCode.apply(null, info);
        } else {
            //for (v <- info)
            //    buf.append(",").append(v.toString)
            buf += "{" + info(0) + "," + info.size + "}";
            buf += String.fromCharCode.apply(null, info);
        }
        return buf;
    }

}


function trace(msg) {
    console.log(msg);
}


const RxStart = 0;  //the initial state
const RxTxd = 1;  //after the first flag, wait until no more flags
const RxData = 2;  //after the flag.  all octets until another flag
const RxFlag1 = 3;  //Test whether we have a flag or a stuffed bit
const RxFlag2 = 4;  //It was a flag.  grab the last bit
const FLAG = 0x7e;   // 01111110 , the start/stop flag
const RXLEN = 4096;


/**
 * Mode for AX-25 packet communications.
 *
 * Note:  apparently 4800s/s seems to be necessary for this to work on 1200baud
 *
 * @see http://www.tapr.org/pub_ax25.html
 */
class PacketMode extends FskBase {

    static props(self) {
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
                        {name: "300", value: 300.0},
                        {name: "1200", value: 1200.0}
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
                        {name: "200", value: 200.0},
                        {name: "1000", value: 1000.0}
                    ]
                }
            ]
        };
    }

    constructor(par) {
        super(par, PacketMode.props, 4800.0);
        this.shift = 200.0;
        this.rate = 300.0;
        this.state = RxStart;
        this.bitcount = 0;
        this.octet = 0;
        this.ones = 0;
        this.bufPtr = 0;
        this.rxbuf = new Array(RXLEN);
        this.lastBit = false;
    }


    /**
     * Attempt to decode a packet.  It will be in NRZI form, so when
     * we sample at mid-pulse (period == halflen) we need to sense then
     * if the bit has flipped or not.  Do -not- check this for every sample.
     * the packet will be in the form:
     * 01111110 76543210 76543210 76543210 01234567 01234567 01111110
     *   flag    octet     octet   octet    fcs_hi   fcs_lo    flag
     */
    processBit(inBit) {

        if (!this.isMiddleBit(inBit)) {
            return;
        }

        //shift right for the next bit, since ax.25 is lsb-first
        let octet = (this.octet >> 1) & 0x7f;  //0xff? we dont want the msb
        this.octet = octet;
        let bit = (inBit === this.lastBit); //google "nrzi"
        this.lastBit = inBit;
        if (bit) {
            this.ones += 1;
            octet |= 128;
        }
        else
            this.ones = 0;

        switch (this.state) {

            case RxStart :
                //trace("RxStart");
                //trace("st octet: %02x".format(octet));
                if (octet === FLAG) {
                    this.state = RxTxd;
                    this.bitcount = 0;
                }
                break;

            case RxTxd :
                //trace("RxTxd");
                if (++this.bitcount >= 8) {
                    //trace("txd octet: %02x".format(octet));
                    this.bitcount = 0;
                    if (octet !== FLAG) {
                        this.state = RxData;
                        this.rxbuf[0] = octet & 0xff;
                        this.bufPtr = 1;
                    }
                }
                break;

            case RxData :
                //trace("RxData");
                if (this.ones === 5) { // 111110nn, next bit will determine
                    this.state = RxFlag1;
                } else {
                    if (++this.bitcount >= 8) {
                        this.bitcount = 0;
                        if (this.bufPtr >= RXLEN) {
                            //trace("drop")
                            this.state = RxStart;
                        } else {
                            this.rxbuf[this.bufPtr++] = octet & 0xff;
                        }
                    }
                }
                break;

            case RxFlag1 :
                //trace("RxFlag");
                if (bit) { //was really a 6th bit.
                    this.state = RxFlag2;
                } else { //was a zero.  drop it and continue
                    octet = (octet << 1) & 0xfe;
                    this.state = RxData;
                }
                break;

            case RxFlag2 :
                //we simply wanted that last bit
                this.processPacket(this.rxbuf, this.bufPtr);
                for (let rdx = 0; rdx < RXLEN; rdx++)
                    this.rxbuf[rdx] = 0;
                this.state = RxStart;
                break;

            default :
            //dont know

        }//switch
    }


    rawPacket(ibytes, offset, len) {
        let str = "";
        for (let i = 0; i < len; i++) {
            let b = (ibytes[offset + i]); // >> 1;
            str += String.fromCharCode(b);
        }
        return str;
    }

    processPacket(data, len) {

        //trace("raw:" + len)
        if (len < 14)
            return true;
        let str = this.rawPacket(data, 14, len - 2);
        trace("txt: " + str);
        let crc = new Crc();
        for (let i = 0; i < len; i++) {
            crc.updateLE(data[i]);
        }
        let v = crc.valueLE();
        trace("crc: " + v.toString(16));
        //theory is, if you calculate the CRC of the data, -including- the crc field,
        //a correct result will always be 0xf0b8
        if (v === 0xf0b8) {
            let p = Packets.create(data);
            this.par.puttext(p.toString() + "\n");
        }
        return true;
    }

    /*
     //################################################
     //# T R A N S M I T
     //################################################
     private var txShifted = false
     def txencode(str: String) : Seq[Int] =
     {
     var buf = scala.collection.mutable.ListBuffer[Int]()
     for (c <- str)
     {
     if (c == ' ')
     buf += Baudot.BAUD_SPACE
     else if (c == '\n')
     buf += Baudot.BAUD_LF
     else if (c == '\r')
     buf += Baudot.BAUD_CR
     else
     {
     var uc = c.toUpper
     var code = Baudot.baudLtrsToCode.get(uc)
     if (code.isDefined)
     {
     if (txShifted)
     {
     txShifted = false
     buf += Baudot.BAUD_LTRS
     }
     buf += code.get
     }
     else
     {
     code = Baudot.baudFigsToCode.get(uc)
     if (code.isDefined)
     {
     if (!txShifted)
     {
     txShifted = true
     buf += Baudot.BAUD_FIGS
     }
     buf += code.get
     }
     }
     }
     }
     buf.toSeq
     }

     def txnext : Seq[Int] =
     {
     //var str = "the quick brown fox 1a2b3c4d"
     var str = par.gettext
     var codes = txencode(str)
     codes
     }


     private var desiredOutput = 4096;

     /o*
     * Overridden from Mode.  This method is called by
     * the audio interface when it needs a fresh buffer
     * of sampled audio data at its sample rate.  If the
     * mode has no current data, then it should send padding
     * in the form of what is considered to be an "idle" signal
     o/
     override def transmit : Option[Array[Complex]] =
     {
     var symbollen = samplesPerSymbol.toInt
     var buf = scala.collection.mutable.ListBuffer[Complex]()
     var codes = txnext
     for (code <- codes)
     {
     for (i <- 0 until symbollen) buf += spaceFreq
     var mask = 1
     for (i <- 0 until 5)
     {
     var bit = (code & mask) == 0
     var f = if (bit) spaceFreq else markFreq
     for (j <- 0 until symbollen) buf += f
     mask <<= 1
     }
     for (i <- 0 until symbollen) buf += spaceFreq
     }

     var pad = desiredOutput - buf.size
     for (i <- 0 until pad)
     buf += spaceFreq
     //var res = buf.toArray.map(txFilter.update)
     None
     }

     */

}

export {Crc,PacketMode};
