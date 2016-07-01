#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var async = require('async');
var fs = require('fs');
var path = require('path');
var request = require('request');
var requestProgress = require('request-progress');
var mkdirp = require('mkdirp');
var cp = require('child_process');
var CronJob = require('cron').CronJob;

// set up mozlog, default is `heka`
var mozlog = require('mozlog');
mozlog.config({
  app: 'fxa-geodb'
});
var log = mozlog();

var target = path.join(process.cwd(), '../db');
// create db folder
mkdirp.sync(target);

log.info('Downloading to %s', target);

// import the list of files to download
var sources = require('../sources.json');
var work = [];

// push each file-load-function onto the work queue
for (var source in sources) {
  var url = sources[source];
  log.info('adding ' + url);
  work.push(download(url, path.join(target, source)));
}

function download(url, target) {
  // closure to separate multiple file-download
  return function downloadFunctor(callback) {
    var stream = requestProgress(request(url));
    stream.pipe(fs.createWriteStream(target)).on('finish', function () {
      // lets copy the existing file, renaming it to
      // target-backup (without .gz extension)
      var existing_file = target.slice(0, -3);
      var existing_file_backup = existing_file + '-backup';
      cp.execFile('cp', [existing_file, existing_file_backup]);
      // force overwrite, even if file exists already
      // since we took a backup, this wont cause an issue (hopefully)
      cp.execFile('gunzip', [target, '-f']);
      callback();
    });
  };
}

function startDownload(work) {
  log.info('Last Update: ', new Date());
  async.parallel(work, function (err) {
    if (err) {
      return log.error(err);
    } else {
      log.info('Download complete');
    }
  });
}

// start download when script is invoked
startDownload(work);

// after that run periodically
new CronJob('30 30 1 * * 3', function() {
  // Cron job that runs every week on Wednesday at 1:30:30 AM.
  startDownload(work);
}, null, true, 'America/Los_Angeles');
