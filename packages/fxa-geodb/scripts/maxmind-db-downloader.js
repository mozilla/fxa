#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var async = require('async');
var CronJob = require('cron').CronJob;
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var request = require('request');
var zlib = require('zlib');

// set up mozlog, default is `heka`
var mozlog = require('mozlog');
mozlog.config({
  app: 'fxa-geodb'
});
var log = mozlog();


var DEFAULT_CRON_TIMING = '30 30 1 * * 3';
var DEFAULT_SOURCE_FILE_NAME = 'sources.json';
var DEFAULT_TARGET_DIR_NAME = 'db';
var DEFAULT_TIMEZONE = 'America/Los_Angeles';

var MaxmindDbDownloader = function () {
  'use strict';

  this.createTargetDir = function (targetDirName) {
    targetDirName = targetDirName || DEFAULT_TARGET_DIR_NAME;
    var targetDirPath = path.join(__dirname, '..', targetDirName);
    // create db folder
    mkdirp.sync(targetDirPath);
    // log.info only if not testing
    // log.error always
    if (process.env.NODE_ENV !== 'test') {
      log.info('Download folder is ' + targetDirPath);
    }
    return targetDirPath;
  };

  this.setupDownloadList = function (sourceFileName, targetDirPath) {
    sourceFileName = sourceFileName || DEFAULT_SOURCE_FILE_NAME;
    targetDirPath = targetDirPath || path.join(__dirname, '..', DEFAULT_TARGET_DIR_NAME);
    // import the list of files to download
    var sources = require(path.join(__dirname, '..', sourceFileName));
    var remainingDownloads = [];

    // push each file-load-function onto the remainingDownloads queue
    for (var source in sources) {
      var url = sources[source];
      if (process.env.NODE_ENV !== 'test') {
        log.info('Adding ' + url);
      }
      // get the file name without the extension
      var targetFileName = path.parse(source).name;
      var targetFilePath = path.join(targetDirPath, targetFileName);
      remainingDownloads.push(this.download(url, targetFilePath));
      if (process.env.NODE_ENV !== 'test') {
        log.info('Setting ' + targetFilePath + ' as target file');
      }
    }
    return remainingDownloads;
  };

  this.download = function (url, targetFilePath) {
    // closure to separate multiple file-download
    return function downloadFunctor(callback) {
      var stream = request(url);
      stream.pipe(zlib.createGunzip()).pipe(fs.createWriteStream(targetFilePath)).on('finish', function (err) {
        // forces overwrite, even if file exists already
        if (err) {
          log.error(err);
        } else {
          // extraction is complete
          if (process.env.NODE_ENV !== 'test') {
            log.info('unzip complete');
          }
          callback();
        }
      });
    };
  };

  this.startDownload = function (remainingDownloads) {
    async.parallel(remainingDownloads, function (err) {
      if (err) {
        log.error(err);
      } else {
        if (process.env.NODE_ENV !== 'test') {
          log.info('Downloads complete');
        }
      }
    });
    if (process.env.NODE_ENV !== 'test') {
      log.info('Last Update: ', new Date());
    }
  };

  this.setupAutoUpdate = function (cronTiming, remainingDownloads, timeZone) {
    cronTiming = cronTiming || DEFAULT_CRON_TIMING;
    timeZone = timeZone || DEFAULT_TIMEZONE;
    var self = this;
    // by default run periodically on Wednesday at 01:30:30.
    new CronJob(cronTiming, function() { // eslint-disable-line no-new
      self.startDownload(remainingDownloads);
    }, null, true, timeZone);
    if (process.env.NODE_ENV !== 'test') {
      log.info('Set up auto update with cronTiming: ' + cronTiming);
    }
  };
};

if (require.main === module) {
  // start download only when script is
  // executed, not loaded through require.
  var maxmindDbDownloader = new MaxmindDbDownloader();
  var targetDirPath = maxmindDbDownloader.createTargetDir('db');
  var remainingDownloads = maxmindDbDownloader.setupDownloadList('sources.json', targetDirPath);
  maxmindDbDownloader.startDownload(remainingDownloads);
  maxmindDbDownloader.setupAutoUpdate('30 30 1 * * 3', remainingDownloads);
}

module.exports = MaxmindDbDownloader;
