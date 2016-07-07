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

var MaxmindDbDownloader = function () {
  'use strict';

  this.createTargetDir = function (targetDir) {
    targetDir = targetDir || 'db';
    var targetDirPath = path.join(__dirname, '..', targetDir);
    // create db folder
    mkdirp.sync(targetDirPath);
    log.info('Download folder is ' + targetDirPath);
    return targetDirPath;
  };

  this.setUpDownloadList = function (sourceFilePath, targetDirPath) {
    sourceFilePath = sourceFilePath || 'sources.json';
    targetDirPath = targetDirPath || path.join(__dirname, '..', 'db');
    // import the list of files to download
    var sources = require(path.join(__dirname, '..', sourceFilePath));
    var remainingDownloads = [];

    // push each file-load-function onto the remainingDownloads queue
    for (var source in sources) {
      var url = sources[source];
      log.info('Adding ' + url);
      // get the file name without the extension
      var targetFileName = path.parse(source).name;
      var targetFilePath = path.join(targetDirPath, targetFileName);
      remainingDownloads.push(this.download(url, targetFilePath));
      log.info('Setting ' + targetFilePath + ' as target file');
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
          log.info('unzip complete');
          callback();
        }
      });
    };
  };

  this.startDownload = function (remainingDownloads) {
    async.parallel(remainingDownloads, function (err) {
      if (err) {
        return log.error(err);
      } else {
        return log.info('Downloads complete');
      }
    });
    log.info('Last Update: ', new Date());
  };

  this.setUpAutoUpdate = function (cronTiming, remainingDownloads, timeZone) {
    cronTiming = cronTiming || '30 30 1 * * 3';
    timeZone = timeZone || 'America/Los_Angeles';
    var self = this;
    // by default run periodically on Wednesday at 01:30:30.
    new CronJob(cronTiming, function() { // eslint-disable-line no-new
      self.startDownload(remainingDownloads);
    }, null, true, timeZone);
    log.info('Set up auto update with cronTiming: ' + cronTiming);
  };
};

if (require.main === module) {
  // start download only when script is
  // executed, not loaded through require.
  var maxmindDbDownloader = new MaxmindDbDownloader();
  var targetDirPath = maxmindDbDownloader.createTargetDir('db');
  var remainingDownloads = maxmindDbDownloader.setUpDownloadList('sources.json', targetDirPath);
  maxmindDbDownloader.startDownload(remainingDownloads);
  maxmindDbDownloader.setUpAutoUpdate('30 30 1 * * 3', remainingDownloads);
}

module.exports = MaxmindDbDownloader;
