"use strict";

// Basic CNC packet handlers

events.on("cncCommandPing", function(cnc) {
    cnc.response.value = "Pong";
});

events.on("cncCommandShutdown", function(cnc) {
    log.info("Graceful shutdown initiated via CNC");
    shard.shutdown();
    cnc.response.value = "OK";
});

events.on("cncCommandKill", function(cnc) {
    log.info("Forceful shutdown initiated via CNC");
    shard.kill();
    cnc.response.value = "OK";
});

events.on("cncCommandReload", function(cnc) {
    log.info("Reload initiated via CNC");
    shard.reload();
    cnc.response.value = "OK";
});
