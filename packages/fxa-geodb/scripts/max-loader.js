const async = require('async');
const fs = require('fs');
const path = require('path');
const request = require('request');
const requestProgress = require('request-progress');
const mkdirp = require('mkdirp');
const cp = require('child_process');
const CronJob = require('cron').CronJob;

var target = path.join(process.cwd(), '../db');

// create db folder
mkdirp.sync(target);

log('Downloading to %s', target);

// import the list of files to download
var sources = require('../sources.json');
var work = [];

// push each file-load-function onto the work queue
for (var source in sources) {
  var url = sources[source];
  log('adding %s', url);
  work.push(download(url, path.join(target, source)));
}

function download(url, target) {
  // closure to separate multiple file-download
  return function downloadFunctor(callback) {
    var stream = requestProgress(request(url));
    stream.pipe(fs.createWriteStream(target)).on('finish', function () {
      cp.execFile('gunzip', [target]);
      callback();
    });
  };
}

function log() {
  console.log.apply(console, arguments);
}

new CronJob('30 30 1 * * 3', function() {
  // Cron job that runs every week on Wednesday at 1:30:30 AM.
  log('Last Update: ', new Date());
  async.parallel(work, function (err) {
    if (err) {
      return log(err);
    } else {
      log('Download complete');
    }
  });
}, null, true, 'America/Los_Angeles');
