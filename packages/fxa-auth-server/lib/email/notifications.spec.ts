/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Container from 'typedi';
import { StripeHelper } from '../payments/stripe';

const { AppError: error } = require('@fxa/accounts/errors');
const { mockLog } = require('../../test/mocks');
const notifications = require('./notifications');

const SIX_HOURS = 1000 * 60 * 60 * 6;

describe('lib/email/notifications:', () => {
  let now: number,
    del: jest.Mock,
    log: any,
    queue: any,
    emailRecord: any,
    db: any,
    mockStripeHelper: any;

  beforeEach(() => {
    mockStripeHelper = {
      hasActiveSubscription: async () => Promise.resolve(false),
    };
    Container.set(StripeHelper, mockStripeHelper);
    now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    del = jest.fn();
    log = mockLog();
    queue = {
      start: jest.fn(),
      on: jest.fn(),
    };
    emailRecord = {
      emailVerified: false,
      createdAt: now - SIX_HOURS - 1,
    };
    db = {
      accountRecord: jest.fn(() => Promise.resolve(emailRecord)),
      deleteAccount: jest.fn(() => Promise.resolve()),
    };
    notifications(log, error)(queue, db);
  });

  afterEach(() => {
    (Date.now as jest.Mock).mockRestore();
    Container.reset();
  });

  it('called queue.start', () => {
    expect(queue.start).toHaveBeenCalledTimes(1);
    expect(queue.start).toHaveBeenCalledWith();
  });

  it('called queue.on', () => {
    expect(queue.on).toHaveBeenCalledTimes(1);

    const args = queue.on.mock.calls[0];
    expect(args).toHaveLength(2);
    expect(args[0]).toBe('data');
    expect(typeof args[1]).toBe('function');
    expect(args[1]).toHaveLength(1);
  });

  describe('bounce message:', () => {
    beforeEach(() => {
      return queue.on.mock.calls[0][1]({
        del,
        mail: {
          headers: {
            'Content-Language': 'en-gb',
            'X-Flow-Begin-Time': now - 1,
            'X-Flow-Id': 'foo',
            'X-Template-Name': 'bar',
            'X-Template-Version': 'baz',
          },
        },
        bounce: {
          bouncedRecipients: ['wibble@example.com'],
        },
      });
    });

    it('logged a flow event', () => {
      expect(log.flowEvent).toHaveBeenCalledTimes(1);
      expect(log.flowEvent).toHaveBeenCalledWith({
        event: 'email.bar.bounced',
        flow_id: 'foo',
        flow_time: 1,
        time: now,
      });
    });

    it('logged an email event', () => {
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledWith('emailEvent', {
        bounced: true,
        domain: 'other',
        flow_id: 'foo',
        locale: 'en-gb',
        template: 'bar',
        templateVersion: 'baz',
        type: 'bounced',
      });
    });

    it('did not delete the account', () => {
      expect(db.accountRecord).toHaveBeenCalledTimes(1);
      expect(db.accountRecord).toHaveBeenCalledWith('wibble@example.com');

      expect(db.deleteAccount).toHaveBeenCalledTimes(0);
    });

    it('called message.del', () => {
      expect(del).toHaveBeenCalledTimes(1);
      expect(del).toHaveBeenCalledWith();
    });

    it('did not log an error', () => {
      expect(log.error).toHaveBeenCalledTimes(0);
    });
  });

  describe('complaint message, 2 recipients:', () => {
    beforeEach(() => {
      return queue.on.mock.calls[0][1]({
        del,
        mail: {
          headers: {
            'Content-Language': 'fr',
            'X-Flow-Begin-Time': now - 2,
            'X-Flow-Id': 'wibble',
            'X-Template-Name': 'blee',
          },
        },
        complaint: {
          complainedRecipients: ['foo@example.com', 'pmbooth@gmail.com'],
        },
      });
    });

    it('logged 2 flow events', () => {
      expect(log.flowEvent).toHaveBeenCalledTimes(2);

      expect(log.flowEvent).toHaveBeenNthCalledWith(1, {
        event: 'email.blee.bounced',
        flow_id: 'wibble',
        flow_time: 2,
        time: now,
      });

      expect(log.flowEvent).toHaveBeenNthCalledWith(2, {
        event: 'email.blee.bounced',
        flow_id: 'wibble',
        flow_time: 2,
        time: now,
      });
    });

    it('logged 2 email events', () => {
      expect(log.info).toHaveBeenCalledTimes(2);

      expect(log.info).toHaveBeenNthCalledWith(1, 'emailEvent', {
        complaint: true,
        domain: 'other',
        flow_id: 'wibble',
        locale: 'fr',
        template: 'blee',
        templateVersion: '',
        type: 'bounced',
      });

      expect(log.info).toHaveBeenNthCalledWith(2, 'emailEvent', {
        complaint: true,
        domain: 'gmail.com',
        flow_id: 'wibble',
        locale: 'fr',
        template: 'blee',
        templateVersion: '',
        type: 'bounced',
      });
    });

    it('did not delete the accounts', () => {
      expect(db.accountRecord).toHaveBeenCalledTimes(2);
      expect(db.accountRecord).toHaveBeenNthCalledWith(1, 'foo@example.com');
      expect(db.accountRecord).toHaveBeenNthCalledWith(2, 'pmbooth@gmail.com');

      expect(db.deleteAccount).toHaveBeenCalledTimes(0);
    });

    it('called message.del', () => {
      expect(del).toHaveBeenCalledTimes(1);
    });

    it('did not log an error', () => {
      expect(log.error).toHaveBeenCalledTimes(0);
    });
  });

  describe('bounce message, 2 recipients, new unverified account:', () => {
    beforeEach(() => {
      emailRecord.createdAt += 1;
      return queue.on.mock.calls[0][1]({
        del,
        mail: {
          headers: {
            'Content-Language': 'en-gb',
            'X-Flow-Begin-Time': now - 1,
            'X-Flow-Id': 'foo',
            'X-Template-Name': 'bar',
            'X-Template-Version': 'baz',
          },
        },
        bounce: {
          bouncedRecipients: ['wibble@example.com', 'blee@example.com'],
        },
      });
    });

    it('logged events', () => {
      expect(log.flowEvent).toHaveBeenCalledTimes(2);

      expect(log.info).toHaveBeenCalledTimes(4);

      expect(log.info).toHaveBeenNthCalledWith(3, 'accountDeleted', {
        emailVerified: false,
        createdAt: emailRecord.createdAt,
      });

      expect(log.info).toHaveBeenNthCalledWith(4, 'accountDeleted', {
        emailVerified: false,
        createdAt: emailRecord.createdAt,
      });
    });

    it('deleted the accounts', () => {
      expect(db.accountRecord).toHaveBeenCalledTimes(2);
      expect(db.accountRecord).toHaveBeenNthCalledWith(1, 'wibble@example.com');
      expect(db.accountRecord).toHaveBeenNthCalledWith(2, 'blee@example.com');

      expect(db.deleteAccount).toHaveBeenCalledTimes(2);
      expect(db.deleteAccount).toHaveBeenNthCalledWith(1, emailRecord);
      expect(db.deleteAccount).toHaveBeenNthCalledWith(2, emailRecord);
    });

    it('called message.del', () => {
      expect(del).toHaveBeenCalledTimes(1);
    });

    it('did not log an error', () => {
      expect(log.error).toHaveBeenCalledTimes(0);
    });
  });

  describe('complaint message, new unverified account:', () => {
    beforeEach(() => {
      emailRecord.createdAt += 1;
      return queue.on.mock.calls[0][1]({
        del,
        mail: {
          headers: {
            'Content-Language': 'fr',
            'X-Flow-Begin-Time': now - 2,
            'X-Flow-Id': 'wibble',
            'X-Template-Name': 'blee',
          },
        },
        complaint: {
          complainedRecipients: ['foo@example.com'],
        },
      });
    });

    it('logged events', () => {
      expect(log.flowEvent).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledTimes(2);
    });

    it('deleted the account', () => {
      expect(db.accountRecord).toHaveBeenCalledTimes(1);
      expect(db.deleteAccount).toHaveBeenCalledTimes(1);
    });

    it('called message.del', () => {
      expect(del).toHaveBeenCalledTimes(1);
    });

    it('did not log an error', () => {
      expect(log.error).toHaveBeenCalledTimes(0);
    });
  });

  describe('complaint message, new unverified account with active subscription', () => {
    beforeEach(() => {
      emailRecord.createdAt += 1;
      mockStripeHelper.hasActiveSubscription = async () =>
        Promise.resolve(true);
      return queue.on.mock.calls[0][1]({
        del,
        mail: {
          headers: {
            'Content-Language': 'fr',
            'X-Flow-Begin-Time': now - 2,
            'X-Flow-Id': 'wibble',
            'X-Template-Name': 'blee',
          },
        },
        complaint: {
          complainedRecipients: ['foo@example.com'],
        },
      });
    });

    it('logged events', () => {
      expect(log.flowEvent).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledTimes(1);
    });

    it('did not delete the account', () => {
      expect(db.accountRecord).toHaveBeenCalledTimes(1);
      expect(db.deleteAccount).toHaveBeenCalledTimes(0);
    });

    it('called message.del', () => {
      expect(del).toHaveBeenCalledTimes(1);
    });

    it('did not log an error', () => {
      expect(log.error).toHaveBeenCalledTimes(0);
    });
  });

  describe('bounce message, new verified account:', () => {
    beforeEach(() => {
      emailRecord.createdAt += 1;
      emailRecord.emailVerified = true;
      return queue.on.mock.calls[0][1]({
        del,
        mail: {
          headers: {
            'Content-Language': 'en-gb',
            'X-Flow-Begin-Time': now - 1,
            'X-Flow-Id': 'foo',
            'X-Template-Name': 'bar',
            'X-Template-Version': 'baz',
          },
        },
        bounce: {
          bouncedRecipients: ['wibble@example.com'],
        },
      });
    });

    it('logged events', () => {
      expect(log.flowEvent).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledTimes(1);
    });

    it('did not delete the account', () => {
      expect(db.accountRecord).toHaveBeenCalledTimes(1);
      expect(db.deleteAccount).toHaveBeenCalledTimes(0);
    });

    it('called message.del', () => {
      expect(del).toHaveBeenCalledTimes(1);
    });

    it('did not log an error', () => {
      expect(log.error).toHaveBeenCalledTimes(0);
    });
  });

  describe('delivery message, new unverified account:', () => {
    beforeEach(() => {
      emailRecord.createdAt += 1;
      return queue.on.mock.calls[0][1]({
        del,
        mail: {
          headers: {
            'Content-Language': 'en-gb',
            'X-Flow-Begin-Time': now - 1,
            'X-Flow-Id': 'foo',
            'X-Template-Name': 'bar',
            'X-Template-Version': 'baz',
          },
        },
        delivery: {
          recipients: ['wibble@example.com'],
        },
      });
    });

    it('logged a flow event', () => {
      expect(log.flowEvent).toHaveBeenCalledTimes(1);
      expect(log.flowEvent).toHaveBeenCalledWith({
        event: 'email.bar.delivered',
        flow_id: 'foo',
        flow_time: 1,
        time: now,
      });
    });

    it('logged an email event', () => {
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledWith('emailEvent', {
        domain: 'other',
        flow_id: 'foo',
        locale: 'en-gb',
        template: 'bar',
        templateVersion: 'baz',
        type: 'delivered',
      });
    });

    it('did not delete the account', () => {
      expect(db.accountRecord).toHaveBeenCalledTimes(0);
      expect(db.deleteAccount).toHaveBeenCalledTimes(0);
    });

    it('called message.del', () => {
      expect(del).toHaveBeenCalledTimes(1);
    });

    it('did not log an error', () => {
      expect(log.error).toHaveBeenCalledTimes(0);
    });
  });

  describe('missing headers:', () => {
    beforeEach(() => {
      return queue.on.mock.calls[0][1]({
        del,
        mail: {},
        bounce: {
          bouncedRecipients: ['wibble@example.com'],
        },
      });
    });

    it('logged an error', () => {
      expect(log.error.mock.calls.length).toBeGreaterThanOrEqual(1);

      expect(log.error).toHaveBeenNthCalledWith(1, 'emailHeaders.missing', {
        origin: 'notification',
      });
    });

    it('did not log a flow event', () => {
      expect(log.flowEvent).toHaveBeenCalledTimes(0);
    });

    it('logged an email event', () => {
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledWith('emailEvent', {
        bounced: true,
        domain: 'other',
        locale: '',
        template: '',
        templateVersion: '',
        type: 'bounced',
      });
    });

    it('did not delete the account', () => {
      expect(db.accountRecord).toHaveBeenCalledTimes(1);
      expect(db.deleteAccount).toHaveBeenCalledTimes(0);
    });

    it('called message.del', () => {
      expect(del).toHaveBeenCalledTimes(1);
    });
  });
});
