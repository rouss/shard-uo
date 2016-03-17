"use strict";

// Utility script to send CNC commands to local nodes

var https = require("https"),
    fs = require("fs"),
    path = require("path"),
    pkg = require("./package"),
    Getopt = require("node-getopt");

var getopt = new Getopt([
    ['h', 'help',           'Display this help'],
    ['v', 'version',        'Print version and exit']
]);

getopt.setHelp(
    "Usage: node command [OPTIONS] shard_name command\n" +
    "  Shard server command script. This script will send a command and control\n" +
    "  request to the named shard assuming it is running on the localhost.\n" +
    "\n" +
    "  shard_name     The name of the shard to command. This must match the name\n" +
    "                 of a configuration file (minus extension) in ./config other\n" +
    "                 than example\n" +
    "  command        The name of the command to execute. See the COMMANDS section\n" +
    "                 for details.\n" +
    "[[OPTIONS]]\n" +
    "\n" +
    "COMMANDS - Note that command names are CASE SENSETIVE\n" +
    "  Reload         Force a reload of the shard's configuration file, packet\n" +
    "                 handlers, and scripts.\n" +
    "  Shutdown       Start a graceful shutdown of the shard.\n" +
    "  Kill           Start a forceful shutdown of the shard.\n" +
    "  Ping           Ping the server (via the CNC channel).\n" +
    "\n" +
    "Installation.... git clone https://github.com/qbradq/shard-uo.git\n" +
    "Repository...... " + pkg.repository.url + "\n" +
    "License......... " + pkg.license + "\n" +
    "Version......... " + pkg.version
);

var opt = getopt.parseSystem();
if(opt.options.help) {
    getopt.showHelp();
    process.exit(0);
} else if(opt.options.version) {
    console.log(pkg.version);
    process.exit(0);
}

if(opt.argv.length !== 2 ||
    opt.argv[0] === "example") {
    getopt.showHelp();
    process.exit(1);
}

var shardName = opt.argv[0];
var command = opt.argv[1];
var validCommands = ["Reload", "Shutdown", "Kill", "Ping"];

if(validCommands.indexOf(command) < 0) {
    getopt.showHelp();
    process.exit(2);
}

try {
    fs.accessSync(path.join("config", shardName + ".js"));
} catch(e) {
    console.log("Shard configuration not found for " + shardName);
    process.exit(3);
}

// Import the requested shard's configuration
require("./src/config")(opt.argv[0]);

var apiKey;
try {
    apiKey = fs.readFileSync(path.join("keys", shardName)).toString("utf8").trim();
} catch(e) {
    console.log("Unable to read API key file");
    process.exit(4);
}

var req = https.request({
    host: "localhost",
    port: config.endpoints.cnc.port,
    path: "/",
    method: "POST",
    headers: {
        "api-key-name": shardName,
        "api-key-value": apiKey
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
            obj = JSON.parse(str);
        }
        if(obj &&
            obj.value) {
            console.log(res.statusCode + ": " + obj.value);
        } else {
            console.log(res.statusCode);
        }
    });
});

req.end('{"command":"' + command + '"}');
