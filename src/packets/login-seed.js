"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

/** This packet is intended to seed client encryption. It also informs the
 * master server of the current client version. This must be the first packet
 * transmitted to the {@link MasterServer}. This packet is only sent by the
 * client to the {@link MasterServer}.
 * 
 * @event module:Packets#packetLoginSeed
 * @type {Object}
 * @property {Number} encryptionSeed Ignore this. For encrypted clients this
 *                                   would be the seed used for encryption.
 * @property {Object} clientVersion The client's version.
 * @property {Number} clientVersion.major Major version number.
 * @property {Number} clientVersion.minor Minor version number.
 * @property {Number} clientVersion.revision Revision number.
 * @property {Number} clientVersion.prototype Prototype number.
 */
function LoginSeedPacket() {
    FixedPacket.call(this);
    this.packetId = 0xEF;
    this.packetName = "packetLoginSeed";
    this.length = 20;
}
util.inherits(LoginSeedPacket, FixedPacket);
LoginSeedPacket.id = 0xEF;

LoginSeedPacket.prototype.fixedDecode = function(buf) {
    this.encryptionSeed = buf.readUInt32();
    this.clientVersion = {
        major: buf.readInt32(),
        minor: buf.readInt32(),
        revision: buf.readInt32(),
        prototype: buf.readInt32()
    };
};

LoginSeedPacket.prototype.fixedEncode = function(buf) {
    buf.writeUInt32(this.encryptionSeed);
    buf.writeInt32(this.clientVersion.major);
    buf.writeInt32(this.clientVersion.minor);
    buf.writeInt32(this.clientVersion.revision);
    buf.writeInt32(this.clientVersion.prototype);
};

module.exports = LoginSeedPacket;
