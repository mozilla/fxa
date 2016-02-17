#!/usr/bin/env node

var fs = require('fs');

var selenium = require('selenium-standalone');
var webdriverio = require('webdriverio');
var chalk = require('chalk');

var profile = require('./profile');

selenium.install({
  // check for more recent versions of selenium here:
  // http://selenium-release.storage.googleapis.com/index.html
  version: '2.47.1',
}, function() {
  // clear previous logs 
  fs.openSync('log-browser.log', 'w');
  fs.openSync('log-driver.log', 'w');

  selenium.start({
    version: '2.47.1',

  },function(err, cp) {
    process.on('exit', function(code) {
      cp.kill();
    });

    if (err) {
      if (err.message && err.message === 'Another Selenium process is already running') {
        console.log('Did not start Selenium, already running..');
      } else {
        throw err
      }
    };

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

      var openDebuggerKeys = '';
      if (process.env.FIREFOX_DEBUGGER === 'true' && process.platform === 'darwin') {
        // ALT + COMMAND + SHIFT + I keyboard shortcut
        openDebuggerKeys = '\uE008\uE03D\uE00AI';
      }

      setTimeout(function () {
          webdriverio
            .remote(opts)
            .init()
            .keys(openDebuggerKeys)
            .url('http://www.example.org')
      }, 3000);
    });

    tailLogs();

  });

});


var tailLogs = function() {

  Tail = require('tail').Tail;

  tail = new Tail('log-browser.log');

  tail.on('line', function(data) {
    if (data) {
      var parsed = true;
      try {
        data = JSON.parse(data.toString());
      } catch (e) {
        parsed = false;
        w(chalk.blue(data.toString()));
      }

      if (! parsed) {
        return;
      }

      var msg = data.message.trim();
      if (data.level === 'SEVERE') {
        w(chalk.red(data.level + ':', msg));
      } else if (data.level === 'WARNING') {
        // WARNING log is ignored
      } else if (msg.toLowerCase().indexOf('fxa') >= 0 || msg.toLowerCase().indexOf('account') >= 0 ) {
        w(chalk.green(data.level + ':', msg));
      } else {
        w(chalk.blue(data.level + ':', msg));
      }
    }
  });

  tail.on("error", function(error) {
    console.log('ERROR: ', error);
  });

};


var w = function(s) {
  console.log(s);
};