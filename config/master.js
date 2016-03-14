/** Configuration information specific to the Master Server delpoyment.
 */
"use strict";

var path = require("path");

var cfg = {
    // The name of this shard
    name: "Master",
    // The directories to load scripts from (recusively). WARNING: DO NOT
    // BLINDLY LOAD THE ./scripts DIRECTORY. All scripts will be active.
    scriptDirs: [
        path.join("scripts", "base"),
        path.join("scripts", "master"),
    ],
    // Endpoint configurations
    endpoints: {
        uop: { // UO packet endpoint
            host: "0.0.0.0",
            port: 2593 // Use the well-known RunUO port
        },
        cnc: { // Encrypted Command and Control endpoint
            host: "0.0.0.0",
            port: 3001,
            key: path.join("certs", "master.key.pem"),
            cert: path.join("certs", "master.pem"),
        },
    },
    // The client version required to connect to the server
    requiredVersion: [ 7, 0, 49, undefined ]
};

// Database directory
cfg.dbPath = path.join("saves", cfg.name);

module.exports = cfg;
