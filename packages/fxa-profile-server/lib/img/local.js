/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');

const P = require('../promise');

const config = require('../config');
const logger = require('../logging')('img.local');

const PUBLIC_DIR = config.get('img.uploads.dest.public');

if (!fs.existsSync(PUBLIC_DIR)) {
  throw new Error('PUBLIC_DIR does not exist: ' + PUBLIC_DIR);
}

function LocalDriver() {
  var env = config.get('env');
  if (env !== 'dev' && env !== 'test') {
    logger.warn('Using img.local driver!');
  }
}

LocalDriver.connect = function localConnect(options) {
  return P.resolve(new LocalDriver(options));
};

LocalDriver.prototype = {

  upload: function localUpload(name, buf) {
    return new P(function uploadPromise(resolve, reject) {
      var dir = PUBLIC_DIR;
      logger.debug('upload.start', name);
      fs.writeFile(path.join(dir, name), buf, function(err) {
        if (err) {
          logger.error('upload', err);
          reject(err);
        } else {
          logger.debug('upload.end', name);
          resolve(name);
        }
      });
    });
  }

};

module.exports = LocalDriver;
