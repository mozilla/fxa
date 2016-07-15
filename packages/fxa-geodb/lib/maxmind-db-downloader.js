/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path');

var CronJob = require('cron').CronJob;
var DEFAULTS = require('./defaults');
var fs = require('fs');
var mkdirp = require('mkdirp');
var mozlog = require('mozlog');
var Promise = require('bluebird');
var request = require('request');
var zlib = require('zlib');

// set up mozlog, default is `heka`
mozlog.config({
  app: 'fxa-geodb'
});
var log = mozlog();
var isTestEnv = (process.env.NODE_ENV === 'test') || process.env.CI;
var logHelper = function (type, message) {
  'use strict';

  // log only if not in a test environment
  if (! isTestEnv) {
    log[type](message);
  }
};

var MaxmindDbDownloader = function () {
  'use strict';

  this.createTargetDir = function (targetDirName) {
    targetDirName = targetDirName || DEFAULTS.TARGET_DIR_NAME;
    var targetDirPath = path.join(__dirname, '..', targetDirName);
    // create db folder
    mkdirp.sync(targetDirPath);
    logHelper('info', 'Download folder is ' + targetDirPath);
    return targetDirPath;
  };

  this.setupDownloadList = function (sourceFilePath, targetDirPath) {
    sourceFilePath = sourceFilePath || DEFAULTS.SOURCE_FILE_NAME;
    targetDirPath = targetDirPath || DEFAULTS.DEFAULT_TARGET_DIR_PATH;
    // import the list of files to download
    var sources = require(sourceFilePath);
    var downloadPromiseFunctions = [];

    // push each file-load-function onto the downloadPromiseFunctions queue
    for (var source in sources) {
      var url = sources[source];
      logHelper('info', 'Adding ' + url);
      // get the file name without the extension
      var targetFileName = path.parse(source).name;
      var targetFilePath = path.join(targetDirPath, targetFileName);
      downloadPromiseFunctions.push(this.createDownloadPromise(url, targetFilePath));
      logHelper('info', 'Setting ' + targetFilePath + ' as target file');
    }
    return downloadPromiseFunctions;
  };

  this.createDownloadPromise = function (url, targetFilePath) {
    // closure to separate multiple file-download
    return function () {
      return new Promise(function (resolve, reject) {
        var stream = request(url);
        // forces overwrite, even if file exists already
        stream.pipe(zlib.createGunzip()).pipe(fs.createWriteStream(targetFilePath)).on('finish', function (err) {
          if (err) {
            logHelper('error', err);
            reject(err);
          } else {
            // extraction is complete
            logHelper('info', 'unzip complete');
            resolve();
          }
        });
      });
    };
  };

  this.downloadAll = function (downloadPromiseFunctions) {
    var promises = [];
    // is there a more idiomatic way to do this??
    // the array looks like this:
    // downloadPromiseFunctions = [fn1 returning a promise, fn2 returning a promise, etc.]
    // each element is a function returning a promise
    promises = downloadPromiseFunctions.map(function (promiseFunction) {
      return promiseFunction();
    });
    return Promise.all(promises)
      .then(function (success) {
        logHelper('info', 'Downloads complete');
        logHelper('info', 'Last Update: ' + new Date());
      }, function (err) {
        logHelper('error', err);
      });
  };

  this.setupAutoUpdate = function (cronTiming, downloadPromiseFunctions, timeZone) {
    cronTiming = cronTiming || DEFAULTS.CRON_TIMING;
    timeZone = timeZone || DEFAULTS.TIMEZONE;
    var self = this;
    // by default run periodically on Wednesday at 01:30:30.
    new CronJob(cronTiming, function() { // eslint-disable-line no-new
      self.downloadAll(downloadPromiseFunctions);
    }, null, true, timeZone);
    logHelper('info', 'Set up auto update with cronTiming: ' + cronTiming);
  };
};

module.exports = MaxmindDbDownloader;
