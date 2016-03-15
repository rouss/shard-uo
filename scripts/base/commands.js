"use strict";

// command handling system

// Temporary root command hack
events.on("rootCommand", handleCommand);
events.on("shellCommand", handleCommand);

function handleCommand(cmd) {
    cmd = cmd.toLowerCase();
    switch(cmd) {
        case "shutdown":
            log.info("Graceful shutdown initiated from the terminal");
            shard.shutdown();
            break;
        case "kill":
            log.info("Forceful shutdown initiated from the terminal");
            shard.kill();
            break;
        case "reload":
            log.info("Script reload initiated from the terminal");
            config.reload();
            require("../../src/packets").reload();
            events.reload();
            break;
        default:
            console.log(
                "Terminal Commands:\n" +
                "\n" +
                "  reload      Reloads all of the scripts for the server.\n" +
                "  shutdown    Gracefully shuts down the shard.\n" +
                "  kill        Forcefully shuts down the shard.\n"
            );
            break;
    }
}
