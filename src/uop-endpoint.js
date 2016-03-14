"use strict";

var net = require("net"),
    NetState = require("./net-state");

/** An Ultima Online Packet protocol server that publishes UO packet events to
 * an {@link EventSink} object.
 * 
 * @class UOPEndpoint
 * @param {EventSink} sink The EventSink to publish UO packet events to.
 * @param {String} host The host IP to bind to.
 * @param {Number} port The port number to bind to.
 */
function UOPEndpoint(host, port) {
    /// The host IP we are bound to
    this.host = host;
    /// The port we are listening to
    this.port = port;
    /// The net.Server object that implements the network endpoint.
    this.server = null;
    /// All {@link NetState} objects by uuid
    this.states = {};
    /// The queue of all packet objects waiting for publication
    this.packetQueue = [];
    /// If true we are shutting down
    this.shuttingDown = false;
}

/** Starts the endpoint.
 */
UOPEndpoint.prototype.start = function() {
    var self = this;
    this.server = net.createServer(function(socket) {
        var state = new NetState(socket, self);
        socket.netState = state;
        self.states[state.uuid] = state;
        
        socket.setNoDelay();
        
        socket.setTimeout(15 * 1000, function(){
            self.disconnect(state);
        });
        
        socket.on("data", function (chunk) {
            try {
                state.handleData(chunk);                
            } catch(e) {
                log.error("Exception while processing data: " + e.stack);
            }
        });
        
        socket.on("end", function() {
            self.disconnect(state);
        });

        socket.on("error", function() {
            self.disconnect(state);
        });
    }).listen({
        host: self.host,
        port: self.port,
        exclusive: true
    }, function() {
        log.info("UOPEndpoint listening on " + self.host + ":" + self.port);
    });
    setImmediate(doProcessQueue, this);
};

/** Kills the endpoint with synchronous calls.
 */
UOPEndpoint.prototype.kill = function() {
    var keys = Object.keys(this.states);
    for(var i = 0; i < keys.length; ++i) {
        this.disconnect(this.states[keys[i]]);
    }
    
    if(this.server) {
        this.server.close();
    }
};

/** Shuts down the endpoint gracefully.
 */
UOPEndpoint.prototype.shutdown = function() {
    this.shuttingDown = true;
    this.processQueue();
    this.kill();
};

/** Disconnect a {@link NetState} from the endpoint.
 * 
 * @param {NetState} state The NetState to disconnect.
 */
UOPEndpoint.prototype.disconnect = function(state) {
    if(state.socket) {
        state.socket.end();
    }
    delete this.states[state.uuid];
};

/** Queues a single client packet object onto the queue of packets to be
 * emitted as events.
 * 
 * @param {Packet} packet The packet object
 */
UOPEndpoint.prototype.queuePacket = function(packet) {
    this.packetQueue.push(packet);
};

// Internal dispatch function
function doProcessQueue(self) {
    self.processQueue();
}

/** Processes the entire pending client packet queue.
 */
UOPEndpoint.prototype.processQueue = function() {
    while(this.packetQueue.length > 0) {
        var packet = this.packetQueue.shift();
        try {
            events.emit(packet.packetName, packet);            
        } catch(e) {
            log.error("Error in packet handler " + packet.packetName + ": " + e.stack);
        }
    }
    if(!this.shuttingDown) {
        setImmediate(doProcessQueue, this);
    }
};

module.exports = UOPEndpoint;
