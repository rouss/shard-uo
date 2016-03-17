"use strict";

var crypto = require("crypto"),
    MersenneTwister = require('mersenne-twister'),
    generator = new MersenneTwister();

/** Exposes a global random module.
 * 
 * @module Random
 */

/** Generates a cryptographically-strong 32-bit integer. This function is much
 * more costly than the other random functions and should only be used when
 * generating a cryptographic key.
 * 
 * @returns {Random} A random 32-bit integer.
 */
function cryptoInt() {
    var buf = crypto.randomBytes(4);
    return buf[0] | (buf[1] << 8) | (buf[2] << 16) | (buf[3] << 24);
}

/** Generates a random integer within an optional range. If two parameters are
 * given, they are assumed to be start and end. If only one parameter is given,
 * start is assumed to be 0 and the parameter is assumed to be end. If no
 * parameters are given, start is assumed to be 0 and end is assumed to be
 * 2^32.
 * 
 * @param {Number} start The lowest value that can be returned.
 * @param {Number} end The upper bound. Only values less than this value will
 *   be returned.
 * @returns {Number} A random number.
 */
function int(start, end) {
    if(end === undefined) {
        if(start === undefined) {
            return generator.random_int();
        }
        return (generator.random_int() % start) | 0;
    }
    return ((generator.random_int() % (start - end)) + start) | 0;
}

/** Generates a random double equal to or greater than zero but less than one.
 * 
 * @returns {Number} A random double equal to or greater than zero but less
 *   than one.
 */
function double() {
    return generator.random();
}

/** Generates a random boolean value.
 * 
 * @returns A random boolean value.
 */
function bool() {
    return (generator.random_int() & 0x1) === 0x1;
}

/** Checks a percentage chance.
 * 
 * @param {Number} chance The percentage change of success.
 * @returns {Boolean} True if the percentage roll succeeded, false otherwise.
 */
function percent(chance) {
    return int(0, 100) < chance;
}

global.random = {
    cryptoInt: cryptoInt,
    int: int,
    double: double,
    bool: bool,
    percent: percent,
};
