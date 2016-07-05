#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var async = require('async');
var cp = require('child_process');
var CronJob = require('cron').CronJob;
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var request = require('request');
var requestProgress = require('request-progress');

// set up mozlog, default is `heka`
var mozlog = require('mozlog');
mozlog.config({
  app: 'fxa-geodb'
});
var log = mozlog();

var target = path.join(process.cwd(), '..', 'db');
// create db folder
mkdirp.sync(target);

log.info('Downloading to %s', target);

// import the list of files to download
var sources = require(path.join(__dirname, '..', 'sources.json'));
var remainingDownloads = [];

// push each file-load-function onto the remainingDownloads queue
for (var source in sources) {
  var url = sources[source];
  log.info('adding ' + url);
  remainingDownloads.push(download(url, path.join(target, source)));
}

function download(url, target) {
  'use strict';

  // closure to separate multiple file-download
  return function downloadFunctor(callback) {
    var stream = requestProgress(request(url));
    stream.pipe(fs.createWriteStream(target)).on('finish', function () {
      // force overwrite, even if file exists already
      cp.execFile('gunzip', [target, '-f']);
      callback();
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
      log.info('Download complete');
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
