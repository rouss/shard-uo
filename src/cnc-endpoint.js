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
        console.log(apiKeyName);
        console.log(apiKey);
        console.log(self.apiKeys[apiKeyName]);
        if(apiKeyName === undefined ||
            apiKey === undefined ||
            self.apiKeys[apiKeyName] !== apiKey) {
            res.statusCode = 403;
            res.statusMessage = "Not Authorized";
            res.end();
            return;
        }
        
        //var data;
        req.on("readable", function() {
            console.log(req.read());
        });
        req.on("end", function() {
            console.log("end");
            res.end();
        });
    }).listen(
        self.port,
        self.host,
        function() {
        log.info("CNCEndpoint listening on " + self.host + ":" + self.port);
    });
};

module.exports = CNCEndpoint;
