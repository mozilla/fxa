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

var targetPath = path.join(process.cwd(), '..', 'db');
// create db folder
mkdirp.sync(targetPath);

log.info('Downloading to ' + targetPath);

// import the list of files to download
var sources = require(path.join(__dirname, '..', 'sources.json'));
var remainingDownloads = [];

// push each file-load-function onto the remainingDownloads queue
for (var source in sources) {
  var url = sources[source];
  log.info('adding ' + url);
  var targetFileName = source.slice(0, -3);
  remainingDownloads.push(download(url, path.join(targetPath, targetFileName)));
}

function download(url, targetFile) {
  'use strict';

  // closure to separate multiple file-download
  return function downloadFunctor(callback) {
    var stream = request(url);
    stream.pipe(zlib.createGunzip()).pipe(fs.createWriteStream(targetFile)).on('finish', function (err) {
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
}

function startDownload(remainingDownloads) {
  'use strict';

  log.info('Last Update: ', new Date());
  async.parallel(remainingDownloads, function (err) {
    if (err) {
      return log.error(err);
    } else {
      return log.info('Downloads complete');
    }
  });
}

// start download when script is invoked
startDownload(remainingDownloads);

// after that run periodically
new CronJob('30 30 1 * * 3', function() { // eslint-disable-line no-new
  'use strict';

  // Cron job that runs every week on Wednesday at 1:30:30 AM.
  startDownload(remainingDownloads);
}, null, true, 'America/Los_Angeles');
