"use strict";

// Events related to the exchange of authorization data between the master and
// game server (master side).

/** Account session information object.
 *
 * @class AccountSessionInfo 
 */
function AccountSessionInfo() {
    this.key = 0;
    this.account = null;
    this.expires = 0;
}
ctor(AccountSessionInfo);

// Map of all sessions
var sessions = {};

events.on("accountSession", function(e) {
    var session = new AccountSessionInfo();
    session.key = e.key;
    session.account = e.account;
    session.expires = time.now() + time.minutes(1);
    sessions[session.key] = session;
});

events.setInterval("accountSessionPurge", {}, time.seconds(15), true);
events.on("accountSessionPurge", function() {
    var now = time.now();
    for(var k in sessions) {
        if(!sessions.hasOwnProperty(k)) {
            continue;
        }
        if(sessions[k].expires < now) {
            delete sessions[k];
        }
    }
});

events.on("cncCommandAccountSession", function(cnc) {
    var session = sessions[cnc.key];
    if(!session) {
        cnc.failed = true;
        return;
    }
    cnc.response.username = session.account.username;
    delete sessions[cnc.key];
});
