"use strict";

// Communication with game shards

/** Game server information.
 * 
 * @class GameServerInfo
 */
function GameServerInfo() {
    /// The display name of the game server
    this.name = "Unamed Game Server";
    /// The limit of concurrently connected players
    this.playerLimit = 100;
    /// The count of currently connected players
    this.playerCount = 0;
    /// The GMT offset of the server (only positive values)
    this.gmtOffset = 0;
    /// The IPv4 address the server is bound to
    this.ipv4 = [127, 0, 0, 1];
    /// Last updated timestamp
    this.lastUpdated = 0;
}
ctor(GameServerInfo);

// All game servers
var gameServers = {};

events.on("cncCommandUpdateShard", function(cnc) {
    if(!cnc.id) {
        cnc.failed = true;
        return;
    }
    
    var info = gameServers[cnc.id];
    if(info === undefined) {
        info = new GameServerInfo();
        gameServers[cnc.id] = info;
    }
    
    if(cnc.name) {
        info.name = cnc.name;
    }
    if (cnc.host) {
        var octets = cnc.host.split(".");
        if(octets.length !== 4) {
            cnc.failed = true;
            return;
        }
        info.ipv4[0] = parseInt(octets[0]);
        info.ipv4[1] = parseInt(octets[1]);
        info.ipv4[2] = parseInt(octets[2]);
        info.ipv4[3] = parseInt(octets[3]);
    }
    if(cnc.port) {
        info.port = cnc.port;
    }
    if(cnc.playerLimit) {
        info.playerLimit = cnc.playerLimit;
    }
    if(cnc.playerCount) {
        info.playerCount = cnc.playerCount;
    }
    if(cnc.gmtOffset) {
        info.gmtOffset = cnc.gmtOffset;
    }
    info.lastUpdated = time.now();
});

events.setInterval("cncPurgeStaleGameInfo", {}, time.minutes(1));
events.on("cncPurgeStaleGameInfo", function() {
    var staleTime = time.now() - time.minutes(5);
    for(var k in gameServers) {
        if(!gameServers.hasOwnProperty(k)) {
            continue;
        }
        if(gameServers[k].lastUpdated <= staleTime) {
            delete gameServers[k];
        }
    }
});

// Game shard listing and selection handling

events.on("accountLoginSuccess", function(ns) {
    if(!ns.isLoggedIn) {
        return;
    }
    var gameServerList = createPacket("GameServerListPacket");
    for(var k in gameServers) {
        if(!gameServers.hasOwnProperty(k)) {
            continue;
        }
        gameServerList.servers.push(gameServers[k]);
    }
    ns.gameServerList = gameServerList;
    ns.sendPacket(gameServerList);
});

events.on("packetSelectGameServer", function(packet) {
    if(!packet.netState.isLoggedIn ||
        !packet.netState.gameServerList) {
        return;
    }
    if(packet.server < 0 ||
        packet.server >= packet.netState.gameServerList.length) {
        return;
    }
    var info = packet.netState.gameServerList[packet.server];
    delete packet.netState.gameServerList;
    packet.netState.selectedServer = info;
    /** Published when the client has selected a server to connect to.
     * 
     * @event GameServerInfo#accountSelectedGameServer
     * @type {NetState}
     */
    events.emit("accountSelectedGameServer", packet.netState);
});

events.on("accountSelectedGameServer", function(ns) {
    if(!ns.isLoggedIn ||
        !ns.selectedServer ||
        !ns.account) {
        return;
    }
    var packet = createPacket("ServerRedirectPacket");
    packet.ipv4 = ns.selectedServer.ipv4;
    packet.port = ns.selectedServer.port;
    packet.key = random.cryptoInt();
    ns.sendPacket(packet);
    
    /** Published when the client is sent a server login key from the master
     * server.
     * 
     * @event GameServerInfo#accountSession
     * @type {Object}
     * @property {Number} key The session key
     * @property {Account} account The account bound to the session
     */
    events.emit("accountSession", {
        key: packet.key,
        account: ns.account,
    });
});
