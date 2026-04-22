/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Container from 'typedi';
import { AccountEventsManager } from '../../account-events';

const amplitude = jest.fn();

jest.mock('../../../lib/metrics/amplitude', () => () => amplitude);

const { mockLog } = require('../../../test/mocks');
const emailHelpers = require('./helpers');

describe('email utils helpers', () => {
  afterEach(() => amplitude.mockClear());

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
      expect(value).toBe(message.mail.headers[0].value);
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
      expect(value).toBe(message.headers[0].value);
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
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ locale: 'ru' })
      );
    });

    it('should log an event per CC email', () => {
      const log = mockLog();
      const message = {
        email: 'user@example.domain',
        ccEmails: ['noreply@gmail.com', 'noreply@yahoo.com'],
        template: 'verifyEmail',
      };
      emailHelpers.logEmailEventSent(log, message);
      expect(log.info).toHaveBeenCalledTimes(3);
      expect(log.info).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.objectContaining({ domain: 'other' })
      );
      expect(log.info).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.objectContaining({ domain: 'gmail.com' })
      );
      expect(log.info).toHaveBeenNthCalledWith(
        3,
        expect.anything(),
        expect.objectContaining({ domain: 'yahoo.com' })
      );
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
    expect(amplitude).toHaveBeenCalledTimes(1);
    const args = amplitude.mock.calls[0];
    expect(args).toHaveLength(4);
    expect(args[0]).toBe('email.verifyEmail.sent');
    args[1].app.devices = await args[1].app.devices;
    expect(args[1]).toEqual({
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
    expect(args[2]).toEqual({
      email_domain: 'other',
      plan_id: 'planId',
      product_id: 'productId',
      service: 'ddd',
      templateVersion: 'eee',
      uid: 'fff',
    });
    expect(args[3].device_id).toBe('bbb');
    expect(args[3].flow_id).toBe('ccc');
    expect(args[3].flowBeginTime).toBe(42);
    expect(args[3].time).toBeGreaterThan(Date.now() - 1000);
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
    expect(amplitude).toHaveBeenCalledTimes(1);
    const args = amplitude.mock.calls[0];
    expect(args).toHaveLength(4);
    expect(args[0]).toBe('email.verifyLoginEmail.bounced');
    args[1].app.devices = await args[1].app.devices;
    expect(args[1]).toEqual({
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
    expect(args[2]).toEqual({
      email_domain: 'gmail',
      service: 'd',
      templateVersion: 42,
      uid: 'e',
      plan_id: 'planId',
      product_id: 'productId',
    });
    expect(args[3].device_id).toBe('b');
    expect(args[3].flow_id).toBe('c');
    expect(args[3].flowBeginTime).toBe(1);
  });

  describe('logErrorIfHeadersAreWeirdOrMissing', () => {
    let log: any;

    beforeEach(() => {
      log = mockLog();
    });

    it('logs an error if message.mail is missing', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, {}, 'wibble');
      expect(log.error).toHaveBeenCalledTimes(1);
      expect(log.error).toHaveBeenCalledWith('emailHeaders.missing', {
        origin: 'wibble',
      });
      expect(log.warn).toHaveBeenCalledTimes(0);
    });

    it('logs an error if message.mail.headers is missing', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(
        log,
        { mail: {} },
        'blee'
      );
      expect(log.error).toHaveBeenCalledTimes(1);
      expect(log.error).toHaveBeenCalledWith('emailHeaders.missing', {
        origin: 'blee',
      });
      expect(log.warn).toHaveBeenCalledTimes(0);
    });

    it('does not log an error/warning if message.mail.headers is object and deviceId is set', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, {
        mail: {
          headers: {
            'X-Device-Id': 'foo',
          },
        },
      });
      expect(log.error).toHaveBeenCalledTimes(0);
      expect(log.warn).toHaveBeenCalledTimes(0);
    });

    it('does not log an error/warning if message.mail.headers is object and deviceId is set (lowercase)', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, {
        mail: {
          headers: {
            'x-device-id': 'bar',
          },
        },
      });
      expect(log.error).toHaveBeenCalledTimes(0);
      expect(log.warn).toHaveBeenCalledTimes(0);
    });

    it('does not log an error/warning if message.mail.headers is object and uid is set', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, {
        mail: {
          headers: {
            'X-Uid': 'foo',
          },
        },
      });
      expect(log.error).toHaveBeenCalledTimes(0);
      expect(log.warn).toHaveBeenCalledTimes(0);
    });

    it('does not log an error/warning if message.mail.headers is object and uid is set (lowercase)', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, {
        mail: {
          headers: {
            'x-uid': 'bar',
          },
        },
      });
      expect(log.error).toHaveBeenCalledTimes(0);
      expect(log.warn).toHaveBeenCalledTimes(0);
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
      expect(log.error).toHaveBeenCalledTimes(0);
      expect(log.warn).toHaveBeenCalledTimes(1);
      expect(log.warn).toHaveBeenCalledWith('emailHeaders.keys', {
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
      expect(log.error).toHaveBeenCalledTimes(0);
      expect(log.warn).toHaveBeenCalledTimes(1);
      expect(log.warn).toHaveBeenCalledWith('emailHeaders.keys', {
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
      expect(log.error).toHaveBeenCalledTimes(1);
      expect(log.error).toHaveBeenCalledWith('emailHeaders.weird', {
        type: 'string',
        origin: 'wibble',
      });
      expect(log.warn).toHaveBeenCalledTimes(0);
    });

    it('logs an error if message.headers is non-object', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(
        log,
        { mail: {}, headers: 42 },
        'wibble'
      );
      expect(log.error).toHaveBeenCalledTimes(1);
      expect(log.error).toHaveBeenCalledWith('emailHeaders.weird', {
        type: 'number',
        origin: 'wibble',
      });
      expect(log.warn).toHaveBeenCalledTimes(0);
    });
  });

  describe('logAccountEventFromMessage', () => {
    let mockAccountEventsManager: any;
    beforeEach(() => {
      mockAccountEventsManager = {
        recordEmailEvent: jest.fn(),
        recordSecurityEvent: jest.fn().mockResolvedValue({}),
      };
      Container.set(AccountEventsManager, mockAccountEventsManager);
    });

    afterEach(() => {
      Container.reset();
    });

    it('should call account events manager from valid message', () => {
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
      expect(mockAccountEventsManager.recordEmailEvent).toHaveBeenCalledTimes(
        1
      );
      expect(mockAccountEventsManager.recordEmailEvent).toHaveBeenCalledWith(
        'uid',
        {
          template: 'recovery',
          flowId: 'flowId',
          service: 'service',
        },
        'emailBounced'
      );
    });

    it('ignores if no uid', () => {
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
      expect(mockAccountEventsManager.recordEmailEvent).not.toHaveBeenCalled();
    });

    it('not called if firestore disable', () => {
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
      expect(mockAccountEventsManager.recordEmailEvent).not.toHaveBeenCalled();
    });
  });
});
