"use strict";

var pkg = require("./package"),
    Getopt = require("node-getopt"),
    Shard = require("./src/shard");

var getopt = new Getopt([
    ['h', 'help',       'Display this help'],
    ['v', 'version',    'Print version and exit']
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
    "                 default\n" +
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
} else {
    // Set up the configuration system
    require("./src/config")(opt.argv[0]);
    
    // These modules provide globals, so we pre-load them
    require("./src/serialization");
    require("./src/extensions");
    require("./src/log");
    require("./src/store");
    
    // Create and start a shard process
    global.shard = Shard.create();
    global.events = global.shard.eventSink;
    require("./src/packets").reload();
    global.shard.start();    
}
