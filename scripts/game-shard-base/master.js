"use strict";

// Communication with the master server

events.setInterval("cncUpdateMaster", {}, time.minutes(1), true);

events.on("cncUpdateMaster", function() {
    shard.master.command({
        command: "UpdateShard",
        id: config.id,
        name: config.name,
        host: config.endpoints.uop.host,
        port: config.endpoints.uop.port,
    }, "cncUpdateMasterComplete");
});

events.on("cncUpdateMasterComplete", function(res) {
    if(!res.success) {
        log.warn("Failed to update master server info");
    } else {
        log.debug("Updated master server info");
    }
});
