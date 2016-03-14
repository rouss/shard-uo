"use strict";

var Packet = require("./packet"),
    util = require("util");

/** The base class for fixed-length packets.
 * 
 * @constructor
 * @extends Packet
 */
function FixedPacket() {
    Packet.call(this);
    /// The fixed length of the packet minus the leading ID byte
    this.length = 0;
}
util.inherits(FixedPacket, Packet);

/** Called to decode a portion of the packet from an input buffer. Invokes
 * FixedPacket#fixedDecode when there is sufficient data available in the input
 * buffer to decode the packet in full.
 * 
 * @param {PacketBuffer} buf The input buffer
 */
FixedPacket.prototype.decode = function(buf) {
    if(buf.length() >= this.length) {
        this.fixedDecode(buf);
        this.decoded = true;
    }
};

/** Must be overriden in the derived class. Called when there is sufficient data
 * available in the buffer to decode the packet in full. The leading ID byte
 * will not be present.
 * 
 * @param {PacketBuffer} buf The input buffer
 */
FixedPacket.prototype.fixedDecode = function(buf) {
    buf.ignore(this.length);
};

/** Called to encode the packet into an output buffer. Invokes
 * FixedPacket#fixedEncode after writing the packet ID to the output buffer.
 * 
 * @param {PacketBuffer} buf The output buffer
 */
FixedPacket.prototype.encode = function(buf) {
    buf.writeUInt8(this.packetId);
    this.fixedEncode(buf);
};

/** Must be overriden in the derived class. Called to encode the packet into an
 * output buffer. The packet's leading ID byte will have already been written.
 * 
 * @param {PacketBuffer} buf The output buffer
 */
FixedPacket.prototype.fixedEncode = function() {
    throw new Error("fixedEncode() method not overridded for packet " + this.packetName);
};

module.exports = FixedPacket;
