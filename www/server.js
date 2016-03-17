var express = require("express"),
    https = require("https"),
    fs = require("fs");

// This require sets up the log global.
require("./log");

var app = express();

app.use(express.static(config.static));

var server = https.createServer({
    key: fs.readFileSync(config.key),
    cert: fs.readFileSync(config.cert),
}, app);

server.listen(config.port, config.host, function() {
    log.info("WWW server listening on " + config.host + ":" + config.port);
});
