#!/usr/bin/env node

var fs = require('fs');

var chalk = require('chalk');
var profileOptions = require('./profile');

var foxfire = require('foxfire')
foxfire({
  args: [
    !! process.env.FIREFOX_DEBUGGER ? '-jsdebugger' : ''
  ],
  profileOptions: profileOptions
});
