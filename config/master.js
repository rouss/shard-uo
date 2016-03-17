/** Default Master / Login server configuration. Generally this file should not
 * be altered.
 */
"use strict";

var path = require("path");

// Name of the config file with .js extension
var name = "master";
// The base port for listeners. Typically increase this in increments of 10.
var basePort = 3000;

var cfg = {
    // ID of this server
    id: name,
    // The display name of this shard
    name: "Master",
    // The directories to load scripts from (recusively). WARNING: DO NOT
    // BLINDLY LOAD THE ./scripts DIRECTORY. All scripts will be active.
    scriptDirs: [
        path.join("scripts", "common"),
        path.join("scripts", name),
    ],
    // Path to the database directory
    dbPath: path.join("saves", name),
    // Endpoint configurations
    endpoints: {
        uop: { // UO packet endpoint
            host: "0.0.0.0",
            // Special port for the login server. This is the well-known RunUO
            // port that is built into most UO assistants.
            port: 2593,
        },
        cnc: { // Encrypted command and control endpoint
            host: "0.0.0.0",
            port: basePort + 1,
            key: path.join("certs", name + ".key.pem"),
            cert: path.join("certs", name + ".cert.pem"),
            apiKeys: "keys",
        },
    },
    // Information about how to connect to the master server
    masterConnector: {
        host: "0.0.0.0",
        port: 3001,
        apiKey: path.join("keys", name),
    },
    // The client version required to connect to the server
    requiredVersion: [ 7, 0, 49, undefined ],
    // Log file path
    logFile: path.join("logs", name + ".log"),
    // Informs the various tools what kind of config this is
    type: "shard",
};

module.exports = cfg;
