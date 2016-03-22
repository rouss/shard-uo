"use strict";

// Communication with the master server

var ip = require("../../src/public-ip-lookup");

events.setInterval("cncUpdateMaster", {}, time.minutes(1), true);
events.on("cncUpdateMaster", function() {
    shard.master.command({
        command: "UpdateShard",
        id: config.id,
        name: config.name,
        host: ip.address,
        port: config.endpoints.uop.port,
        percentFull: 0,
    }, "cncUpdateMasterComplete");
});

events.on("cncUpdateMasterComplete", function(res) {
    if(!res.success) {
        log.warn("Failed to update master server info");
    }
});
