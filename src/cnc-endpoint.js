"use strict";

var https = require("https"),
    fs = require("fs"),
    path = require("path");
    //url = require("url");

/** HTTPS-based Command and Control endpoint.
 * 
 * @class CNCEndpoint
 * @param {String} host Host to bind to.
 * @param {Number} port Port to bind to.
 * @param {String} key Path to the private key to use for the SSL connection.
 * @param {String} cert Path to the cert to use for the SSL connection.
 * @param {String} apiKeys Path to the directory containing trusted API keys.
 */
function CNCEndpoint(host, port, key, cert, apiKeys) {
    this.host = host;
    this.port = port;
    this.key = key;
    this.cert = cert;
    this.apiKeysDir = apiKeys;
    this.apiKeys = {};
    this.server = null;
}

/** Starts the endpoint.
 */
CNCEndpoint.prototype.start = function() {
    var self = this;
    
    var keyFiles;
    try {
        keyFiles = fs.readdirSync(this.apiKeysDir);
    } catch(e) {
        if(e.code === "ENOENT") {
            log.warn("No API keys found");
        } else {
            throw e;
        }
    }
    for(var i = 0; i < keyFiles.length; ++i) {
        var name = keyFiles[i];
        this.apiKeys[name] = fs.readFileSync(path.join(this.apiKeysDir, name)).toString("utf8").trim();
    }
    
    this.server = https.createServer({
        key: fs.readFileSync(this.key),
        cert: fs.readFileSync(this.cert),
    }, function(req, res) {
        if(req.method !== "POST") {
            res.statusCode = 405;
            res.statusMessage = "Method Not Allowed";
            res.end();
            return;
        }
        
        var apiKeyName = req.headers["api-key-name"].trim();
        var apiKey = req.headers["api-key-value"].trim();
        if(apiKeyName === undefined ||
            apiKey === undefined ||
            self.apiKeys[apiKeyName] !== apiKey) {
            res.statusCode = 403;
            res.statusMessage = "Not Authorized";
            res.end();
            return;
        }
        
        var buf = new Buffer(64 * 1024);
        var bufOfs = 0;
        var errored = false;
        req.on("readable", function() {
            var read = req.read();
            if(!read) {
                return;
            }
            try {
                read.copy(buf, bufOfs);
                bufOfs += read.length;
            } catch(e) {
                log.error("Buffer overflow while reading from CNCEndpoint request");
                res.statusCode = 500;
                res.statusMessage = "Internal Server Error";
                res.end();
                errored = true;
            }
        });
        req.on("end", function() {
            if(errored) {
                return;
            }
            var str = buf.toString("utf8", 0, bufOfs);
            var obj;
            try {
                obj = JSON.parse(str);
            } catch(e) {
                log.error("Error while parsing JSON body of CNCEndpoint request: " + e);
                res.statusCode = 500;
                res.statusMessage = "Internal Server Error";
                res.end();
                return;
            }
            /** Published for every CNC request made to the server. By
             * convention every CNC request will have a command property that
             * will be appended to the event name. For instance, if sent the
             * object {command:"Ping"}, the resulting event name would be
             * cncRequestPing. If no command property exists the event name
             * will be cncRequest.
             * 
             * @event CNCEndpoint#cncCommand
             * @type {Object}
             * @property {String} command The name of the command requested
             * @property {Object} response The JSON object to be returned to
             *   the requestor.
             */
            obj.response = {};
            if(typeof obj.command === "string") {
                events.emit("cncCommand" + obj.command, obj);
            } else {
                events.emit("cncCommand", obj);
            }
            var resStr;
            try {
                resStr =JSON.stringify(obj.response);
            } catch(e) {
                log.error("Failed to stringify CNC response object: " + e);
                res.statusCode = 500;
                res.statusMessage = "Internal Server Error";
                res.end();
                return;
            }
            res.statusCode = 200;
            res.statusMessage = "OK";
            res.end(resStr);
        });
    }).listen(
        self.port,
        self.host,
        function() {
        log.info("CNCEndpoint listening on " + self.host + ":" + self.port);
    });
};

/** Forcefully kills the endpoint.
 */
CNCEndpoint.prototype.kill = function() {
    if(this.server) {
        this.server.close();
    }
};

/** Gracefully shuts down the endpoint.
 */
CNCEndpoint.prototype.shutdown = function() {
    this.kill();
};

module.exports = CNCEndpoint;
