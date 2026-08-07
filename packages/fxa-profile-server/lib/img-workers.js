/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const AppError = require('./error');
const config = require('./config');
const logger = require('./logging')('img_workers');

const WORKER_URL = config.get('worker.url');
const ACCEPT_ENCODING_HEADER = 'identity';

// The worker replies with JSON, but keep a non-JSON body as text so the
// error checks below still see it.
function parseBody(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

exports.upload = async function upload(id, payload, headers) {
  var url = WORKER_URL + '/a/' + id.toString('hex');

  // filter incoming headers
  const header_excludes = config.get('worker.headers_exclude');
  const worker_headers = { ...headers };
  for (const exclude of header_excludes) {
    delete worker_headers[exclude.toLowerCase()];
  }
  logger.debug('upload.headers', worker_headers);

  // do not compress the response to the local worker
  // https://www.exratione.com/2014/07/nodejs-handling-uncertain-http-response-compression/
  worker_headers['accept-encoding'] = ACCEPT_ENCODING_HEADER;

  payload.on('error', function (err) {
    logger.error('upload.payload.error', err);
  });

  logger.verbose('upload', url);
  var res, body;
  try {
    // The caller's content-length is forwarded above, which keeps this a
    // fixed-length request; the worker requires that header.
    res = await fetch(url, {
      method: 'POST',
      headers: worker_headers,
      body: payload,
      duplex: 'half',
    });
    body = parseBody(await res.text());
  } catch (err) {
    logger.error('upload.network.error', err);
    throw AppError.processingError(err);
  }

  var nestedError = null;
  if (body && body[0] && body[0].error) {
    nestedError = body[0].error;
  }
  if (res.status >= 400 || (body && body.error) || nestedError) {
    logger.error('upload.worker.error', nestedError || body);
    throw AppError.processingError(body);
  }

  logger.verbose('upload.response', body);
  return body;
};

exports.delete = async function deleteAvatar(id) {
  var url = WORKER_URL + '/a/' + id.toString('hex');
  logger.verbose('delete', url);

  var res, body;
  try {
    res = await fetch(url, { method: 'DELETE' });
    body = parseBody(await res.text());
  } catch (err) {
    logger.error('delete.network.error', err);
    throw AppError.processingError(err);
  }

  if (res.status >= 400 || (body && body.error)) {
    logger.error('delete.worker.error', body);
    throw AppError.processingError(body);
  }

  logger.verbose('delete.worker.response', body);
};
