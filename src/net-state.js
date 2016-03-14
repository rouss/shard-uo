"use strict";

var uuid = require("uuid"),
    PacketBuffer = require("./packet-buffer"),
    packets = require("./packets");

/** Represents the state of a connected UOP client.
 * 
 * @class NetState
 * 
 * @param {Object} socket A net.Socket object representing the connection
 * @param {UOPEndpoint} parent The endpoint responsible for this NetState
 */
function NetState(socket, parent) {
    /// The net.Socket this client is connected through
    this.socket = socket;
    /// The {@link UOPEndpoint} responsible for this NetState
    this.parent = parent;
    /// The input packet buffer
    this.inbuf = new PacketBuffer();
    /// The output packet buffer
    this.outbuf = new PacketBuffer();
    /// The current incomming packet, if null a new packet header is expected
    this.packet = null;
    /// The unique ID of this NetState
    this.uuid = uuid.v4();
}

/** Called by the parent {@link UOPEndpoint} every time there is data pending
 * in the input buffer.
 * 
 * @param {Buffer} buf The Buffer object with pending data
 */
NetState.prototype.handleData = function handleData(buf) {
    this.inbuf.append(buf);
    while(true) {
        if(this.inbuf.length() <= 0) {
            break;
        }
        if(this.packet === null && this.inbuf.length() > 0) {
            var id = this.inbuf.readUInt8();
            try {
                this.packet = packets.createById(id);                
            }
            catch(e) {
                log.error("Unsupported packet 0x" + id.toHex(2));
            }
            if(this.packet === null) {
                this.parent.disconnect(this);
                return;
            }
            this.packet.netState = this;
        }
        if(this.packet === null) {
            break;
        }
        this.packet.decode(this.inbuf);
        if(this.packet.decoded) {
            this.parent.queuePacket(this.packet);
            this.packet = null;
        }
        else {
            break;
        }
    }
};

/** Call this to send a packet object to the connected client.
 * 
 * @param {Packet} packet The packet object to send to the client
 */
NetState.prototype.sendPacket = function(packet) {
    if(this.socket === null) {
        return;
    }
    packet.netState = this;
    packet.encode(this.outbuf);
    this.socket.write(this.outbuf.activeSlice());
    this.outbuf.clear();
};


/** Disconnect a NetState from its parent.
 */
NetState.prototype.disconnect = function() {
    if(this.parent) {
        this.parent.disconnect(this);
    }
};

module.exports = NetState;
