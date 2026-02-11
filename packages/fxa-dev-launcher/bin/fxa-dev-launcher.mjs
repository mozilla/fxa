#!/usr/bin/env node
import foxfire from "foxfire";
import profile from "../profile.mjs";

foxfire({
  args: [!!process.env.FIREFOX_DEBUGGER ? "-jsdebugger" : ""],
  profileOptions: profile
})
