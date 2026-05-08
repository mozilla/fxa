/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('insist');

const AppError = require('../lib/error');

describe('AppError.from', function () {
  it('preserves AppError-shape payload (code/errno/error/message/info)', function () {
    const err = AppError.from({
      code: 400,
      errno: 102,
      error: 'Bad Request',
      message: 'Unknown account',
      info: 'https://example.com/docs',
    });
    assert.equal(err.errno, 102);
    assert.equal(err.message, 'Unknown account');
    assert.equal(err.output.statusCode, 400);
    assert.equal(err.output.payload.code, 400);
    assert.equal(err.output.payload.errno, 102);
    assert.equal(err.output.payload.error, 'Bad Request');
    assert.equal(err.output.payload.message, 'Unknown account');
    assert.equal(err.output.payload.info, 'https://example.com/docs');
  });

  it('preserves Boom-shape payload (statusCode mapped to code)', function () {
    const err = AppError.from({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Bad token',
    });
    assert.equal(err.message, 'Bad token');
    assert.equal(err.output.statusCode, 401);
    assert.equal(err.output.payload.code, 401);
    assert.equal(err.output.payload.error, 'Unauthorized');
    // Boom-shape inputs have no errno, so we still attach the raw upstream so
    // Sentry can see what we received.
    assert.deepEqual(err.output.payload.upstream, {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Bad token',
    });
  });

  it('unwraps a Boom error with output.payload', function () {
    const boom = {
      isBoom: true,
      output: {
        statusCode: 503,
        payload: {
          code: 503,
          errno: 105,
          error: 'Service Unavailable',
          message: 'Auth server error',
        },
      },
    };
    const err = AppError.from(boom);
    assert.equal(err.errno, 105);
    assert.equal(err.message, 'Auth server error');
    assert.equal(err.output.statusCode, 503);
  });

  it('falls back to defaults but preserves raw upstream for an empty object', function () {
    const err = AppError.from({});
    assert.equal(err.errno, 999);
    assert.equal(err.message, 'Unspecified error');
    assert.deepEqual(err.output.payload.upstream, {});
  });

  it('handles null without throwing', function () {
    const err = AppError.from(null);
    assert.equal(err.errno, 999);
    assert.equal(err.message, 'Unspecified error');
    assert.equal(err.output.payload.upstream, null);
  });

  it('handles undefined without throwing', function () {
    const err = AppError.from(undefined);
    assert.equal(err.errno, 999);
    assert.equal(err.message, 'Unspecified error');
    assert.equal(err.output.payload.upstream, null);
  });

  it('extracts message from a plain Error instance', function () {
    const err = AppError.from(new Error('underlying boom'));
    assert.equal(err.message, 'underlying boom');
    // No errno on a plain Error, so upstream is preserved for context.
    assert.ok('upstream' in err.output.payload);
  });

  it('preserves Joi validation array when present', function () {
    const err = AppError.from({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid request parameter',
      validation: { source: 'payload', keys: ['email'] },
    });
    assert.deepEqual(err.output.payload.validation, {
      source: 'payload',
      keys: ['email'],
    });
  });

  it('merges context into payload (e.g. from batch.js)', function () {
    const err = AppError.from(
      { statusCode: 502, error: 'Bad Gateway', message: 'upstream' },
      { batchUrl: '/v1/_core_profile', batchStatusCode: 502 }
    );
    assert.equal(err.output.payload.batchUrl, '/v1/_core_profile');
    assert.equal(err.output.payload.batchStatusCode, 502);
    assert.equal(err.output.payload.message, 'upstream');
  });

  it('preserves cause when present', function () {
    const cause = new Error('root cause');
    const err = AppError.from({ message: 'wrapper', cause: cause });
    assert.equal(err.cause, cause);
  });
});
