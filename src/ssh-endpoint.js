"use strict";

var fs = require('fs'),
    path = require("path"),
    crypto = require('crypto'),
    uuid = require("uuid"),
    buffersEqual = require('buffer-equal-constant-time'),
    ssh2 = require('ssh2'),
    LineTransform = require('node-line-reader').LineTransform,
    utils = ssh2.utils;

/** An SSH endpoint state.
 * 
 * @class SSHState
 * @param {SSHEndpoint} parent The parent object.
 * @param {Stream} stream The stream used for communication.
 */
function SSHState(parent, stream) {
    this.parent = parent;
    this.stream = stream;
    this.uuid = uuid.v4();
}



/** A generic SSH endpoint. This endpoint only allows public key authentication
 * and only with public keys that have been placed in the local installation
 * directory as trusted.
 * 
 * @class SSHEndpoint
 * @param {String} host Host name to bind on
 * @param {Number} port Port to bind on
 * @param {String} keyPath Path to the host's private key
 * @param {String} trustedKeysPath Path to a directory containing all public
 *   keys that are trusted by this endpoint.
 * @param {Boolean} isShell If true, this endpoint will behaive as a shell
 *   server. If false it will serve as a Command and Control endpoint.
 * @param {Function} lineHandler A function that is called for every
 *   line of text data that this endpoint recieves. It should return an object
 *   with a name property specifying the name of the event to publish, and a
 *   value property specifying the value of the value property of the event
 *   object passed to the event.
 */
function SSHEndpoint(host, port, keyPath, trustedKeysPath, lineHandler) {
    this.host = host;
    this.port = port;
    this.keyPath = keyPath;
    this.trustedKeysPath = trustedKeysPath;
    this.lineHandler = lineHandler;
    this.server = null;
    this.trustedKeys = {};
    this.states = {};
}

/** Forces the endpoint to remove its cache of accepted endpoints. This will
 * not impact current connections, only future ones.
 */
SSHEndpoint.prototype.reload = function() {
    this.trustedKeys = {};
};

/** Starts the endpoint. This can take some time as it also loads the trusted
 * keys.
 */
SSHEndpoint.prototype.start = function() {
    var self = this;
    this.server = new ssh2.Server({
        hostKeys: [fs.readFileSync(this.keyPath)]
    }, function(client, info) {
        log.debug("SSH client connected from " + info.ip);
        /*
        client.on("authentication", function(ctx) {
            // Only accept public key authentication
            if(ctx.method !== "publickey" ||
                ctx.username.length <= 0) {
                ctx.reject(["publickey"], false);
                return;
            }
            
            var key = self.trustedKeys[ctx.username];
            if(key === undefined) {
                try {
                    var fullPath = path.resolve(path.join(self.trustedKeysPath, ctx.username + ".pub"));
                    key = utils.genPublicKey(utils.parseKey(fs.readFileSync(fullPath)));
                } catch(e) {
                    ctx.reject([], false);
                    return;
                }
                self.trustedKeys[ctx.username] = key;
            }
            
            if(ctx.key.algo !== key.fulltype) {
                ctx.reject([], true);
                return;
            }
            
            if(!buffersEqual(ctx.key.data, key.public)) {
                ctx.reject([], true);
                return;                
            }
            
            if(ctx.signature) {
                var verifier = crypto.createVerify(ctx.sigAlgo);
                verifier.update(ctx.blob);
                if (verifier.verify(key.publicOrig, ctx.signature)) {
                    ctx.accpet();
                } else {
                    ctx.reject();
                }
            } else {
                ctx.reject();
            }
        });
        
        client.on("ready", function(client) {
            log.info("Client authenticated successfully");
            
            client.on("session", function(accept) {
                var session = accept();
                
                session.on("shell", function(accept) {
                    var stream = accept();
                    var state = new SSHState(self, stream);
                    self.states[state.uuid] = state;
                    var transform = new LineTransform();
                    stream.pipe(transform);
                    transform.on("data", function(cmd) {
                        var event = self.lineHandler(cmd);
                        events.emit(event.name, { state: state, value: event.value });
                    });
                });
            });
        });
        */
    });
    
    this.server.listen({
        host: self.host,
        port: self.port,
        exclusive: true
    }, function() {
        log.info("SSH Endpoint listening on " + self.host + ":" + self.port);
    });
};

/** Kills the endpoint with synchronous calls.
 */
SSHEndpoint.prototype.kill = function() {
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
SSHEndpoint.prototype.shutdown = function() {
    this.kill();
};

/** Disconnect a {@link NetState} from the endpoint.
 * 
 * @param {NetState} state The NetState to disconnect.
 */
SSHEndpoint.prototype.disconnect = function(state) {
    if(state.connection) {
        state.connection.end();
    }
    delete this.states[state.uuid];
};

module.exports = SSHEndpoint;
