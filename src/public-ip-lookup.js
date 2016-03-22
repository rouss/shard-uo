"use static";

/** This module will look for a cached IP address file on the local system
 * containing the local IP address. If this is not found or is stale, it will
 * discover the public IP address of the local machine and cache it. The
 * export of this module is an object with the properties "address", which is
 * a string containing the address in IPv4 notation, and ipv4, which is a
 * number array containing the IPv4 address (index 0 is the high-order octet).
 * A require on this module is SYNCHRONUS.
 * 
 * @module PublicIpLookup
 */

var fs = require("fs"),
    request = require('sync-request');

var reload = false;
try {
    var stats = fs.statSync("publicAddress");
    if(!stats.isFile()) {
        throw 1;
    }
    if(stats.ctime.getTime() < Date.now() - 1000 * 60 * 60 * 24) {
        fs.unlinkSync("publicAddress");
        throw 2;
    }
} catch(e) {
    reload = true;
}

if(reload) {
    log.info("Updating public IP address");
    var res = request("GET", "http://ipecho.net/plain");
    fs.writeFileSync("publicAddress", res.getBody());
}

var address = fs.readFileSync("publicAddress").toString("utf8");
var octets = address.split(".");
if(octets.length !== 4) {
    log.error("Public IP address has incorrect format");
    throw new Error("Public IP address has incorrect format");
}
var ipv4 = [];
ipv4[0] = parseInt(octets[0]);
ipv4[1] = parseInt(octets[1]);
ipv4[2] = parseInt(octets[2]);
ipv4[3] = parseInt(octets[3]);

exports.address = address;
exports.ipv4 = ipv4;
