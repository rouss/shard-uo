"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

/** This packet is used to select a {@link GameServer} to connect to. This
 * packet is only sent from the client to a {@link MasterServer}.
 * 
 * @event module:Packets#packetSelectGameServer
 * @type {Object}
 * @property {Number} server The zero-based index of the server selected from
 *                           the {@link module:Packets#packetGameServerList}.
 */
function SelectGameServerPacket() {
    FixedPacket.call(this);
    this.packetId = 0xA0;
    this.packetName = "packetSelectGameServer";
    this.length = 2;
    this.server = -1;
}
util.inherits(SelectGameServerPacket, FixedPacket);
SelectGameServerPacket.id = 0xA0;

SelectGameServerPacket.prototype.fixedDecode = function(buf) {
    this.server = buf.readUInt16();
};

module.exports = SelectGameServerPacket;
