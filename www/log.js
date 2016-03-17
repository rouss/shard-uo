/* Provides process-wide logging.
 */

var winston = require("winston"),
    fs = require("fs"),
    path = require("path");

try {
    fs.mkdirSync(path.dirname(config.logFile));
} catch(e) {
    // Ignore
}

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: "debug"
        }),
        new (winston.transports.File)({
            filename: config.logFile,
            level: "info",
            maxsize: 1 * 1024 * 1024,
            masFiles: 5,
            tailable: true
        })
    ]
});

module.exports = logger;

// Expose as global for scripts
global.log = module.exports;
