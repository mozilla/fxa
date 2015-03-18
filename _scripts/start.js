#!/usr/bin/env node

var selenium = require('selenium-standalone');
var webdriverio = require('webdriverio');
var chalk = require('chalk');

var profile = require('./profile');

var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "firefox"});

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

    tailLogs();

  });

});


var tailLogs = function() {

  Tail = require('tail').Tail;

  tail = new Tail('log-browser.log');

  tail.on('line', function(data) {
    var data = JSON.parse(data.toString());
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

  });

  tail.on("error", function(error) {
    console.log('ERROR: ', error);
  });

}


var w = function(s) {
  console.log(s);
}