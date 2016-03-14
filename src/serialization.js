"use strict";

/** Provides capabilities to serialize and deserialize objects to and from
 * strings while performing some specific tasks that are needed for Sosaria-
 * Online. Objects serialized may have circular references. All objects
 * referenced must have had their constructors registerd with the {@link
 * Serialization#register} function.
 * 
 * <pre>
 * Special properties and thier usage:
 * Σ U+03A3 UUID of the object.
 * Ψ U+03A8 Constructor name of the object.
 * Ω U+03A9 A string with this value represents the undefined value.
 * Θ U+0398 A string beginning with this value represents an object pointer.
 * Π U+03A0 Do Not Persist Object. If a property with this name exists on an
 *           object, regardless of its value, the object will be omitted from
 *           the output stream. As a conveniance, this character is exported as
 *           DO_NOT_PERSIST_OBJECT.
 * $ U+0024  Do Not Persist. If a property name starts with this character then 
 *           the property is ommitted from the object when writting to the
 *           output stream.
 * <pre>
 * @module Serialization
 */

var uuid = require("uuid");

// Property names that *really* shouldn't conflict
var DNPP = "$",
    OPID = "Θ",
    DNPO = "Π",
    UUID = "Σ",
    CTOR = "Ψ",
    UDEF = "Ω";

var serializedObjects = {};
var ctorFactory = {};

/** The object structure of the JSON string returned from
 * {@link module:Serialization#serialize}.
 * 
 * @typedef SerializedString
 * @type {Ojbect}
 * @property {String} root The root object's UUID
 * @property {Object} data Every object in the graph, keyed by UUID
 */

/** Serialize an object graph into a string representation.
 * 
 * @param {Object} obj The object graph to serialize.
 * @returns {SerializedString} A string containing the serialized representation
 *                             of the object graph.
 */
function serialize(obj) {
    serializedObjects = {};
    if(typeof obj !== "object" ||
        obj === null) {
        throw new Error("serialize() called on a non-object");
    }
    var root = _ser(obj);
    if(root === undefined ||
        root.length === undefined ||
        root.length < 1 ||
        root.charAt(0) !== OPID) {
        throw new Error("serialize() called on an object marked Do No Persist");
    }
    return JSON.stringify({
        root: root.substr(1),
        data: serializedObjects
    });
}

// Returns the serializeable form of a value, or undefined if the value is not
// serializable.
function _ser(val) {
    switch(typeof(val))
    {
        case "undefined":
            return UDEF;
        case "boolean":
        case "number":
        case "string":
            return val;
        case "object":
            if(val === null) {
                return val;
            }
            return _obj(val);
        default:
            return undefined;
    }
}

// Returns the uuid of the object in the serialization stream, or undefined if
// the object is not serializable.
function _obj(obj) {
    var isArray = Array.isArray(obj);
    
    // Check the Do Not Persist Object flag
    if(obj[DNPO] !== undefined) {
        return undefined;
    }
    
    // Bail if we've already seen this object
    var id = obj[UUID];
    if(id !== undefined &&
        serializedObjects[id] !== undefined) {
        return OPID + id;
    }
    
    // If the object has not been setup, do so now
    if(id === undefined) {
        Object.defineProperty(obj, UUID, {
            configurable: false,
            enumerable: false,
            value: uuid.v4(),
            writable: false
        });
        id = obj[UUID];
    }
    
    // Setup the serializable object
    var out = isArray ? [] : {};
    out[UUID] = id;
    
    // Do not persist the constructor for base Objects and Arrays. We don't need
    // to do anything special for them when resurecting.
    var ctor = obj.constructor.name;
    if(ctor !== "Object" &&
        !isArray) {
        out[CTOR] = ctor;
    }
    
    serializedObjects[id] = out;
    
    // Process all object properties
    for(var key in obj) {
        if(!obj.hasOwnProperty(key)) {
            continue;
        }
        
        // Check Do Not Persist Property flag
        if(!isArray &&
            key.charAt(0) === DNPP) {
            continue;
        }
        
        // Try to serialize the property
        var val = _ser(obj[key]);
        if(val !== undefined) {
            out[key] = val;
        }
    }
    
    return OPID + id;
}


/** Deserialize an object graph from a string representation.
 * 
 * @param {String} str The string representation of the object graph.
 * @param {Object} factory An object mapping constructor names to constructor
 *                         functions. Note that constructors will not be passed
 *                         any parameters.
 * @returns {Object} The object graph with prototypes restored.
 */
function deserialize(str, factory) {
    ctorFactory = factory;
    var data = JSON.parse(str);
    serializedObjects = data.data;
    var rootObject = serializedObjects[data.root];
    if(rootObject === undefined) {
        throw new Error("Unable to link root object");
    }
    for(var key in serializedObjects) {
        if(!serializedObjects.hasOwnProperty(key)) {
            continue;
        }
        _res(serializedObjects[key]);
    }
    return rootObject;
}

// Post-processes an object after deserialization
function _res(obj) {
    // Apply the constructor if nessecary
    var ctor = obj[CTOR];
    if(ctor !== undefined) {
        // Apply the constructor
        var ctorFunc = ctorFactory[ctor];
        if(ctorFunc === undefined) {
            throw new Error("Constructor " + ctor + " not found");
        }
        var desc = {};
        var keys = Object.getOwnPropertyNames(obj);
        for(var i = 0; i < keys.length; ++i) {
            desc[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
        }
        obj = Object.create(ctorFunc.prototype, desc);
    }
    
    // Fix up the UUID property
    Object.defineProperty(obj, UUID, {
        configurable: false,
        enumerable: false,
        value: obj[UUID],
        writable: false
    });
    
    // Fix up the CTOR property if needed
    if(ctor !== undefined) {
        // Fix up the property
        Object.defineProperty(obj, CTOR, {
            configurable: false,
            enumerable: false,
            value: ctor,
            writable: false
        });
    }
    
    // Fix up any object refrences and undefined values
    for(var key in obj) {
        if(!obj.hasOwnProperty(key)) {
            continue;
        }
        var prop = obj[key];
        if(typeof prop === "string" &&
            prop.length > 0) {
            if(prop === UDEF) {
                obj[key] = undefined;
            } else if(prop.charAt(0) === OPID) {
                var uuid = prop.substr(1);
                var other = serializedObjects[uuid];
                if(other === undefined) {
                    throw new Error("Unsatisfied object linkage to UUID " + uuid);
                }
                obj[key] = other;
            }
        }
    }
}

exports.serialize = serialize;
exports.deserialize = deserialize;
exports.DO_NOT_PERSIST_OBJECT = DNPO;
