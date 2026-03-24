/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import Container from 'typedi';
import { StripeHelper } from '../payments/stripe';

const { AppError: error } = require('@fxa/accounts/errors');
const { mockLog } = require('../../test/mocks');
const notifications = require('./notifications');

const SIX_HOURS = 1000 * 60 * 60 * 6;

describe('lib/email/notifications:', () => {
  let now: number,
    del: sinon.SinonSpy,
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
    sinon.stub(Date, 'now').callsFake(() => now);
    del = sinon.spy();
    log = mockLog();
    queue = {
      start: sinon.spy(),
      on: sinon.spy(),
    };
    emailRecord = {
      emailVerified: false,
      createdAt: now - SIX_HOURS - 1,
    };
    db = {
      accountRecord: sinon.spy(() => Promise.resolve(emailRecord)),
      deleteAccount: sinon.spy(() => Promise.resolve()),
    };
    notifications(log, error)(queue, db);
  });

  afterEach(() => {
    (Date.now as sinon.SinonStub).restore();
    Container.reset();
  });

  it('called queue.start', () => {
    expect(queue.start.callCount).toBe(1);
    expect(queue.start.args[0]).toHaveLength(0);
  });

  it('called queue.on', () => {
    expect(queue.on.callCount).toBe(1);

    const args = queue.on.args[0];
    expect(args).toHaveLength(2);
    expect(args[0]).toBe('data');
    expect(typeof args[1]).toBe('function');
    expect(args[1]).toHaveLength(1);
  });

  describe('bounce message:', () => {
    beforeEach(() => {
      return queue.on.args[0][1]({
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
      expect(log.flowEvent.callCount).toBe(1);
      const args = log.flowEvent.args[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toEqual({
        event: 'email.bar.bounced',
        flow_id: 'foo',
        flow_time: 1,
        time: now,
      });
    });

    it('logged an email event', () => {
      expect(log.info.callCount).toBe(1);
      const args = log.info.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('emailEvent');
      expect(args[1]).toEqual({
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
      expect(db.accountRecord.callCount).toBe(1);
      const args = db.accountRecord.args[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBe('wibble@example.com');

      expect(db.deleteAccount.callCount).toBe(0);
    });

    it('called message.del', () => {
      expect(del.callCount).toBe(1);
      expect(del.args[0]).toHaveLength(0);
    });

    it('did not log an error', () => {
      expect(log.error.callCount).toBe(0);
    });
  });

  describe('complaint message, 2 recipients:', () => {
    beforeEach(() => {
      return queue.on.args[0][1]({
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
      expect(log.flowEvent.callCount).toBe(2);

      let args = log.flowEvent.args[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toEqual({
        event: 'email.blee.bounced',
        flow_id: 'wibble',
        flow_time: 2,
        time: now,
      });

      args = log.flowEvent.args[1];
      expect(args).toHaveLength(1);
      expect(args[0]).toEqual({
        event: 'email.blee.bounced',
        flow_id: 'wibble',
        flow_time: 2,
        time: now,
      });
    });

    it('logged 2 email events', () => {
      expect(log.info.callCount).toBe(2);

      let args = log.info.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('emailEvent');
      expect(args[1]).toEqual({
        complaint: true,
        domain: 'other',
        flow_id: 'wibble',
        locale: 'fr',
        template: 'blee',
        templateVersion: '',
        type: 'bounced',
      });

      args = log.info.args[1];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('emailEvent');
      expect(args[1]).toEqual({
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
      expect(db.accountRecord.callCount).toBe(2);

      let args = db.accountRecord.args[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBe('foo@example.com');

      args = db.accountRecord.args[1];
      expect(args).toHaveLength(1);
      expect(args[0]).toBe('pmbooth@gmail.com');

      expect(db.deleteAccount.callCount).toBe(0);
    });

    it('called message.del', () => {
      expect(del.callCount).toBe(1);
    });

    it('did not log an error', () => {
      expect(log.error.callCount).toBe(0);
    });
  });

  describe('bounce message, 2 recipients, new unverified account:', () => {
    beforeEach(() => {
      emailRecord.createdAt += 1;
      return queue.on.args[0][1]({
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
      expect(log.flowEvent.callCount).toBe(2);

      expect(log.info.callCount).toBe(4);

      let args = log.info.args[2];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('accountDeleted');
      expect(args[1]).toEqual({
        emailVerified: false,
        createdAt: emailRecord.createdAt,
      });

      args = log.info.args[3];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('accountDeleted');
      expect(args[1]).toEqual({
        emailVerified: false,
        createdAt: emailRecord.createdAt,
      });
    });

    it('deleted the accounts', () => {
      expect(db.accountRecord.callCount).toBe(2);

      let args = db.accountRecord.args[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBe('wibble@example.com');

      args = db.accountRecord.args[1];
      expect(args).toHaveLength(1);
      expect(args[0]).toBe('blee@example.com');

      expect(db.deleteAccount.callCount).toBe(2);

      args = db.deleteAccount.args[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBe(emailRecord);

      args = db.deleteAccount.args[1];
      expect(args).toHaveLength(1);
      expect(args[0]).toBe(emailRecord);
    });

    it('called message.del', () => {
      expect(del.callCount).toBe(1);
    });

    it('did not log an error', () => {
      expect(log.error.callCount).toBe(0);
    });
  });

  describe('complaint message, new unverified account:', () => {
    beforeEach(() => {
      emailRecord.createdAt += 1;
      return queue.on.args[0][1]({
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
      expect(log.flowEvent.callCount).toBe(1);
      expect(log.info.callCount).toBe(2);
    });

    it('deleted the account', () => {
      expect(db.accountRecord.callCount).toBe(1);
      expect(db.deleteAccount.callCount).toBe(1);
    });

    it('called message.del', () => {
      expect(del.callCount).toBe(1);
    });

    it('did not log an error', () => {
      expect(log.error.callCount).toBe(0);
    });
  });

  describe('complaint message, new unverified account with active subscription', () => {
    beforeEach(() => {
      emailRecord.createdAt += 1;
      mockStripeHelper.hasActiveSubscription = async () =>
        Promise.resolve(true);
      return queue.on.args[0][1]({
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
      expect(log.flowEvent.callCount).toBe(1);
      expect(log.info.callCount).toBe(1);
    });

    it('did not delete the account', () => {
      expect(db.accountRecord.callCount).toBe(1);
      expect(db.deleteAccount.callCount).toBe(0);
    });

    it('called message.del', () => {
      expect(del.callCount).toBe(1);
    });

    it('did not log an error', () => {
      expect(log.error.callCount).toBe(0);
    });
  });

  describe('bounce message, new verified account:', () => {
    beforeEach(() => {
      emailRecord.createdAt += 1;
      emailRecord.emailVerified = true;
      return queue.on.args[0][1]({
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
      expect(log.flowEvent.callCount).toBe(1);
      expect(log.info.callCount).toBe(1);
    });

    it('did not delete the account', () => {
      expect(db.accountRecord.callCount).toBe(1);
      expect(db.deleteAccount.callCount).toBe(0);
    });

    it('called message.del', () => {
      expect(del.callCount).toBe(1);
    });

    it('did not log an error', () => {
      expect(log.error.callCount).toBe(0);
    });
  });

  describe('delivery message, new unverified account:', () => {
    beforeEach(() => {
      emailRecord.createdAt += 1;
      return queue.on.args[0][1]({
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
      expect(log.flowEvent.callCount).toBe(1);
      const args = log.flowEvent.args[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toEqual({
        event: 'email.bar.delivered',
        flow_id: 'foo',
        flow_time: 1,
        time: now,
      });
    });

    it('logged an email event', () => {
      expect(log.info.callCount).toBe(1);
      const args = log.info.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('emailEvent');
      expect(args[1]).toEqual({
        domain: 'other',
        flow_id: 'foo',
        locale: 'en-gb',
        template: 'bar',
        templateVersion: 'baz',
        type: 'delivered',
      });
    });

    it('did not delete the account', () => {
      expect(db.accountRecord.callCount).toBe(0);
      expect(db.deleteAccount.callCount).toBe(0);
    });

    it('called message.del', () => {
      expect(del.callCount).toBe(1);
    });

    it('did not log an error', () => {
      expect(log.error.callCount).toBe(0);
    });
  });

  describe('missing headers:', () => {
    beforeEach(() => {
      return queue.on.args[0][1]({
        del,
        mail: {},
        bounce: {
          bouncedRecipients: ['wibble@example.com'],
        },
      });
    });

    it('logged an error', () => {
      expect(log.error.callCount).toBeGreaterThanOrEqual(1);

      const args = log.error.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('emailHeaders.missing');
      expect(args[1]).toEqual({
        origin: 'notification',
      });
    });

    it('did not log a flow event', () => {
      expect(log.flowEvent.callCount).toBe(0);
    });

    it('logged an email event', () => {
      expect(log.info.callCount).toBe(1);
      const args = log.info.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('emailEvent');
      expect(args[1]).toEqual({
        bounced: true,
        domain: 'other',
        locale: '',
        template: '',
        templateVersion: '',
        type: 'bounced',
      });
    });

    it('did not delete the account', () => {
      expect(db.accountRecord.callCount).toBe(1);
      expect(db.deleteAccount.callCount).toBe(0);
    });

    it('called message.del', () => {
      expect(del.callCount).toBe(1);
    });
  });
});
