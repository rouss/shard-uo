"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

/** A packet that makes a login request to a {@link MasterServer}. This packet
 * must be preceeded by the {@link module:Packets#packetLoginSeed} event. This
 * packet is only sent by the client to the {@link MasterServer}.
 * 
 * @event module:Packets#packetLoginRequest
 * @type {Object}
 * @property {String} accountName The account name provided with the login
 *                                request.
 * @property {String} accountPass The password provided with the login request
 *                                in plain text.
 * @property {Number} nextLoginKey Ignore this. It has significence to OSI
 *                                 account servers.
 */
function LoginRequestPacket() {
    FixedPacket.call(this);
    this.packetId = 0x80;
    this.packetName = "packetLoginRequest";
    this.length = 61;
}
util.inherits(LoginRequestPacket, FixedPacket);
LoginRequestPacket.id = 0x80;

LoginRequestPacket.prototype.fixedDecode = function(buf) {
    this.accountName = buf.readAsciiString(30);
    this.accountPass = buf.readAsciiString(30);
    this.nextLoginKey = buf.readUInt8();
};

LoginRequestPacket.prototype.fixedEncode = function(buf) {
    buf.writeAsciiString(this.accountName, 30);
    buf.writeAsciiString(this.accountPass, 30);
    buf.writeUInt8(this.nextLoginKey);
};

module.exports = LoginRequestPacket;
