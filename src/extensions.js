"use strict";

/*jshint freeze:false */

/** @file Contains all extension methods used in the product.
 */

/** Converts the number to an upper=case hexidecimal string of the given length,
 * possibly truncating significant digits. No leading markers are given.
 * 
 * @param {Number} len The length of the output string
 * @return {String} An upper-case hexidecimal string representation of the
 *                  number, truncated or zero-padded to the given length.
 */
Number.prototype.toHex = function(len) {
    var str = this.toString(16);
    str = str.toUpperCase();
    str = str.substr(0, len);
    while(str.length < len) {
        str = "0" + str;
    }
    return str;
};

/*jshint freeze:true */
