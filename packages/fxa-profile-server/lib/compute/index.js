/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

const ComputeCluster = require('compute-cluster');
const toArray = require('stream-to-array');

const AppError = require('../error');
const config = require('../config');
const logger = require('../logging')('compute');
const P  = require('../promise');

const MAX_PROCESSES = config.get('img.compute.maxProcesses');

var imageCc;
if (MAX_PROCESSES > 0) {
  /*jshint camelcase: false*/
  imageCc = new ComputeCluster({
    module: path.join(__dirname, 'image-cc.js'),
    max_backlog: config.get('img.compute.maxBacklog'),
    max_request_time: config.get('img.compute.maxRequestTime'),
    max_processes: MAX_PROCESSES
  });

  imageCc.on('error', function(e) {
    logger.critical('image-cc.error', e);
    process.exit(1);
  }).on('info', function(msg) {
    logger.info('image-cc', msg);
  }).on('debug', function(msg) {
    logger.debug('image-cc', msg);
  });
} else {
  logger.info('compute-cluster.disabled');
  imageCc = {
    enqueue: function sameProcessEnqueue(msg, callback) {
      require('./image-cc').compute(msg, function(res) {
        callback(null, res);
      });
    }
  };
}

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
          logger.error('process.error', err);
          reject(AppError.processingError(err));
        } else {
          resolve(res);
        }
      });
    });
  });
};
