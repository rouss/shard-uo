/** Default web server configuration. Generally this file should not be
 * altered.
 */
"use strict";

var path = require("path");

// Name of the config file with .js extension
var name = "www";

var cfg = {
    // ID of this server
    id: name,
    // Host to bind to
    host: "0.0.0.0",
    // Port to bind to
    port: 3000, // We use the unused port 3000 from the master server range
    // Path to the key file
    key: path.join("certs", name + ".key.pem"),
    // Path to the cert file
    cert: path.join("certs", name + ".cert.pem"),
    // Path to our own API key file
    apiKey: path.join("keys", name),
    // Path to static content directory
    static: path.join("www", "static"),
    // Log file path
    logFile: path.join("logs", name + ".log"),
    // Informs the various tools what kind of config this is
    type: "www",
};

module.exports = cfg;
