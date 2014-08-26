/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');

const Joi = require('joi');
const P = require('../../promise');

const AppError = require('../../error');
const config = require('../../config');
const db = require('../../db');
const img = require('../../img');
const logger = require('../../logging').getLogger('fxa.routes.avatar.upload');
const request = require('../../request');

const WORKER_URL = config.get('worker.url');

const FXA_PROVIDER = 'fxa';
const FXA_URL_TEMPLATE = config.get('img.url');
assert(FXA_URL_TEMPLATE.indexOf('{id}') !== -1,
    'img.url must contain the string "{id}"');

function fxaUrl(id) {
  return FXA_URL_TEMPLATE.replace('{id}', id);
}

function pipeToWorker(id, payload, headers) {
  return new P(function(resolve, reject) {
    var url = WORKER_URL + '/a/' + id;
    var opts = { headers: headers, json: true };
    logger.verbose('posting to worker', url);
    payload.pipe(request.post(url, opts, function(err, res, body) {
      err = err || body.error;
      if (err) {
        logger.error('Processing error', err);
        reject(AppError.processingError(err));
        return;
      }

      logger.verbose('worker response', body);
      resolve(body);
    }));
    payload.on('error', function(err) {
      logger.error('Payload stream error', err);
      reject(err);
    });
  });
}


module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:write', 'profile:avatar:write']
  },
  validate: {
    headers: Joi.object({
      'content-length': Joi.number().required()
    }).unknown()
  },
  payload: {
    output: 'stream',
    parse: false,
    allow: ['image/png', 'image/jpeg']
  },
  response: {
    schema: {
      url: Joi.string().required()
    }
  },
  handler: function upload(req, reply) {
    var id = img.id();
    var url = fxaUrl(id);
    var uid = req.auth.credentials.user;
    logger.debug('Upload %d bytes', req.headers['content-length']);
    pipeToWorker(id, req.payload, req.headers)
      .then(function save() {
        return db.addAvatar(id, uid, url, FXA_PROVIDER, true);
      })
      .done(function uploadDone() {
        reply({ url: url }).code(201);
      }, reply);
  }
};


