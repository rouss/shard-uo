"use strict";

var tls = require("tls"),
    fs = require("fs"),
    uuid = require("uuid"),
    LineTransform = require('node-line-reader').LineTransform;

function CNCState(socket, parent) {
    this.socket = socket;
    this.parent = parent;
    this.uuid = uuid.v4();
}

CNCState.prototype.handleLine = function(line) {
    
};

/** An encrypted endpoint for Command and Control event exchange.
 * 
 * @class CNCEndpoint
 * @param {String} host The host addapter to bind to
 * @param {Number} port The port number to bind to
 * @param {String} keyPath Path to the key file
 * @param {String} certPath Path to the cert file
 */
function CNCEndpoint(host, port, keyPath, certPath) {
    this.host = host;
    this.port = port;
    this.keyPath = keyPath;
    this.certPath = certPath;
    this.server = null;
    this.states = {};
}

/** Starts the endpoint.
 */
CNCEndpoint.prototype.start = function() {
    var self = this;
    this.server = tls.createServer({
        key: fs.readFileSync(this.keyPath),
        cert: fs.readFileSync(this.certPath)
    }, function(socket) {
        var state = new CNCState(socket, self);
        socket.state = state;
        self.states[state.uuid] = state;
        
        socket.setNoDelay();
        
        socket.setTimeout(15 * 1000, function(){
            self.disconnect(state);
        });
        
        var transform = new LineTransform();
        socket.pipe(transform);
        
        transform.on("data", function(line) {
            state.handleLine(line);
        });
        
        transform.on("end", function() {
            self.disconnect(state);
        });

        socket.on("error", function() {
            self.disconnect(state);
        });
    });
};

module.exports = CNCEndpoint;
