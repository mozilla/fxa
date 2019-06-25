#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public // `if` without curlies in a single line is okay
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint -W116*/ var util = require('util');
var crypto = require('crypto');
var options = require('commander');
var Avatar = require('./avatar');

var transactions = {},
  avatar;

var stats = {
  uploads: {
    count: 0,
    bytes: 0,
    milliseconds: 0,
  },
  downloads: {
    count: 0,
    bytes: 0,
    milliseconds: 0,
  },
  deletes: {
    count: 0,
    bytes: 0,
    milliseconds: 0,
  },
  errors: {
    count: 0,
  },
};

function updateStats(type, info) {
  var element = stats[type];
  element.count++;
  element.bytes += info.bytes;
  element.milliseconds += info.elapsedTime;
}

function log(/* format, values... */) {
  var args = Array.prototype.slice.call(arguments);
  var timestamp = new Date().toISOString();
  args[0] = util.format('[%s] %s', timestamp, args[0]);
  process.stderr.write(util.format.apply(null, args.concat('\n')));
}

function reportStats() {
  var uploads = stats.uploads;
  var downloads = stats.downloads;

  if (uploads.count === 0 || downloads.count === 0) return;

  var uploadRate =
    (((uploads.bytes || 0) / (uploads.milliseconds || 1)) * 1000) / 1024;
  var downloadRate =
    (((downloads.bytes || 0) / (downloads.milliseconds || 1)) * 1000) / 1024;

  log(
    'stats: uploads: %s (%s KB/s) downloads: %s (%s KB/s) ' +
      'deletes: %s errors: %s',
    uploads.count,
    uploadRate.toFixed(1),
    downloads.count,
    downloadRate.toFixed(1),
    stats.deletes.count,
    stats.errors.count
  );
}

function intParse(string, defvalue) {
  var intvalue = parseInt(string, 10);
  if (typeof intvalue === 'number') return intvalue;
  return defvalue;
}

function startUpload() {
  if (stats.uploads.count >= options.count) {
    reportStats();
    return; // All Done.
  }

  var transactionid = crypto.randomBytes(4).toString('hex');
  transactions[transactionid] = 'uploading';

  avatar.upload({ transactionid: transactionid });
}

(function main() {
  options
    .usage('[options]')
    .option(
      '-c, --concurrent <n>',
      'Number of concurrent avatar uploads (default: 2)',
      intParse,
      2
    )
    .option(
      '-n, --count <n>',
      'Total number of uploads (default: 1000)',
      intParse,
      1000
    )
    .option('-b, --bearer <token>', 'OAuth Bearer token (required)')
    .option(
      '-H, --host <server>',
      'Hostname of profile server (default: profile.stage.mozaws.net)',
      'profile.stage.mozaws.net'
    )
    .option(
      '-d, --delete',
      'Optionally delete the image after each download (default: false)'
    )
    .option('-v, --verbose', 'show detailed logs for every upload/download')
    .parse(process.argv);

  if (!options.bearer) {
    log('Missing option "--bearer". Required option!');
    process.exit(1);
  }

  if (!/^[a-fA-F0-9]{64}$/.test(options.bearer)) {
    log('Invalid Bearer token!: %s', options.bearer);
    process.exit(1);
  }

  avatar = new Avatar(options);

  var intervalReport = setInterval(reportStats, 2000);
  intervalReport.unref();

  log(
    'Starting with concurrent: %s, count: %s, profile: %s',
    options.concurrent,
    options.count,
    options.host
  );

  for (var i = 0; i < options.concurrent; ++i) {
    setTimeout(startUpload, i * 200);
  }
})();

avatar.on('error', function onError(error) {
  log(
    'error: %s %s %s',
    error.transactionid,
    transactions[error.transactionid],
    util.inspect(error, { showHidden: true, depth: null })
  );

  stats.errors.count++;
  delete transactions[error.transactionid];

  startUpload();
});

avatar.on('complete:upload', function onCompleteUpload(info) {
  if (options.verbose) {
    var activeCount = Object.keys(transactions).length;
    log(
      'complete:upload   -> xid: %s, active: %s, rc: %s, elapsedTime: %s',
      info.transactionid,
      activeCount,
      info.statusCode,
      info.elapsedTime
    );
  }

  updateStats('uploads', info);
  transactions[info.transactionid] = 'downloading';

  avatar.download({
    url: info.body.url,
    imageid: info.body.id,
    transactionid: info.transactionid,
  });
});

avatar.on('complete:download', function onCompleteDownload(info) {
  if (options.verbose) {
    var activeCount = Object.keys(transactions).length;
    log(
      'complete:download -> xid: %s, active: %s, rc: %s, elapsedTime: %s',
      info.transactionid,
      activeCount,
      info.statusCode,
      info.elapsedTime
    );
  }

  updateStats('downloads', info);

  if (options.delete) {
    avatar.delete({
      transactionid: info.transactionid,
      imageid: info.imageid,
    });
  } else {
    delete transactions[info.transactionid];
    startUpload();
  }
});

avatar.on('complete:delete', function onCompleteDelete(info) {
  if (options.verbose) {
    var activeCount = Object.keys(transactions).length;
    log(
      'complete:delete -> xid: %s, active: %s, rc: %s, elapsedTime: %s',
      info.transactionid,
      activeCount,
      info.statusCode,
      info.elapsedTime
    );
  }

  updateStats('deletes', info);
  delete transactions[info.transactionid];

  startUpload();
});
