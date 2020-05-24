/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const { assert } = require('chai');
const proxyquire = require('proxyquire');

const config = require(`${ROOT_DIR}/config`).getProperties();
const emailConfig = {
  cc: ['bar@test.com', 'baz@test.com'],
  to: 'foo@test.com',
  subject: 'subject',
  text: 'text',
  html: '<p>html</p>',
  headers: {
    'x-header': 'yeah',
    'x-numbers': 9999,
    'x-null-header': null,
  },
};

describe('lib/senders/email_service', () => {
  it('emailService serializes options correctly', (done) => {
    const mock = {
      request: function (config, cb) {
        cb(config);
      },
    };

    const emailService = proxyquire(
      `${ROOT_DIR}/lib/senders/email_service`,
      mock
    )(config);
    emailService.sendMail(emailConfig, (serialized) => {
      assert.equal(
        serialized.url,
        `http://${config.emailService.host}:${config.emailService.port}/send`
      );
      assert.equal(serialized.method, 'POST');
      assert.equal(serialized.json, true);
      assert.deepEqual(serialized.body.cc, ['bar@test.com', 'baz@test.com']);
      assert.equal(serialized.body.to, 'foo@test.com');
      assert.equal(serialized.body.subject, 'subject');
      assert.equal(serialized.body.body.text, 'text');
      assert.equal(serialized.body.body.html, '<p>html</p>');
      assert.equal(serialized.body.headers['x-header'], 'yeah');
      assert.equal(serialized.body.headers['x-numbers'], '9999');
      done();
    });
  });

  it('emailService handles successful request and response', (done) => {
    const mock = {
      request: function (config, cb) {
        cb(
          null,
          {
            statusCode: 200,
          },
          {
            messageId: 'woopwoop',
          }
        );
      },
    };

    const emailService = proxyquire(
      `${ROOT_DIR}/lib/senders/email_service`,
      mock
    )(config);
    emailService.sendMail(emailConfig, (err, body) => {
      assert.equal(err, null);
      assert.equal(body.messageId, 'woopwoop');
      assert.equal(body.message, undefined);
      done();
    });
  });

  it('emailService handles 500 response', (done) => {
    const mock = {
      request: function (config, cb) {
        cb(
          null,
          {
            statusCode: 500,
          },
          {
            code: '500',
            error: 'InternalServerError',
            errno: 104,
            message: 'FREAKOUT',
            name: 'SES',
          }
        );
      },
    };

    const emailService = proxyquire(
      `${ROOT_DIR}/lib/senders/email_service`,
      mock
    )(config);
    emailService.sendMail(emailConfig, (err, body) => {
      assert.equal(err.errno, 999);
      assert.equal(err.output.statusCode, 500);
      assert.equal(body.messageId, undefined);
      assert.equal(body.message, 'FREAKOUT');
      done();
    });
  });

  it('emailService handles old 429 response', (done) => {
    const mock = {
      request: function (config, cb) {
        cb(
          null,
          {
            statusCode: 429,
          },
          {
            code: '429',
            errno: 106,
            error: 'BounceComplaintError',
            message: 'FREAKOUT',
            bouncedAt: 1533641031755,
          }
        );
      },
    };

    const emailService = proxyquire(
      `${ROOT_DIR}/lib/senders/email_service`,
      mock
    )(config);
    emailService.sendMail(emailConfig, (err, body) => {
      assert.equal(err.errno, 133);
      assert.equal(err.output.statusCode, 400);
      assert.equal(err.output.payload.bouncedAt, 1533641031755);
      assert.equal(err.message, 'Email account sent complaint');
      assert.equal(body.messageId, undefined);
      assert.equal(body.message, 'FREAKOUT');
      done();
    });
  });

  it('emailService handles new 429 response', (done) => {
    const mock = {
      request: function (config, cb) {
        cb(
          null,
          {
            statusCode: 429,
          },
          {
            code: '429',
            errno: 106,
            error: 'BounceComplaintError',
            message: 'FREAKOUT',
            time: 1533641031755,
          }
        );
      },
    };

    const emailService = proxyquire(
      `${ROOT_DIR}/lib/senders/email_service`,
      mock
    )(config);
    emailService.sendMail(emailConfig, (err, body) => {
      assert.equal(err.errno, 133);
      assert.equal(err.output.statusCode, 400);
      assert.equal(err.output.payload.bouncedAt, 1533641031755);
      assert.equal(err.message, 'Email account sent complaint');
      assert.equal(body.messageId, undefined);
      assert.equal(body.message, 'FREAKOUT');
      done();
    });
  });

  it('emailService handles unsuccessful request', (done) => {
    const mock = {
      request: function (config, cb) {
        cb(Error('FREAKOUT'), undefined, undefined);
      },
    };

    const emailService = proxyquire(
      `${ROOT_DIR}/lib/senders/email_service`,
      mock
    )(config);
    emailService.sendMail(emailConfig, (err, body) => {
      assert(err instanceof Error);
      assert.equal(err.message, 'FREAKOUT');
      assert.equal(body.messageId, undefined);
      assert.equal(body.message, undefined);
      done();
    });
  });
});
