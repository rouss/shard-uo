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
    scriptDirs: [
        path.join("scripts", "base")
    ],
    // Endpoint configurations
    endpoints: {
        uop: { // UO packet endpoint
            host: "0.0.0.0",
            port: 3100
        },
        cnc: { // Encrypted Command and Control endpoint
            host: "0.0.0.0",
            port: 3101,
            key: path.join("certs", "testcenter.key.pem"),
            cert: path.join("certs", "testcenter.pem"),
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
