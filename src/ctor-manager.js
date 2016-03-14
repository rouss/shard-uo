"use strict";

/** Provides constructor management capabilities.
 * 
 * @module CtorManagement
 */

/// The map of constructors
var ctors = {};
var oldCtors = {};
var seenProtos = {};

/** Registers a constructor function. Note that constructors MUST have a globaly
 * unique name.
 * 
 * @param {Function} ctor The constructor function to register.
 */
function register(ctor) {
    var name = ctor.name;
    if(ctors[name] !== undefined) {
        throw new Error("Duplicate constructor " + name);
    }
    if(typeof ctor !== "function") {
        throw new Error(name + " does not appear to be a constructor");
    }
    ctors[name] = ctor;
}

/** Call this before a script reload.
 */
function beforeReload() {
    oldCtors = ctors;
    ctors = {};
}

/** Call this after a script reload to rewire constructor prototypes.
 */
function afterReload() {
    for(var k in ctors) {
        if(!ctors.hasOwnProperty(k)) {
            continue;
        }
        var ctor = ctors[k];
        if(!seenProtos.hasOwnProperty(k)) {
            seenProtos[k] = ctor.prototype;
        }
        var proto = seenProtos[k];
        var newp = ctor.prototype;
        var l;
        for(l in proto) {
            if(!proto.hasOwnProperty(l)) {
                continue;
            }
        }
        for(l in newp) {
            if(!newp.hasOwnProperty(l)) {
                continue;
            }
            proto[l] = newp[l];
        }
        ctor.prototype = proto;
    }
    exports.ctors = ctors;
}

/** Call this after a reload failure.
 */
function afterReloadFailure() {
    ctors = oldCtors;
    exports.ctors = ctors;
}

exports.register = register;
exports.ctors = ctors;
exports.beforeReload = beforeReload;
exports.afterReload = afterReload;
exports.afterReloadFailure = afterReloadFailure;

// Convenience globals
global.ctor = register;
