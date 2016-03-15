/** Example configuration file. To create a Shard server configuration file,
 * make a copy of this file and place it in the config directory.
 */
"use strict";

var path = require("path");

var cfg = {
    // The name of this shard
    name: "Test Center",
    // The directories to load scripts from (recusively). WARNING: DO NOT
    // BLINDLY LOAD THE ./scripts DIRECTORY. All scripts will be active.
    // This would load scripts intended to only run on the master server
    // with scripts intended to only run on the game server.
    scriptDirs: [
        path.join("scripts", "base")
    ],
    // Path to the database directory
    dbPath: path.join("saves", "testcenter"),
    // Endpoint configurations
    endpoints: {
        uop: { // UO packet endpoint
            host: "0.0.0.0",
            port: 3100
        },
        cnc: { // Encrypted command and control endpoint
            host: "0.0.0.0",
            port: 3101,
            key: path.join("certs", "testcenter.key.pem"),
            trustedKeys: path.join("certs", "trusted", "cnc"),
        },
        shell: { // Encrypted admin shell endpoint
            host: "0.0.0.0",
            port: 3102,
            key: path.join("certs", "testcenter.key.pem"),
            trustedKeys: path.join("certs", "trusted", "shell"),
        },
    },
    // Information about how to connect to the master server
    masterConnector: { host: "0.0.0.0", port: 3001 },
    // The client version required to connect to the server
    requiredVersion: [ 7, 0, 49, undefined ]
};

// Database directory
cfg.dbPath = path.join("saves", cfg.name);

module.exports = cfg;
