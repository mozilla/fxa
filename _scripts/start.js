#!/usr/bin/env node

var selenium = require('selenium-standalone');
var webdriverio = require('webdriverio');
var profile = require('./profile');

var server = selenium({}, []);

profile(function (profile) {
  var opts = {
    desiredCapabilities: {
      browserName: 'firefox',
      // set a custom profile
      firefox_profile: profile
    }
  };

  // support $FIREFOX_BIN
  if (process.env.FIREFOX_BIN) {
    opts.desiredCapabilities.firefox_binary = process.env.FIREFOX_BIN;
  }

  setTimeout(function () {
    webdriverio
      .remote(opts)
      .init()
      .url('about:accounts')
  }, 3000);
});
