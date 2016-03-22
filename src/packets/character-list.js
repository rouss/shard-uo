"use strict";

var VariablePacket = require("../variable-packet"),
    util = require("util");

function CharacterListPacket() {
    VariablePacket.call(this);
    this.packetId = 0xA9;
    this.packetName = "packetCharacterListPacket";
    this.characters = [];
    this.features = 0x00009040;
    this.lastChar = -1;
}
util.inherits(CharacterListPacket, VariablePacket);
CharacterListPacket.id = 0xA9;

CharacterListPacket.prototype.variableEncode = function(buf) {
    // TODO Update to handle characters
    buf.writeUInt8(7);
    for(var i = 0; i < 7; ++i) {
        buf.fill(0, 60);
    }
    
    // TODO Update to handle starting location configuration
    buf.writeUInt8(1);
    
    buf.writeUInt8(0);
    buf.writeAsciiString("Britain", 32);
    buf.writeAsciiString("Sweet Dreams Inn", 32);
    buf.writeInt32(1496);
    buf.writeInt32(1628);
    buf.writeInt32(10);
    buf.writeInt32(1);
    buf.writeUInt32(1075074);
    buf.writeUInt32(0);
    
    buf.writeUInt32(this.features); // All Expansions: 0x000051E8
    buf.writeUInt16(this.lastChar >= 0 ? this.lastChar : 0xFFFF);
};

module.exports = CharacterListPacket;
