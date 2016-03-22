"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

/** This packet informs the client of the IP address and port to use to connect
 * to the game server it selected from the server list.
 *  
 * @event module:Packets#packetServerRedirect
 * @type {Object}
 * @property {Number[]} ipv4 The IP address of the server
 * @property {Number} port The port to connect to
 * @property {Number} key The key ID of the account authorization
 */
function ServerRedirectPacket() {
    FixedPacket.call(this);
    this.packetId = 0x8C;
    this.packetName = "packetServerRedirect";
    this.length = 10;
    this.ipv4 = [127, 0, 0, 1];
    this.port = 3000;
    this.key = 0;
}
util.inherits(ServerRedirectPacket, FixedPacket);
ServerRedirectPacket.id = 0x8C;

ServerRedirectPacket.prototype.fixedEncode = function(buf) {
    buf.writeUInt8(this.ipv4[0]);
    buf.writeUInt8(this.ipv4[1]);
    buf.writeUInt8(this.ipv4[2]);
    buf.writeUInt8(this.ipv4[3]);
    buf.writeUInt16(this.port);
    buf.writeUInt32(this.key);
};

module.exports = ServerRedirectPacket;
