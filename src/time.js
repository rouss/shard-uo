"use strict";

/** Exposes an efficient timestamp creation and comparison library as a global.
 * 
 * @module Time
 */

var ts;

// Internal function to invalidate the current timestamp
function invalidate() {
    ts = undefined;
}

/** Returns the current time as a Unix timestamp (count of miliseconds since
 * 1970/1/1 in UTC).
 * 
 * @returns {Number} The current time as a Unix timestamp.
 */
function now() {
    // Update the timestamp if needed
    if(ts === undefined) {
        ts = Date.now();
        setImmediate(invalidate);
    }
    return ts;
}

/** Returns the number of miliseconds in the given number of seconds.
 * 
 * @param {Number} val The number of seconds to convert
 * @returns {Number} The number of miliseconds in the given number of seconds
 */
function seconds(val) {
    return (val * 1000) | 0;
}

/** Returns the number of miliseconds in the given number of minutes.
 * 
 * @param {Number} val The number of minutes to convert
 * @returns {Number} The number of miliseconds in the given number of minutes
 */
function minutes(val) {
    return (val * 1000 * 60) | 0;
}

/** Returns the number of miliseconds in the given number of hours.
 * 
 * @param {Number} val The number of hours to convert
 * @returns {Number} The number of miliseconds in the given number of hours
 */
function hours(val) {
    return (val * 1000 * 60 * 60) | 0;
}

/** Returns the number of miliseconds in the given number of days.
 * 
 * @param {Number} val The number of days to convert
 * @returns {Number} The number of miliseconds in the given number of days
 */
function days(val) {
    return (val * 1000 * 60 * 60 * 24) | 0;
}

global.time = {
    now: now,
    seconds: seconds,
    minutes: minutes,
    hours: hours,
    days: days,
};
