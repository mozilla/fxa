/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AppError from './error';

describe('AppError.from', () => {
  it('preserves AppError-shape payload (code/errno/error/message/info)', () => {
    const err = AppError.from({
      code: 400,
      errno: 102,
      error: 'Bad Request',
      message: 'Unknown account',
      info: 'https://example.com/docs',
    });
    expect(err.errno).toBe(102);
    expect(err.message).toBe('Unknown account');
    expect(err.output.statusCode).toBe(400);
    expect(err.output.payload.code).toBe(400);
    expect(err.output.payload.errno).toBe(102);
    expect(err.output.payload.error).toBe('Bad Request');
    expect(err.output.payload.message).toBe('Unknown account');
    expect(err.output.payload.info).toBe('https://example.com/docs');
  });

  it('preserves Boom-shape payload (statusCode mapped to code)', () => {
    const err = AppError.from({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Bad token',
    });
    expect(err.message).toBe('Bad token');
    expect(err.output.statusCode).toBe(401);
    expect(err.output.payload.code).toBe(401);
    expect(err.output.payload.error).toBe('Unauthorized');
    // Boom-shape inputs have no errno, so we still attach the raw upstream so
    // Sentry can see what we received.
    expect(err.output.payload.upstream).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Bad token',
    });
  });

  it('unwraps a Boom error with output.payload', () => {
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
    expect(err.errno).toBe(105);
    expect(err.message).toBe('Auth server error');
    expect(err.output.statusCode).toBe(503);
  });

  it('falls back to defaults but preserves raw upstream for an empty object', () => {
    const err = AppError.from({});
    expect(err.errno).toBe(999);
    expect(err.message).toBe('Unspecified error');
    expect(err.output.payload.upstream).toEqual({});
  });

  it('handles null without throwing', () => {
    const err = AppError.from(null);
    expect(err.errno).toBe(999);
    expect(err.message).toBe('Unspecified error');
    expect(err.output.payload.upstream).toBeNull();
  });

  it('handles undefined without throwing', () => {
    const err = AppError.from(undefined);
    expect(err.errno).toBe(999);
    expect(err.message).toBe('Unspecified error');
    expect(err.output.payload.upstream).toBeNull();
  });

  it('extracts message from a plain Error instance', () => {
    const err = AppError.from(new Error('underlying boom'));
    expect(err.message).toBe('underlying boom');
    // No errno on a plain Error, so upstream is preserved for context.
    expect('upstream' in err.output.payload).toBe(true);
  });

  it('preserves Joi validation array when present', () => {
    const err = AppError.from({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid request parameter',
      validation: { source: 'payload', keys: ['email'] },
    });
    expect(err.output.payload.validation).toEqual({
      source: 'payload',
      keys: ['email'],
    });
  });

  it('merges context into payload (e.g. from batch.js)', () => {
    const err = AppError.from(
      { statusCode: 502, error: 'Bad Gateway', message: 'upstream' },
      { batchUrl: '/v1/_core_profile', batchStatusCode: 502 }
    );
    expect(err.output.payload.batchUrl).toBe('/v1/_core_profile');
    expect(err.output.payload.batchStatusCode).toBe(502);
    expect(err.output.payload.message).toBe('upstream');
  });

  it('preserves cause when present', () => {
    const cause = new Error('root cause');
    const err = AppError.from({ message: 'wrapper', cause: cause });
    expect(err.cause).toBe(cause);
  });
});
