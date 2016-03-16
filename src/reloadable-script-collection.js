"use strict";

/* jshint -W079 */
var fs = require("fs"),
    path = require("path"),
    log = require('./log');
/* jshint +W079 */

/** Manages a collection of scripts that can be reloaded on demand and
 * whenever the global reload event fires. Please note that the reload() method
 * must be called to load the scripts after the object is created.
 * 
 * @class ReloadableScriptCollection
 * @param {String[]} paths An array of paths in which to search for scripts to
 *   to be loaded from.
 * @param {Boolean} autoReload If true, automatically reload all scripts when
 *   the global reload event fires.
 */
function ReloadableScriptCollection(paths, autoReload) {
    /// The paths array to load from
    this.paths = paths;
    /// The current collection of scripts
    this.scripts = [];
    /// If true, we have never loaded anything yet
    this.firstLoad = true;
    
    if(autoReload) {
        var self = this;
        events.on("reload", function() {
            self.reload();
        });
    }
}

// Internal function to load all the scripts out of a directory
function loader(dir, reloadContext) {
    var modules = [];
    var paths;
    try {
        paths = fs.readdirSync(dir);
    } catch(e) {
        if(e.code === "ENOENT") {
            return;
        }
        throw e;
    }
    for(var i = 0; i < paths.length; ++i) {
        var fullPath = path.join(dir, paths[i]);
        fullPath = path.resolve(fullPath);
        
        var stat = fs.statSync(fullPath);
        if(stat.isDirectory()) {
            modules = modules.concat(loader(fullPath, reloadContext));
        } else if(stat.isFile() &&
            path.extname(fullPath) === ".js") {
            var module;
            try {
                module = require('require-reload')(fullPath);                
            } catch(e) {
                log.error("Failed to load script " + fullPath + " : " + e.stack);
                ++reloadContext.errors;
            }
            if(module !== undefined) {
                modules.push(module);
            }
        }
    }
    return modules;
}

/** Attempts to reload all scripts managed by this collection. Any errors
 * encountered while loading a script will be logged. If any script has an
 * error while loading, the existing collection of scripts will be retained.
 * An error during the first load will result in a throw. Please keep in mind
 * that this entire method is synchronous.
 * 
 * @returns True if the reload was successful, false otherwise.
 */
ReloadableScriptCollection.prototype.reload = function() {
    var reloadContext = {
        errors: 0
    };
    var modules = [];
    for(var i = 0; i < this.paths.length; ++i) {
        var fullPath = path.resolve(this.paths[i]);
        modules = modules.concat(loader(fullPath, reloadContext));
    }
    if(reloadContext.errors === 0) {
        this.scripts = modules;
        this.firstLoad = false;
        return true;
    }
    
    if(this.firstLoad) {
        throw new Error("Failed to load script collection, see log for details.");
    }
    return false;
};

module.exports = ReloadableScriptCollection;
