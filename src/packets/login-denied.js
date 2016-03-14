"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

/** This packet informs the client that the previous login request from a
 * {@link module:Packets#packetLoginRequest} packet was rejected for some
 * reason. This packet is only sent from the {@link MasterServer} to the client.
 *  
 * @event module:Packets#packetLoginDenied
 * @type {Object}
 * @property {Number} reason The reason the login attempt was denied. Possible
 *                           values are:
 * <pre>
 * 0 Bad username or password
 * 1 Account in use
 * 2 Account blocked
 * 3 Invalid account credentials
 * 4 Bad communications
 * 5 IGR concurrency limit met
 * 6 IGR time limit met
 * 7 IGR authorization error
 * </pre>
 */
function LoginDeniedPacket() {
    FixedPacket.call(this);
    this.packetId = 0x82;
    this.packetName = "packetLoginDenied";
    this.length = 1;
    this.reason = 4; // Bad communications
}
util.inherits(LoginDeniedPacket, FixedPacket);
LoginDeniedPacket.id = 0x82;

LoginDeniedPacket.prototype.fixedEncode = function(buf) {
    buf.writeUInt8(this.reason);
};

module.exports = LoginDeniedPacket;
