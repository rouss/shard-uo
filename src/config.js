"use strict";

/** Provides process-wide reloadable configuration capabilities. The first time
 * this module is required it will be a function that takes a single parameter,
 * the configuration file to load. After calling this function once the module
 * reference will be the configuration object.
 * 
 * @module Config
 */

var path = require("path");

var configPath;
var haveLoaded = false;
var currentCfg = {};

function reload() {
    if(global.log) {
        log.info("Configuration reloading");
    }
    var newCfg;
    try {
        newCfg = require("require-reload")(configPath);
    } catch(e) {
        if(!haveLoaded) {
            throw e;
        }
        if(global.log) {
            log.error("Error while loading configuration: " + e.stack);
        }
        return;
    }
    
    if(!haveLoaded) {
        module.exports = {};
        haveLoaded = true;
    }
    
    var k;
    for(k in currentCfg) {
        if(!currentCfg.hasOwnProperty(k)) {
            continue;
        }
        delete module.exports[k];
    }
    
    for(k in newCfg) {
        if(!newCfg.hasOwnProperty(k)) {
            continue;
        }
        module.exports[k] = newCfg[k];
    }
    
    currentCfg = newCfg;
    currentCfg.reload = reload;
    module.exports.reload = reload;
}

module.exports = function(config) {
    configPath = path.join("..", "config", config);

    // Global
    reload();
    module.exports = currentCfg;
    global.config = module.exports;
    module.exports.reload = reload;
};

