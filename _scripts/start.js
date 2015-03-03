#!/usr/bin/env node

var selenium = require('selenium-standalone');
var webdriverio = require('webdriverio');
var profile = require('./profile');


selenium.install({
  // check for more recent versions of selenium here:
  // http://selenium-release.storage.googleapis.com/index.html
  version: '2.45.0',
}, function() {

  selenium.start(function(err, cp) {
    if (err) throw err;


    profile(function (profile) {
      var opts = {
        desiredCapabilities: {
          //loggingPrefs: {"driver": "ALL", "server": "ALL", "browser": "ALL", "client": "ALL"},
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

  });

})

