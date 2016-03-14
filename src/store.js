"use strict";

/** Provides persistent storage capabilities.
 * 
 * @module Store
 */

var levelup = require("levelup"),
    serialization = require("./serialization"),
    ctorManager = require("./ctor-manager");

var db;

/** Initialize the module and data store.
 */
exports.init = function(path) {
    db = levelup(path);
};

// Error checking function for db.put
function putErrorCheck(err) {
    if(err) {
        log.error("Persistence put error: " + err);
    }
}

/** Stores a value by key.
 * 
 * @param {String} key The key to store the value under.
 * @param {Object} value The value to store.
 */
exports.put = function(key, value) {
    if(key === null || key === undefined) {
        log.error("Undefined key in store.put call");
        return;
    }
    
    var v;
    try {
        v = serialization.serialize(value);
    } catch(e) {
        log.error("Serialization error: " + v.stack);
        return;
    }
    db.put(key, v, putErrorCheck);
};

/** Gets a value by key.
 * 
 * @param {String} key The key of the value to get.
 * @param {Function} cb A callback function called with the value. If the
 *   value is not found in the datastore the callback will be called with
 *   the undefined value.
 */
exports.get = function(key, cb) {
    if(key === null || key === undefined) {
        log.error("Undefined key in store.get call");
        cb(undefined);
        return;
    }
    
    db.get(key, function(err, value) {
        if(err) {
            if(err.notFound) {
                cb(undefined);
            } else {
                log.error("Persistence get error: " + err);                
            }
        } else {
            var v;
            try {
                v = serialization.deserialize(value, ctorManager.ctors);
            } catch(e) {
                log.error("Deserialization error: " + e.stack);
                cb(undefined);
                return;
            }
            cb(v);
        }
    });
};

// Global accessor
global.database = {
    put: module.exports.put,
    get: module.exports.get
};
