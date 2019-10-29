#!/usr/bin/env node

require("foxfire")({
  args: [!!process.env.FIREFOX_DEBUGGER ? "-jsdebugger" : ""],
  profileOptions: require("./profile")
});
