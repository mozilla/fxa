#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var MaxmindDbDownloader = require('../lib/maxmind-db-downloader');
var path = require('path');

if (require.main === module) {
  if (process.env.FXA_GEOIP_SKIP_MAXMIND_DOWNLOAD) {
    return;
  }

  // start download only when script is
  // executed, not loaded through require.
  var maxmindDbDownloader = new MaxmindDbDownloader();
  var targetDirPath = maxmindDbDownloader.createTargetDir('db');
  var downloadPromiseFunctions = maxmindDbDownloader.setupDownloadList(
    path.join(__dirname, '..', 'sources.json'),
    targetDirPath
  );
  maxmindDbDownloader.downloadAll(downloadPromiseFunctions);
  // By default, we do not setup autoUpdate, needs to be
  // done through options when library is imported, or manually
  // by running npm run-scripts update
  // maxmindDbDownloader.setupAutoUpdate('30 30 1 * * 3', downloadPromiseFunctions);
}
