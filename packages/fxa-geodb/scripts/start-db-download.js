#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var MaxmindDbDownloader = require('../lib/maxmind-db-downloader');
var path = require('path');

if (require.main === module) {
  // start download only when script is
  // executed, not loaded through require.
  var maxmindDbDownloader = new MaxmindDbDownloader();
  var targetDirPath = maxmindDbDownloader.createTargetDir('db');
  var remainingDownloads = maxmindDbDownloader.setupDownloadList(
    path.join(__dirname, '..','sources.json'),
    targetDirPath
  );
  maxmindDbDownloader.downloadAll(remainingDownloads);
  // By default, we do not setup autoUpdate, needs to be
  // done through options when library is imported, or manually
  // by running npm run-scripts update
  // maxmindDbDownloader.setupAutoUpdate('30 30 1 * * 3', remainingDownloads);
}
