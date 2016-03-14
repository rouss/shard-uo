"use strict";

/** A special buffer subclass with convenience functions for manipulating Ultima
 * Online buffers.
 * 
 * @constructor
 */
function PacketBuffer() {
    /// The base Buffer object
    this.buffer = new Buffer(64 * 1024);
    /// The current read offset
    this.offset = 0;
    /// The current write offset
    this.end = 0;
}

/** Appends a buffer into the PacketBuffer.
 * 
 * @param {Buffer} buf The buffer to append
 */
PacketBuffer.prototype.append = function(buf) {
    buf.copy(this.buffer, this.end, 0, buf.length);
    this.end += buf.length;
};

/** Clears all previously read data from the buffer making room for new data.
 */
PacketBuffer.prototype.flush = function() {
    var l = this.length();
    if(l > 0) {
        this.buffer.copy(this.buffer, 0, this.offset, l);
    }
    this.offset = 0;
    this.end = l;
};

/** Gets the length of data waiting to be read from the buffer.
 * 
 * @returns {Number} The length in bytes of the data waiting in the buffer
 */
PacketBuffer.prototype.length = function() {
    return this.end - this.offset;
};

/** Gets a Buffer object representing the data waiting to be read from the
 * buffer.
 * 
 * @returns {Buffer} A Buffer object representing the data waiting in the buffer
 */
PacketBuffer.prototype.activeSlice = function() {
    return this.buffer.slice(this.offset, this.end);
};

/** Removes all data from the buffer.
 */
PacketBuffer.prototype.clear = function() {
    this.offset = this.end = 0;
};

/** Returns the data waiting in the buffer as a string formatted as a hex and
 * ascii dump similar to hex editors. This function is not optimized and should
 * only be used for development purposes.
 * 
 * @returns {String} The hex/ascii representation of the data waiting in the
 *                   buffer.
 */
PacketBuffer.prototype.dump = function() {
    var ret = "";
    var bank = 0;
    var dataStr = "";
    var asciiStr = "";
    var bankStr = "";
    for(var i = this.offset; i < this.end; ++i) {
        var col = i % 16;
        if(i !== 0 && col === 0) {
            bankStr = bank.toString(16);
            while(bankStr.length < 3) {
                bankStr = "0" + bankStr;
            }
            bankStr += "0";
            while(dataStr.length < 32) {
                dataStr += "  ";
            }
            while(asciiStr.length < 16) {
                asciiStr += " ";
            }
            ret += bankStr + "|" + dataStr + "|" + asciiStr + "\n";
            ++bank;
        }
        var byte = this.buffer.readUInt8(i);
        var data = byte.toString(16);
        if(data.length === 1) {
            data = "0" + data;
        }
        dataStr += data;
        if(col !== 15) {
            dataStr += " ";
        }
        var chr;
        if(byte >= 0x20 && byte <= 0x7f) {
            chr = String.fromCharCode(byte);
        } else {
            chr = ".";
        }
        asciiStr += chr;
    }
    if(dataStr.length > 0) {
        bankStr = bank.toString(16);
        while(bankStr.length < 3) {
            bankStr = "0" + bankStr;
        }
        bankStr += "0";
        while(dataStr.length < 47) {
            dataStr += "  ";
        }
        while(asciiStr.length < 16) {
            asciiStr += " ";
        }
        ret += bankStr + "|" + dataStr + "|" + asciiStr + "\n";
    }
    return ret;
};

/** Reads an 8-bit unsigned number from the buffer.
 * 
 * @returns {Number} The value read
 */
PacketBuffer.prototype.readUInt8 = function() {
    var ret = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return ret;
};

/** Reads an 8-bit signed number from the buffer.
 * 
 * @returns {Number} The value read
 */
PacketBuffer.prototype.readInt8 = function() {
    var ret = this.buffer.readInt8(this.offset);
    this.offset += 1;
    return ret;
};

/** Reads a 16-bit unsigned number in Big Endian format from the buffer.
 * 
 * @returns {Number} The value read
 */
PacketBuffer.prototype.readUInt16 = function() {
    var ret = this.buffer.readUInt16BE(this.offset);
    this.offset += 2;
    return ret;
};

/** Reads a 16-bit signed number in Big Endian format from the buffer.
 * 
 * @returns {Number} The value read
 */
