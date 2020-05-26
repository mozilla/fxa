/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const aws = require('aws-sdk');
const P = require('../promise');

const config = require('../config');
const logger = require('../logging')('img.aws');

const PUBLIC_BUCKET = config.get('img.uploads.dest.public');
const CACHE_CONTROL_HEADER = `immutable,public,max-age=${config.get(
  'img.uploads.cacheControlSeconds'
)}`;
const CONTENT_TYPE_PNG = 'image/png';

// eslint-disable-next-line no-useless-escape
if (!/^[a-zA-Z0-9_\-]+$/.test(PUBLIC_BUCKET)) {
  throw new Error('Illegal Bucket Name: ' + PUBLIC_BUCKET);
}

function AwsDriver() {
  this._s3 = new aws.S3();
}

AwsDriver.connect = function awsConnect(options) {
  return P.resolve(new AwsDriver(options));
};

AwsDriver.prototype = {
  upload: function awsUpload(key, buf, contentType) {
    var s3 = this._s3;
    var bucket = PUBLIC_BUCKET;
    return new P(function (resolve, reject) {
      logger.debug('upload.start', { bucket: bucket, key: key });
      s3.putObject(
        {
          Body: buf,
          Bucket: bucket,
          Key: key,
          CacheControl: CACHE_CONTROL_HEADER,
          ContentType: contentType || CONTENT_TYPE_PNG,
        },
        function (err, data) {
          if (err) {
            reject(err);
          } else {
            logger.debug('upload.end', { key: key, data: data });
            resolve(key);
          }
        }
      );
    });
  },

  delete: function awsDelete(key) {
    var s3 = this._s3;
    var bucket = PUBLIC_BUCKET;
    return new P(function (resolve, reject) {
      logger.debug('delete.start', { bucket: bucket, key: key });
      s3.deleteObjects(
        {
          Bucket: bucket,
          Delete: {
            Objects: [{ Key: key }],
          },
        },
        function (err, data) {
          if (err) {
            reject(err);
          } else {
            logger.debug('delete.end', { key: key, data: data });
            resolve(key);
          }
        }
      );
    });
  },
};

module.exports = AwsDriver;
