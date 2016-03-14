"use strict";

/** Provides an interface to create packets by header byte or name.
 * 
 * @module Packets
 */

var ReloadableScriptCollection = require("./reloadable-script-collection"),
    FixedPacket = require("./fixed-packet"),
    VariablePacket = require("./variable-packet");

var collection = new ReloadableScriptCollection(["./src/packets"]);
var packetInfo;
var ctors;
var hasLoaded = false;

function reload() {
    log.info("Packet handlers reloading");
    
    // Attempt to reload the packet handler scripts
    if(!collection.reload()) {
        if(!hasLoaded) {
            throw new Error("Falied to load packet handlers");
        }
        return;
    }
    
    if(!hasLoaded) {
        events.on("reload", reload);
        hasLoaded = true;
    }
    
    // Merge the packet handlers with the base data
    packetInfo = require("require-reload")("./packet-data");
    ctors = {};
    for(var i = 0; i < collection.scripts.length; ++i) {
        var script = collection.scripts[i];
        packetInfo[script.id].ctor = script;
        ctors[script.name] = script;
    }
    
    // Backfill the packets without handlers with thier generic handlers
    for(i = 0; i < packetInfo.length; ++i) {
        var info = packetInfo[i];
        if(info.ctor) {
            continue;
        }
        if(info.length > 0) {
            info.defaultCtor = true;
            info.ctor = FixedPacket;
        } else {
            info.defaultCtor = true;
            info.ctor = VariablePacket;
        }
    }
}

/** Create a Packet object by ID byte.
 * 
 * @param {Number} id The ID of the packet.
 * @return {Packet} A {@link Packet} object appropriote for the id.
 */
exports.createById = function(id) {
    var info = packetInfo[id];
    if(info === undefined) {
        throw new Error("No packet information for packet ID " + id);
    }
    if(info.depricated) {
        throw new Error("Depricated packet header " + id + " encountered, probable corrupt stream");
    }
    if(info.unexpected) {
        throw new Error("Server-only packet header " + id + " encountered, probable corrupt stream");
    }
    var packet = new info.ctor();
    if(info.defaultCtor &&
        info.length > 0) {
        packet.length = info.length - 1;
    }
    return packet;
};

/** Create a Packet object by constructor name.
 * 
 * @param {String} name The name of the constructor.
 */
exports.create = function(name) {
    var ctor = ctors[name];
    if(ctor === undefined) {
        throw new Error("Unknown packet constructor " + name);
    }
    return new ctor();
};

/** Initial load.
 */
exports.reload = reload;

// Add create to global namespace for conveniance
global.createPacket = exports.create;