PacketBuffer.prototype.readInt16 = function() {
    var ret = this.buffer.readInt16BE(this.offset);
    this.offset += 2;
    return ret;
};

/** Reads a 32-bit unsigned number in Big Endian format from the buffer.
 * 
 * @returns {Number} The value read
 */
PacketBuffer.prototype.readUInt32 = function() {
    var ret = this.buffer.readUInt32BE(this.offset);
    this.offset += 4;
    return ret;
};

/** Reads a 32-bit signed number in Big Endian format from the buffer.
 * 
 * @returns {Number} The value read
 */
PacketBuffer.prototype.readInt32 = function() {
    var ret = this.buffer.readInt32BE(this.offset);
    this.offset += 4;
    return ret;
};

/** Reads a string in ASCII format from the buffer.
 * 
 * @param {Number} length The padded byte length of the string
 * @returns {String} The string read
 */
PacketBuffer.prototype.readAsciiString = function(length) {
    var ret = this.buffer.toString("ascii", this.offset, this.offset + length);
    var end = ret.indexOf("\0");
    ret = ret.substr(0, end);
    this.offset += length;
    return ret;
};

/** Reads a string in UTF16 format from the buffer.
 * 
 * @param {Number} length The padded byte length of the string
 * @returns {String} The string read
 */
PacketBuffer.prototype.readUnicodeString = function(length) {
    var ret = this.buffer.toString("utf16", this.offset, this.offset + length);
    var end = ret.indexOf("\0");
    ret = ret.substr(0, end);
    this.offset += length;
    return ret;
};

/** Ignores a number of bytes from the stream efficiently.
 * 
 * @param {Number} length The number of bytes to ignore
 */
PacketBuffer.prototype.ignore = function(length) {
    this.offset += length;
};

/** Writes an 8-bit unsigned number to the buffer.
 * @param {Number} v The number to write
 */
PacketBuffer.prototype.writeUInt8 = function(v) {
    this.buffer.writeUInt8(v, this.end);
    this.end += 1;
};

/** Writes an 8-bit signed number to the buffer.
 * @param {Number} v The number to write
 */
PacketBuffer.prototype.writeInt8 = function(v) {
    this.buffer.writeInt8(v, this.end);
    this.end += 1;
};

/** Writes an 16-bit unsigned number in Big Endian format to the buffer.
 * @param {Number} v The number to write
 */
PacketBuffer.prototype.writeUInt16 = function(v) {
    this.buffer.writeUInt16BE(v, this.end);
    this.end += 2;
};

/** Writes an 16-bit signed number in Big Endian format to the buffer.
 * @param {Number} v The number to write
 */
PacketBuffer.prototype.writeInt16 = function(v) {
    this.buffer.writeInt16BE(v, this.end);
    this.end += 2;
};

/** Writes an 32-bit unsigned number in Big Endian format to the buffer.
 * @param {Number} v The number to write
 */
PacketBuffer.prototype.writeUInt32 = function(v) {
    this.buffer.writeUInt32BE(v, this.end);
    this.end += 4;
};

/** Writes an 32-bit signed number in Big Endian format to the buffer.
 * @param {Number} v The number to write
 */
PacketBuffer.prototype.writeInt32 = function(v) {
    this.buffer.writeInt32BE(v, this.end);
    this.end += 4;
};

/** Writes a string to the buffer encoded as ASCII.
 * 
 * @param {String} v The string to write
 * @param {Number} length The byte length of the padded field
 */
PacketBuffer.prototype.writeAsciiString = function(v, length) {
    var writeLength = Buffer.byteLength(v, "ascii");
    this.buffer.write(v, this.end, writeLength, "ascii");
    this.buffer.fill(0, this.end + writeLength, this.end + length);
    this.end += length;
};

/** Writes a string to the buffer encoded as UTF16.
 * 
 * @param {String} v The string to write
 * @param {Number} length The byte length of the padded field
 */
PacketBuffer.prototype.writeUnicodeString = function(v, length) {
    var writeLength = Buffer.byteLength(v, "utf16");
    this.buffer.write(v, this.end, length, "utf16");
    this.buffer.fill(0, this.end + writeLength, this.end + length);
    this.end += length;
};

module.exports = PacketBuffer;
