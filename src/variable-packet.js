"use strict";

var Packet = require("./packet"),
    util = require("util");

/** Base class for variable-length packets. All packets of this type include a
 * two-byte length field at offset 1.
 * 
 * @constructor
 * @extends Packet
 */
function VariablePacket() {
    Packet.call(this);
    /// The length of the buffer. If < 0, the length is not yet known.
    this.length = -1;
}
util.inherits(VariablePacket, Packet);

/** Called to decode a portion of the packet from an input buffer. Calls
 * VariablePacket#variableDecode once the length of the incomming packet is
 * known and the input buffer contains enough data to decode the entire packet.
 * 
 * @param {PacketBuffer} buf The input buffer
 */
VariablePacket.prototype.decode = function(buf) {
    if(this.length < 0) {
        if(buf.length() < 2) {
            return;
        }
        this.length = buf.readUInt16();
        this.length -= 3;
    }
    if(this.length >= 0) {
        if(buf.length() >= this.length) {
            this.variableDecode(buf);
        }
    }
};

/** Must be overridden in the derived class. Called to decode the contents of
 * the packet from an input buffer. The length property will already have been
 * set to the expected length of the packet. The packet ID and length bytes will
 * have already been read from the buffer.
 * 
 * @param {PacketBuffer} buf The input buffer
 */
VariablePacket.prototype.variableDecode = function(buf) {
    buf.ignore(this.length);
};

/** Called to encode the packet into an output buffer. Calls
 * VariablePacket#variableEncode to encode the contents of the packet. Also
 * writes the ID and length bytes.
 * 
 * @param {PacketBuffer} buf The output buffer
 */
VariablePacket.prototype.encode = function(buf) {
    buf.writeUInt8(this.packetId);
    buf.writeUInt16(0); // Length placeholder
    this.variableEncode(buf);
    var slice = buf.activeSlice();
    slice.writeUInt16BE(buf.length(), 1);
};

/** Must be overridden in the derived class. Called to encode the contents of
 * the packet into an output buffer. The superclass takes care of calculating
 * and outputting the length bytes as well as the ID byte.
 * 
 * @param {PacketBuffer} buf The output buffer
 */
VariablePacket.prototype.variableEncode = function() {
    throw new Error("variableEncode() not overrided for packet " + this.packetName);
};

module.exports = VariablePacket;
