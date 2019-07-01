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
var log = mozlog({
  app: 'fxa-geodb',
})();

var isTestEnv = process.env.NODE_ENV === 'test' || process.env.CI;
var isLogQuiet = process.env.LOG === 'quiet';

var logHelper = function(type, message) {
  'use strict';

  // log only if not in a test environment
  // and if logs are not quiet
  if (!isTestEnv && !isLogQuiet) {
    log[type](message);
  }
};

var MaxmindDbDownloader = function() {
  'use strict';

  this.createTargetDir = function(targetDirName) {
    targetDirName = targetDirName || DEFAULTS.TARGET_DIR_NAME;
    var targetDirPath = path.join(__dirname, '..', targetDirName);
    // create db directory
    var createdTargetDirPath = mkdirp.sync(targetDirPath);
    logHelper('info', 'Download directory is ' + createdTargetDirPath);
    return createdTargetDirPath;
  };

  this.setupDownloadList = function(sourceFilePath, targetDirPath) {
    sourceFilePath = sourceFilePath || DEFAULTS.SOURCE_FILE_NAME;
    targetDirPath = targetDirPath || DEFAULTS.TARGET_DIR_PATH;
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
      downloadPromiseFunctions.push(
        this.createDownloadPromise(url, targetFilePath)
      );
      logHelper('info', 'Setting ' + targetFilePath + ' as target file');
    }
    return downloadPromiseFunctions;
  };

  this.createDownloadPromise = function(url, targetFilePath) {
    // closure to separate multiple file-download
    return function() {
      return new Promise(function(resolve, reject) {
        var stream = request(url);
        var targetFilePathTemp = targetFilePath + '-temp';
        // forces overwrite, even if file exists already
        stream
          .pipe(zlib.createGunzip())
          .pipe(fs.createWriteStream(targetFilePathTemp))
          .on('finish', function(err) {
            if (err) {
              logHelper('error', err);
              reject(err);
            } else {
              // extraction is complete
              logHelper('info', 'unzip complete');
              try {
                // load up geodb with the downloaded file
                const geoDb = require('./fxa-geodb')({
                  dbPath: targetFilePathTemp,
                });
                logHelper(
                  'info',
                  'checking if lookup works with downloaded file'
                );
                // check if lookup works with the downloaded file
                geoDb(DEFAULTS.GEODB_TEST_IP);
                // download worked, rename file
                fs.renameSync(targetFilePathTemp, targetFilePath);
                logHelper('info', 'lookup works, renaming downloaded file');
                resolve();
              } catch (err) {
                // download resulted in an error, do not rename
                // remove temp file
                if (fs.existsSync(targetFilePathTemp)) {
                  fs.unlinkSync(targetFilePathTemp);
                }
                logHelper('error', 'downloaded file not working');
                reject(err);
              }
            }
          });
      });
    };
  };

  this.downloadAll = function(downloadPromiseFunctions) {
    var promises = [];
    // the array looks like this:
    // downloadPromiseFunctions = [fn1 returning a promise, fn2 returning a promise, etc.]
    // each element is a function returning a promise
    promises = downloadPromiseFunctions.map(function(promiseFunction) {
      return promiseFunction();
    });
    return Promise.all(promises).then(
      function() {
        logHelper('info', 'Downloads complete');
        logHelper('info', 'Last Update: ' + new Date());
      },
      function(err) {
        logHelper('error', err);
      }
    );
  };

  this.setupAutoUpdate = function(
    cronTiming,
    downloadPromiseFunctions,
    timeZone
  ) {
    cronTiming = cronTiming || DEFAULTS.CRON_TIMING;
    timeZone = timeZone || DEFAULTS.TIMEZONE;
    var self = this;
    // by default run periodically on Wednesday at 01:30:30.
    this.cronjob = new CronJob(
      cronTiming,
      function() {
        self.downloadAll(downloadPromiseFunctions);
      },
      null,
      true,
      timeZone
    );
    logHelper('info', 'Set up auto update with cronTiming: ' + cronTiming);
  };

  this.stop = function() {
    if (this.cronjob) {
      this.cronjob.stop();
    }
  };
};

module.exports = MaxmindDbDownloader;
