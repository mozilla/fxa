/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const aws = require('aws-sdk');
const P = require('../promise');

const config = require('../config');
const logger = require('../logging').getLogger('fxa.img.aws');

const PUBLIC_BUCKET = config.get('img.uploads.dest.public');

if (!/^[a-zA-Z0-9_\-]+$/.test(PUBLIC_BUCKET)) {
  throw new Error('Illegal Bucket Name: ' + PUBLIC_BUCKET);
}

function AwsDriver(options) {
  this._s3 = new aws.S3(options);
}

AwsDriver.connect = function awsConnect(options) {
  return P.resolve(new AwsDriver(options));
};

AwsDriver.prototype = {

  upload: function awsUpload(key, buf) {
    var s3 = this._s3;
    var bucket = PUBLIC_BUCKET;
    return new P(function(resolve, reject) {
      logger.debug('Uploading', bucket, key);
      s3.putObject({
        Body: buf,
        Bucket: bucket,
        Key: key
      }, function(err, data) {
        if (err) {
          reject(err);
        } else {
          logger.debug('Uploaded', key, data);
          resolve(key);
        }
      });
    });
  }

};

module.exports = AwsDriver;
