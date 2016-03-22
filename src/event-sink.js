"use strict";

var ReloadableScriptCollection = require("./reloadable-script-collection"),
    ctorManager = require("./ctor-manager"),
    uuid = require("uuid");

/** Provides an evented messaging services similar to EventEmitter. This class
 * is designed to provide script management for scripts that are designed to
 * be reloaded at runtime. Furthermore event dispatching is handled somewhat
 * differently to EventEmitter. First, all event handlers are checked for
 * exceptions. An exception in an emit handler pool will not impact the rest of
 * the handlers in the pool. Secondly, if an event handler function returns any
 * value other than undefined, the handler pool will stop execution and the
 * value will be returned to the emit() caller. Finally there is an inversion
 * of responsibilities with EventSink. The scripts managed by this class are
 * subscribed to events. The emit() funciton is a public interface. There is no
 * public interface for another entity to subscribe to events on the EventSink.
 * These differences are inteded to provide an event messaging pattern suitable
 * for implementing complex, emergent behavior.
 * 
 * @class EventSink
 */
function EventSink() {
    /// The collection of all scripts that subscribe to events on this sink
    this.scripts = new ReloadableScriptCollection(config.scriptDirs, false);
    /// Map of subscription pools
    this.subs = {};
    /// Map of all timers
    this.timers = {};
    /// If true blocks all event emissions
    this.doNotEmit = false;
}

// Internal function to clear all registered timers in a given map
function clearTimers(map) {
    for(var k in map) {
        if(!map.hasOwnProperty(k)) {
            continue;
        }
        var timer = map[k];
        if(timer.isInterval) {
            clearInterval(timer.timer);
        } else {
            clearTimeout(timer.timer);
        }
    }
}

/** Forces a reload of all scripts.
 */
EventSink.prototype.reload = function() {
    log.info("Event scripts reloading");
    
    this.doNotEmit = true;
    var oldSubs = this.subs;
    this.subs = {};
    var oldTimers = this.timers;
    this.timers = {};
    
    ctorManager.beforeReload();
    if(!this.scripts.reload()) {
        this.subs = oldSubs;
        clearTimers(this.timers);
        this.timers = oldTimers;
        ctorManager.afterReloadFailed();
        this.doNotEmit = false;
        return;
    }
    clearTimers(oldTimers);
    ctorManager.afterReload();
    this.doNotEmit = false;
};

/** Set a one-shot timer.
 * 
 * @param {String} event Event name to fire after the delay
 * @param {Object} param The parameter object to emit with the event
 * @param {Number} delay The delay in miliseconds (approximate). Use the
 *   @{link module:Time} module to calculate this value.
 */
EventSink.prototype.setTimeout = function(event, param, delay) {
    var self = this;
    var id = uuid.v4();
    var timer = setTimeout(function() {
        delete self.timers[id];
        self.emit(event, param);
    }, delay);
    this.timers[id] = {
        timer: timer,
        event: event,
        param: param,
        delay: delay,
        isInterval: false
    };
};

/** Set a recurring timer.
 * 
 * @param {String} event Event name to fire after the delay
 * @param {Object} param The parameter object to emit with the event
 * @param {Number} delay The delay in miliseconds (approximate) between
 *   ocurrences. Use the @{link module:Time} module to calculate this value.
 * @param {Boolean} immediate Optional, defaults to false. If true, fire the
 *   event once immediately.
 */
EventSink.prototype.setInterval = function(event, param, delay, immediate) {
    var self = this;
    var id = uuid.v4();
    var timer = setInterval(function() {
        self.emit(event, param);
    }, delay);
    this.timers[id] = {
        timer: timer,
        event: event,
        param: param,
        delay: delay,
        isInterval: true
    };
    if(immediate) {
        setImmediate(function(){self.emit(event, param);});
    }
};

/** Subscribe to an event.
 * 
 * @param {String} name The name of the event to subscribe to
 * @param {Function} func The function to call when the event is published
 */
EventSink.prototype.on = function(name, func) {
    if(this.subs[name] === undefined) {
        this.subs[name] = [];
    }
    this.subs[name].push(func);
};

/** Publish an event, and execute all functions subscribed to that event. If
 * an error occurs in any individual subscirber function it will be logged and
 * execution will continue with the next subscriber.
 * 
 * @param {String} name The name of the event being published
 * @param {Obect} param The single parameter to pass to subscriber functions.
 *   Note that this differs from Node's EventEmitter.emit() function which
 *   allows an arbitrary number of arguments to be passed to the subscriber
 *   functions.
 * @returns {Object} The return value of the first subscriber function to
 *   return something other than undefined, or undefined. This is typically
 *   used to short-circut the execution of an event pool.
 */
EventSink.prototype.emit = function(name, param) {
    if(this.doNotEmit) {
        return;
    }
    var subs = this.subs[name];
    if(subs === undefined ||
        subs.length === 0) {
        return undefined;
    }
    var pool = subs.slice();
    for(var i = 0; i < pool.length; ++i) {
        var ret = undefined;
        var func = pool[i];
        try {
            ret = func(param);
        } catch(e) {
            log.error("Error in event subscriber " + name + " : " + e.stack);
            break;
        }
        if(ret !== undefined) {
            return ret;
        }
    }
    return undefined;
};

module.exports = EventSink;
