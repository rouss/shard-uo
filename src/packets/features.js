"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

function FeaturesPacket() {
    FixedPacket.call(this);
    this.packetId = 0xB9;
    this.packetName = "packetFeatures";
    this.length = 4;
    this.features = 0x00001821; // T2A + extra housing / slots
}
util.inherits(FeaturesPacket, FixedPacket);
FeaturesPacket.id = 0xB9;

FeaturesPacket.prototype.fixedEncode = function(buf) {
    buf.writeUInt32(this.features);
};

module.exports = FeaturesPacket;
