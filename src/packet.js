"use strict";

/** The base class for all packet objects.
 * 
 * @constructor
 */
function Packet() {
    /// The numeric ID of the packet
    this.packetId = 0xFF;
    /// The event name emitted by the packet object
    this.packetName = "none";
    /// True after the packet has completed decoding itself from the input stream
    this.decoded = false;
}

/** Called to decode a portion of the packet from an input buffer.
 * 
 * @param {PacketBuffer} buf The input buffer
 */
Packet.prototype.decode = function() {  
};

/** Called to encode the packet into an output buffer.
 * 
 * @param {PacketBuffer} buf The output buffer
 */
Packet.prototype.encode = function() {
};

module.exports = Packet;
