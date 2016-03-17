"use strict";

var fs = require("fs"),
    https = require("https");

/** Provides a simple wrapper for communicating with a master server's CNC
 * endpoint.
 * 
 * @class MasterCommand
 * @param {String} host The master server's CNC host
 * @param {Number} port The master server's CNC port
 * @param {String} keyName API key name to use
 * @param {String} keyPath Path to the API key file
 */
function MasterCommand(host, port, keyName, keyPath) {
    this.host = host;
    this.port = port;
    this.apiKeyName = keyName;
    this.apiKeyValue = fs.readFileSync(keyPath).toString("utf8").trim();
}

/** Sends a CNC command to the master server, publishing the named event when
 * complete.
 * 
 * @param {Object} cnc The CNC object to send to the master server. This
 *   should typically have at least a command property specifying what command
 *   to execute. Note that commmand names are CASE SENSETIVE.
 * @param {String} event The name of the event to publish when the transaction
 *   is complete. The event will recieve the response object from the CNC
 *   transaction as it's parameter. The response object will have one
 *   additional property, success, which will be truthy if the transaction was
 *   successful.
 */
MasterCommand.prototype.command = function(cnc, event) {
    var self = this;
    var req = https.request({
        host: self.host,
        port: self.port,
        path: "/",
        method: "POST",
        headers: {
            "api-key-name": self.apiKeyName,
            "api-key-value": self.apiKeyValue
        },
        rejectUnauthorized: false
    }, function(res) {
        var buf = new Buffer(64 * 1024);
        var bufOfs = 0;
        res.on("readable", function() {
            var read = res.read();
            if(!read) {
                return;
            }
            read.copy(buf, bufOfs);
            bufOfs += read.length;
        });

        res.on("end", function() {
            var str = buf.toString("utf8", 0, bufOfs);
            var obj;
            if(str.length > 0) {
                try {
                    obj = JSON.parse(str);                    
                } catch(e) {
                    log.error("Error parsinng JSON response from master CNCEndpoint: " + e);
                    return;
                }
            } else {
                obj = {};
            }
            obj.sucess = res.statusCode === 200;
            events.emit(event);
        });
    });
    
    var cncstr;
    try {
        cncstr = JSON.parse(cnc);
    } catch(e) {
        log.error("Error parsing CNC command object to JSON: " + e);
        return;
    }
    req.end(cncstr);    
};
