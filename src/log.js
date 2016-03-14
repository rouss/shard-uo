/* Provides process-wide logging.
 */

var winston = require("winston");

module.exports = winston;

// Expose as global for scripts
global.log = module.exports;
