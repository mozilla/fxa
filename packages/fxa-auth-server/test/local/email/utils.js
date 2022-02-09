/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const { assert } = require('chai');
const { mockLog } = require('../../mocks');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const amplitude = sinon.spy();
const emailHelpers = proxyquire(`${ROOT_DIR}/lib/email/utils/helpers`, {
  '../../metrics/amplitude': () => amplitude,
});

describe('email utils helpers', () => {
  afterEach(() => amplitude.resetHistory());

  describe('getHeaderValue', () => {
    it('works with message.mail.headers', () => {
      const message = {
        mail: {
          headers: [
            {
              name: 'content-language',
              value: 'en-US',
            },
          ],
        },
      };

      const value = emailHelpers.getHeaderValue('Content-Language', message);
      assert.equal(value, message.mail.headers[0].value);
    });

    it('works with message.headers', () => {
      const message = {
        headers: [
          {
            name: 'content-language',
            value: 'ru',
          },
        ],
      };

      const value = emailHelpers.getHeaderValue('Content-Language', message);
      assert.equal(value, message.headers[0].value);
    });
  });

  describe('logEmailEventSent', () => {
    it('should check headers case-insensitively', () => {
      const log = mockLog();
      const message = {
        email: 'user@example.domain',
        template: 'verifyEmail',
        headers: {
          'cOnTeNt-LaNgUaGe': 'ru',
        },
      };
      emailHelpers.logEmailEventSent(log, message);
      assert.equal(log.info.callCount, 1);
      assert.equal(log.info.args[0][1].locale, 'ru');
    });

    it('should log an event per CC email', () => {
      const log = mockLog();
      const message = {
        email: 'user@example.domain',
        ccEmails: ['noreply@gmail.com', 'noreply@yahoo.com'],
        template: 'verifyEmail',
      };
      emailHelpers.logEmailEventSent(log, message);
      assert.equal(log.info.callCount, 3);
      assert.equal(log.info.args[0][1].domain, 'other');
      assert.equal(log.info.args[1][1].domain, 'gmail.com');
      assert.equal(log.info.args[2][1].domain, 'yahoo.com');
    });
  });

  it('logEmailEventSent should call amplitude correctly', async () => {
    emailHelpers.logEmailEventSent(mockLog(), {
      email: 'foo@example.com',
      ccEmails: ['bar@example.com', 'baz@example.com'],
      template: 'verifyEmail',
      headers: [{ name: 'Content-Language', value: 'aaa' }],
      deviceId: 'bbb',
      flowBeginTime: 42,
      flowId: 'ccc',
      service: 'ddd',
      templateVersion: 'eee',
      uid: 'fff',
      planId: 'planId',
      productId: 'productId',
    });
    assert.equal(amplitude.callCount, 1);
    const args = amplitude.args[0];
    assert.equal(args.length, 4);
    assert.equal(args[0], 'email.verifyEmail.sent');
    args[1].app.devices = await args[1].app.devices;
    assert.deepEqual(args[1], {
      app: {
        devices: [],
        geo: {
          location: {},
        },
        locale: 'aaa',
        ua: {},
      },
      auth: {},
      query: {},
      payload: {},
    });
    assert.deepEqual(args[2], {
      email_domain: 'other',
      plan_id: 'planId',
      product_id: 'productId',
      service: 'ddd',
      templateVersion: 'eee',
      uid: 'fff',
    });
    assert.equal(args[3].device_id, 'bbb');
    assert.equal(args[3].flow_id, 'ccc');
    assert.equal(args[3].flowBeginTime, 42);
    assert.ok(args[3].time > Date.now() - 1000);
  });

  it('logEmailEventFromMessage should call amplitude correctly', async () => {
    emailHelpers.logEmailEventFromMessage(
      mockLog(),
      {
        email: 'foo@example.com',
        ccEmails: ['bar@example.com', 'baz@example.com'],
        headers: [
          { name: 'Content-Language', value: 'a' },
          { name: 'X-Device-Id', value: 'b' },
          { name: 'X-Flow-Begin-Time', value: 1 },
          { name: 'X-Flow-Id', value: 'c' },
          { name: 'X-Service-Id', value: 'd' },
          { name: 'X-Template-Name', value: 'verifyLoginEmail' },
          { name: 'X-Template-Version', value: 42 },
          { name: 'X-Uid', value: 'e' },
        ],
        planId: 'planId',
        productId: 'productId',
      },
      'bounced',
      'gmail'
    );
    assert.equal(amplitude.callCount, 1);
    const args = amplitude.args[0];
    assert.equal(args.length, 4);
    assert.equal(args[0], 'email.verifyLoginEmail.bounced');
    args[1].app.devices = await args[1].app.devices;
    assert.deepEqual(args[1], {
      app: {
        devices: [],
        geo: {
          location: {},
        },
        locale: 'a',
        ua: {},
      },
      auth: {},
      query: {},
      payload: {},
    });
    assert.deepEqual(args[2], {
      email_domain: 'gmail',
      service: 'd',
      templateVersion: 42,
      uid: 'e',
      plan_id: 'planId',
      product_id: 'productId',
    });
    assert.equal(args[3].device_id, 'b');
    assert.equal(args[3].flow_id, 'c');
    assert.equal(args[3].flowBeginTime, 1);
  });

  describe('logErrorIfHeadersAreWeirdOrMissing', () => {
    let log;

    beforeEach(() => {
      log = mockLog();
    });

    it('logs an error if message.mail is missing', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, {}, 'wibble');
      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0].length, 2);
      assert.equal(log.error.args[0][0], 'emailHeaders.missing');
      assert.deepEqual(log.error.args[0][1], {
        origin: 'wibble',
      });
      assert.equal(log.warn.callCount, 0);
    });

    it('logs an error if message.mail.headers is missing', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(
        log,
        { mail: {} },
        'blee'
      );
      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0], 'emailHeaders.missing');
      assert.deepEqual(log.error.args[0][1], {
        origin: 'blee',
      });
      assert.equal(log.warn.callCount, 0);
    });

    it('does not log an error/warning if message.mail.headers is object and deviceId is set', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, {
        mail: {
          headers: {
            'X-Device-Id': 'foo',
          },
        },
      });
      assert.equal(log.error.callCount, 0);
      assert.equal(log.warn.callCount, 0);
    });

    it('does not log an error/warning if message.mail.headers is object and deviceId is set (lowercase)', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, {
        mail: {
          headers: {
            'x-device-id': 'bar',
          },
        },
      });
      assert.equal(log.error.callCount, 0);
      assert.equal(log.warn.callCount, 0);
    });

    it('does not log an error/warning if message.mail.headers is object and uid is set', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, {
        mail: {
          headers: {
            'X-Uid': 'foo',
          },
        },
      });
      assert.equal(log.error.callCount, 0);
      assert.equal(log.warn.callCount, 0);
    });

    it('does not log an error/warning if message.mail.headers is object and uid is set (lowercase)', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, {
        mail: {
          headers: {
            'x-uid': 'bar',
          },
        },
      });
      assert.equal(log.error.callCount, 0);
      assert.equal(log.warn.callCount, 0);
    });

    it('logs a warning if message.mail.headers is object and deviceId and uid are missing', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(
        log,
        {
          mail: {
            headers: {
              'X-Template-Name': 'foo',
              'X-Xxx': 'bar',
              'X-Yyy': 'baz',
              'X-Zzz': 'qux',
            },
          },
        },
        'wibble'
      );
      assert.equal(log.error.callCount, 0);
      assert.equal(log.warn.callCount, 1);
      assert.equal(log.warn.args[0].length, 2);
      assert.equal(log.warn.args[0][0], 'emailHeaders.keys');
      assert.deepEqual(log.warn.args[0][1], {
        keys: 'X-Template-Name,X-Xxx,X-Yyy,X-Zzz',
        template: 'foo',
        origin: 'wibble',
      });
    });

    it('logs a warning if message.headers is object and deviceId and uid are missing', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(
        log,
        {
          headers: {
            'x-template-name': 'wibble',
          },
        },
        'blee'
      );
      assert.equal(log.error.callCount, 0);
      assert.equal(log.warn.callCount, 1);
      assert.equal(log.warn.args[0][0], 'emailHeaders.keys');
      assert.deepEqual(log.warn.args[0][1], {
        keys: 'x-template-name',
        template: 'wibble',
        origin: 'blee',
      });
    });

    it('logs an error if message.mail.headers is non-object', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(
        log,
        { mail: { headers: 'foo' } },
        'wibble'
      );
      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0], 'emailHeaders.weird');
      assert.deepEqual(log.error.args[0][1], {
        type: 'string',
        origin: 'wibble',
      });
      assert.equal(log.warn.callCount, 0);
    });

    it('logs an error if message.headers is non-object', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(
        log,
        { mail: {}, headers: 42 },
        'wibble'
      );
      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0], 'emailHeaders.weird');
      assert.deepEqual(log.error.args[0][1], {
        type: 'number',
        origin: 'wibble',
      });
      assert.equal(log.warn.callCount, 0);
    });
  });
});
