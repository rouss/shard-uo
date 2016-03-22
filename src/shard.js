"use strict";

/** Provides an interface to Shard server management.
 * 
 * @module Shard
 */

var EventSink = require("./event-sink"),
    UOPEndpoint = require("./uop-endpoint"),
    CNCEndpoint = require("./cnc-endpoint"),
    MasterCommand = require("./master-command"),
    store = require("./store"),
    packets = require("./packets");

/** Implements a Shard server. Shard servers listen for UO client packets,
 * SSH connections from administrators, and TLS-encrpyted JSON streams for
 * inter-shard communication. Communication events on these three endpoints
 * emit events on a single {@link EventSink}. These four components constitue
 * the entirety of a Shard server regardless of its task in the network or its
 * individual behavior and ruleset. The behavior of the Shard server is
 * defined by the event scripts loaded by the EventSink as determined by
 * process configuration.
 * 
 * @class Shard
 */
function Shard() {
    /// The {@link EventSink} that all endpoints publish events to.
    this.eventSink = new EventSink();
    /// All endpoints which the shard has
    this.endpoints = [];
    /// The master CNC connector
    this.master = null;
}

/** Starts the shard process running.
 */
Shard.prototype.start = function() {
    this.eventSink.reload();
    
    log.info("Starting " + config.name + " Shard");
    
    store.init(config.dbPath);
    
    var endpoint;
    
    var cfg = config.endpoints.uop;
    if(cfg) {
        endpoint = new UOPEndpoint(cfg.host, cfg.port, cfg.mode);
        endpoint.start();
        this.endpoints.push(endpoint);        
    }
    
    cfg = config.endpoints.cnc;
    if(cfg) {
        endpoint = new CNCEndpoint(cfg.host, cfg.port, cfg.key, cfg.cert,
            cfg.apiKeys);
        endpoint.start();
        this.endpoints.push(endpoint);
    }
    
    if(config.masterConnector) {
        this.master = new MasterCommand(
            config.masterConnector.host,
            config.masterConnector.port,
            config.id,
            config.masterConnector.apiKey
        );        
    }
};

/** Call this method to reload everything.
 */
Shard.prototype.reload = function() {
    config.reload();
    for(var i in this.endpoints) {
        if(this.endpoints.hasOwnProperty(i)) {
            var endpoint = this.endpoints[i];
            if(typeof endpoint.reload === "function") {
                endpoint.reload();
            }
        }
    }
    packets.reload();
    events.reload();
};

/** Call this method to stop the server using only synchronous methods.
 */
Shard.prototype.kill = function() {
    for(var i in this.endpoints.len) {
        if(this.endpoints.hasOwnProperty(i)) {
            this.endpoints[i].kill();
        }
    }
};

/** Call this method to gracefully stop the server.
 */
Shard.prototype.shutdown = function() {
    for(var i in this.endpoints) {
        if(this.endpoints.hasOwnProperty(i)) {
            this.endpoints[i].shutdown();
        }
    }
};

/** Creates a {@link module:Shard.Shard}. This method handles setting up proper
 * process event handlers to ensure that the Shard instance is properly
 * disposed of.
 * 
 * @returns {module:Shard.Shard} The newly created Shard instance.
 */
exports.create = function() {
    var ret = new Shard();
    process.on("exit", function() {
        ret.kill();
    });
    process.once("SIGINT", function() {
        log.info("Recieved SIGINT, attempting graceful shutdown");
        if(process.stdin.isTTY) {
            console.log("Press Enter to Continue...");
        }
        ret.shutdown();
        process.once("SIGINT", function() {
            log.info("Recieved second SIGINT, attempting forceful shutdown");
            if(process.stdin.isTTY) {
                console.log("Press Enter to Continue...");
            }
            ret.kill();
        });
    });
    return ret;
};
