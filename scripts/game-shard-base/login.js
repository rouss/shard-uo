"use strict";

// Events to handle game shard login

events.on("packetPostLogin", function(packet) {
    shard.master.command({
        command: "AccountSession",
        key: packet.key,
    }, "cncAccountSessionReply", packet.netState);
});

events.on("cncAccountSessionReply", function(res) {
    if(!res.success) {
        log.warn("Bogus account session on server login");
        return;
    }
    res.ctx.username = res.username;
    res.ctx.isLoggedIn = true;
    
    /** Published whenever a client has successfully logged into the server
     * (at the character list).
     * 
     * @event NetState#clientAtCharacterList
     * @type {NetState}
     */
    events.emit("clientAtCharacterList", res.ctx);
});

events.on("clientAtCharacterList", function(ns) {
    var packet = createPacket("CharacterListPacket");
    // TODO Populate with list of characters and locations
    ns.sendPacket(packet);
});
