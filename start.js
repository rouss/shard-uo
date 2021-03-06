"use strict";

var pkg = require("./package"),
    Getopt = require("node-getopt");

var getopt = new Getopt([
    ['p', 'print-config',   'Dumps the configuration information to stdout and exits. Used by some utility scripts.'],
    ['h', 'help',           'Display this help'],
    ['v', 'version',        'Print version and exit']
]);

getopt.setHelp(
    "Usage: node start [OPTIONS] shard_name\n" +
    "    Shard server startup script. This script will start a Shard server loading\n" +
    "    the named shard configuration. As starting a Shard server involves certain\n" +
    "    JavaScript object creation and manipulation, this script should always be\n" +
    "    used.\n" +
    "\n" +
    "  shard_name     The name of the shard to start. This must match the name of a\n" +
    "                 configuration file (minus extension) in ./config other than\n" +
    "                 example\n" +
    "[[OPTIONS]]\n" +
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

if(opt.argv.length !== 1) {
    getopt.showHelp();
    process.exit(1);
}

// Set up the configuration system
require("./src/config")(opt.argv[0]);

if(opt.options['print-config']) {
    printConfigObject(config, "");
} else {
    switch(config.type) {
        case "shard":
            // These modules provide globals, so we pre-load them
            require("./src/serialization");
            require("./src/extensions");
            require("./src/log");
            require("./src/store");
            require("./src/time.js");
            require("./src/random.js");
            
            // Refresh public IP address
            require("./src/public-ip-lookup");

            // Create and start a shard process
            global.shard = require("./src/shard").create();
            global.events = global.shard.eventSink;
            require("./src/packets").reload();
            global.shard.start();
            break;
        case "www":
            require("./www/server");
            break;
    }
}

function printConfigObject(obj, parentName) {
    for(var k in obj) {
        if(!obj.hasOwnProperty(k)) {
            continue;
        }
        
        var name;
        if(parentName !== "") {
            name = parentName + "." + k;
        } else {
            name = k;
        }
        
        var val = obj[k];
        if(typeof val === "function") {
            continue;
        } else if(typeof val === "object" &&
            val !== null) {
            printConfigObject(val, name);
        } else {
            if(typeof val === "undefined") {
                console.log(name + " undefined");
            } else if(val === null) {
                console.log(name + " null");                
            } else {
                console.log(name + " " + val.toString());
            }
        }
    }
}