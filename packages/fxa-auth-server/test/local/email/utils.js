/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const { mockLog } = require('../../mocks');
const sinon = require('sinon');
const { default: Container } = require('typedi');
const { AccountEventsManager } = require('../../../lib/account-events');

const emailHelpers = require('../../../lib/email/utils/helpers');

describe('email utils helpers', () => {

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

  describe('logAccountEventFromMessage', () => {
    let mockAccountEventsManager;
    beforeEach(() => {
      mockAccountEventsManager = {
        recordEmailEvent: sinon.stub(),
        recordSecurityEvent: sinon.stub().resolves({}),
      };
      Container.set(AccountEventsManager, mockAccountEventsManager);
    });

    afterEach(() => {
      Container.reset();
    });

    it('should call account events manager from valid message', async () => {
      emailHelpers.logAccountEventFromMessage(
        {
          headers: [
            { name: 'X-Template-Name', value: 'recovery' },
            { name: 'X-Flow-Id', value: 'flowId' },
            { name: 'X-Uid', value: 'uid' },
            { name: 'X-Service-Id', value: 'service' },
          ],
        },
        'emailBounced'
      );
      sinon.assert.calledOnceWithExactly(
        mockAccountEventsManager.recordEmailEvent,
        'uid',
        {
          template: 'recovery',
          flowId: 'flowId',
          service: 'service',
        },
        'emailBounced'
      );
    });

    it('ignores if no uid', async () => {
      emailHelpers.logAccountEventFromMessage(
        {
          headers: [
            { name: 'X-Template-Name', value: 'recovery' },
            { name: 'X-Flow-Id', value: 'flowId' },
            { name: 'X-Service-Id', value: 'service' },
          ],
        },
        'emailBounced'
      );
      sinon.assert.notCalled(mockAccountEventsManager.recordEmailEvent);
    });

    it('not called if firestore disable', async () => {
      Container.remove(AccountEventsManager);
      emailHelpers.logAccountEventFromMessage(
        {
          headers: [
            { name: 'X-Template-Name', value: 'recovery' },
            { name: 'X-Flow-Id', value: 'flowId' },
            { name: 'X-Uid', value: 'uid' },
            { name: 'X-Service-Id', value: 'service' },
          ],
        },
        'emailBounced'
      );
      sinon.assert.notCalled(mockAccountEventsManager.recordEmailEvent);
    });
  });
});
