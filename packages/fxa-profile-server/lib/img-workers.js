/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const buf = require('buf');
const hex = buf.to.hex;
const P = require('./promise');

const AppError = require('./error');
const config = require('./config');
const logger = require('./logging')('img_workers');
const request = require('./request');

const WORKER_URL = config.get('worker.url');

exports.upload = function upload(id, payload, headers) {
  return new P(function(resolve, reject) {
    var url = WORKER_URL + '/a/' + hex(id);
    var opts = { headers: headers, json: true };
    logger.verbose('upload', url);
    payload.pipe(request.post(url, opts, function(err, res, body) {
      if (err) {
        logger.error('upload.network.error', err);
        reject(AppError.processingError(err));
        return;
      }

      if (res.statusCode >= 400 || body.error) {
        logger.error('upload.worker.error', body);
        reject(AppError.processingError(body));
        return;
      }

      logger.verbose('upload.response', body);
      resolve(body);
    }));
    payload.on('error', function(err) {
      logger.error('upload.payload.error', err);
      reject(err);
    });
  });
};

exports.delete = function deleteAvatar(id) {
  return new P(function(resolve, reject) {
    var url = WORKER_URL + '/a/' + hex(id);
    var opts = { method: 'delete', json: true };
    logger.verbose('delete', url);
    request(url, opts, function(err, res, body) {
      if (err) {
        logger.error('delete.network.error', err);
        return reject(AppError.processingError(err));
      }
      if (res.statusCode >= 400 || body.error) {
        logger.error('delete.worker.error', body);
        reject(AppError.processingError(body));
        return;
      }

      logger.verbose('delete.worker.response', body);
      resolve();
    });
  });
};
