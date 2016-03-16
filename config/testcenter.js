/** Example configuration file. To create a Shard server configuration file,
 * make a copy of this file and place it in the config directory.
 */
"use strict";

var path = require("path");

// The simple name of the shard, usually the same as the file name without ext.
var name = "testcenter";
// The base port for listeners. Typically increase this in increments of 10.
var basePort = 3010;

var cfg = {
    // The display name of this shard
    name: "Test Center",
    // The directories to load scripts from (recusively). WARNING: DO NOT
    // BLINDLY LOAD THE ./scripts DIRECTORY. All scripts will be active.
    scriptDirs: [
        path.join("scripts", "base"),
        path.join("scripts", name),
    ],
    // Path to the database directory
    dbPath: path.join("saves", name),
    // Endpoint configurations
    endpoints: {
        uop: { // UO packet endpoint
            host: "0.0.0.0",
            port: basePort,
        },
        cnc: { // Encrypted command and control endpoint
            host: "0.0.0.0",
            port: basePort + 1,
            key: path.join("certs", "shards", name),
            trustedKeys: path.join("certs", "auth_cnc"),
        },
        shell: { // Encrypted admin shell endpoint
            host: "0.0.0.0",
            port: basePort + 2,
            key: path.join("certs", "shards", name),
            trustedKeys: path.join("certs", "auth_shell"),
        },
    },
    // Information about how to connect to the master server
    masterConnector: { host: "0.0.0.0", port: 3001 },
    // The client version required to connect to the server
    requiredVersion: [ 7, 0, 49, undefined ],
    // Log file path
    logFile: path.join("logs", name + ".log"),
};

module.exports = cfg;
