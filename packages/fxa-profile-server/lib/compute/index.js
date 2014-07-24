/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

const ComputeCluster = require('compute-cluster');
const toArray = require('stream-to-array');

const config = require('../config');
const logger = require('../logging').getLogger('fxa.compute');
const P  = require('../promise');

/*jshint camelcase: false*/
var imageCc = new ComputeCluster({
  module: path.join(__dirname, 'image-cc.js'),
  max_backlog: config.get('img.compute.maxBacklog'),
  max_request_time: config.get('img.compute.maxRequestTime')
});

imageCc.on('error', function(e) {
  logger.critical('Fatal IPC error with image-cc.js', e);
  process.exit(1);
}).on('info', function(msg) {
  logger.info('image-cc', msg);
}).on('debug', function(msg) {
  logger.debug('image-cc', msg);
});

exports.image = function image(id, payload) {
  return new P(function(resolve, reject) {
    toArray(payload, function(err, arr) {
      if (err) {
        return reject(err);
      }
      var buf = Buffer.concat(arr);
      imageCc.enqueue({
        id: id,
        payload: buf
      }, function(err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  });
};
