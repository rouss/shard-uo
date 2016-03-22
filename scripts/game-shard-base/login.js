"use strict";

// Events to handle game shard login

events.on("packetPostLogin", function(packet) {
    log.debug("PostLogin recieved, key=" + packet.key);
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
    var packet = createPacket("FeaturesPacket");
    packet.features = 0x00001821;
    //packet.features = 0x007F92DB;
    ns.sendPacket(packet);
    
    packet = createPacket("CharacterListPacket");
    packet.features = 0x00009040;
    //packet.features = 0x000011E8;
    // TODO Populate with list of characters and locations
    ns.sendPacket(packet);
});
