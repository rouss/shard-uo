"use strict";

// Handles the login process

var crypto = require("crypto");

/** Account information.
 * 
 * @class Account
 */
function Account() {
    /// Account username
    this.username = null;
    /// Password sha256 hash
    this.passHash = null;
}
ctor(Account);

events.on("packetLoginSeed", function(packet) {
    // Validate the client's version
    var ver = config.requiredVersion;
    if((ver[0] !== undefined && (ver[0] !== packet.clientVersion.major)) ||
        (ver[1] !== undefined && (ver[1] !== packet.clientVersion.minor)) ||
        (ver[2] !== undefined && (ver[2] !== packet.clientVersion.revision)) ||
        (ver[3] !== undefined && (ver[3] !== packet.clientVersion.prototype))) {
        var p = createPacket("LoginDeniedPacket");
        p.reason = 4;
        packet.netState.sendPacket(p);
        log.info("Client login rejected due to incompatible version");
        return;
    }
    /** If true, the client's version is acceptable.
     * 
     * @name NetState~isClientVersionOk
     * @type {Boolean}
     */
    packet.netState.isClientVersionOk = true;
});

events.on("packetLoginRequest", function(packet) {
    // Clear the current netState if needed
    delete packet.netState.isLoggedIn;
    delete packet.netState.account;
    
    if(!packet.netState.isClientVersionOk) {
        packet.netState.disconnect();
        return;
    }
    var hash = crypto.createHash("sha256");
    hash.update(packet.accountPass);
    var passHash = hash.digest("hex");

    database.get("account-" + packet.accountName, function(account) {
        var p;
        
        if(!account) {
            log.info("Attempting to create new account " + packet.accountName);
            account = new Account();
            account.username = packet.accountName;
            account.passHash = passHash;
            log.info(account);
            /** Published when a new account is about to be created. If any
             * subscriber returns a value the account will not be created.
             * 
             * @event Account#accountCreate
             * @type {Account}
             */
            if(events.emit("accountCreate", account) !== undefined) {
                p = createPacket("LoginDeniedPacket");
                p.reason = 0;
                packet.netState.sendPacket(p);
                return;
            }
            database.put("account-" + packet.accountName, account);
            /** Published when the client has authenticated with an account.
             * If any subscriber returns a value the login will be canceled.
             * 
             * @event Account#accountLogin
             * @type {Account}
             * @property {Number} reason The login rejection reason code. If
             *   not defined IGR Authentication Error will be used.
             */
            if(events.emit("accountLogin", account) !== undefined) {
                p = createPacket("LoginDeniedPacket");
                if(account.reason !== undefined) {
                    p.reason = account.reason;
                } else {
                    p.reason = 7;
                }
                packet.netState.sendPacket(p);
                return;
            }
        } else {
            if(account.username !== packet.accountName ||
                account.passHash !== passHash) {
                log.info("Account " + packet.accountName + " failed password authentication");
                p = createPacket("LoginDeniedPacket");
                p.reason = 4;
                packet.netState.sendPacket(p);
                return;
            }
        }
        
        // If we reach here everything is OK
        log.debug("Account " + packet.accountName + " logged in");
        
        /** If true the netState has been authenticated somehow.
         * 
         * @name NetState#isLoggedIn
         * @type {Boolean}
         */
        packet.netState.isLoggedIn = true;
        packet.netState.account = account;
        /** Published when the client has successfully logged in.
         * 
         * @event Account#accountLoginSuccess
         * @type {NetState}
         */
        events.emit("accountLoginSuccess", packet.netState);
    });
});
