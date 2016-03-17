"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

/** This packet is sent by the client to a game server to login.
 * 
 * @event module:Packets#packetPostLogin
 * @type {Object}
 * @property {Number} key The session key sent by the master server.
 * @property {String} username The user's name
 * @property {String} password The user's plain-text password
 */
function PostLoginPacket() {
    FixedPacket.call(this);
    this.packetId = 0x91;
    this.packetName = "packetPostLogin";
    this.length = 64;
    this.key = 0;
    this.username = "";
    this.password = "";
}
util.inherits(PostLoginPacket, FixedPacket);
PostLoginPacket.id = 0x91;

PostLoginPacket.prototype.fixedDecode = function(buf) {
    this.key = buf.readUInt32();
    this.username = buf.readAsciiString(30);
    this.password = buf.readAsciiString(30);
};

module.exports = PostLoginPacket;
