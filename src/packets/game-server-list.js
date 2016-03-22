"use strict";

var VariablePacket = require("../variable-packet"),
    util = require("util");

function GameServerListPacket() {
    VariablePacket.call(this);
    this.packetId = 0xA8;
    this.packetName = "packetGameServerList";
    this.servers = [];
}
util.inherits(GameServerListPacket, VariablePacket);
GameServerListPacket.id = 0xA8;

GameServerListPacket.prototype.variableEncode = function(buf) {
    buf.writeUInt8(0x5D);
    buf.writeUInt16(this.servers.length);
    for(var i = 0; i < this.servers.length; ++i) {
        var server = this.servers[i];
        buf.writeUInt16(i);
        buf.writeAsciiString(server.name, 32);
        buf.writeUInt8(server.percentFull);
        buf.writeUInt8(server.gmtOffset);
        buf.writeUInt8(server.ipv4[3]);
        buf.writeUInt8(server.ipv4[2]);
        buf.writeUInt8(server.ipv4[1]);
        buf.writeUInt8(server.ipv4[0]);
    }
};

module.exports = GameServerListPacket;
