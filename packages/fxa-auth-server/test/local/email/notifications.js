/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const { assert } = require('chai');
const error = require(`${ROOT_DIR}/lib/error`);
const { mockLog } = require('../../mocks');
const notifications = require(`${ROOT_DIR}/lib/email/notifications`);
const P = require(`${ROOT_DIR}/lib/promise`);
const sinon = require('sinon');

const SIX_HOURS = 1000 * 60 * 60 * 6;

describe('lib/email/notifications:', () => {
  let now, del, log, queue, emailRecord, db;

  beforeEach(() => {
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
      accountRecord: sinon.spy(() => P.resolve(emailRecord)),
      deleteAccount: sinon.spy(() => P.resolve()),
    };
    notifications(log, error)(queue, db);
  });

  afterEach(() => {
    Date.now.restore();
  });

  it('called queue.start', () => {
    assert.equal(queue.start.callCount, 1);
    assert.lengthOf(queue.start.args[0], 0);
  });

  it('called queue.on', () => {
    assert.equal(queue.on.callCount, 1);

    const args = queue.on.args[0];
    assert.lengthOf(args, 2);
    assert.equal(args[0], 'data');
    assert.isFunction(args[1]);
    assert.lengthOf(args[1], 1);
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
      assert.equal(log.flowEvent.callCount, 1);
      const args = log.flowEvent.args[0];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        event: 'email.bar.bounced',
        flow_id: 'foo',
        flow_time: 1,
        time: now,
      });
    });

    it('logged an email event', () => {
      assert.equal(log.info.callCount, 1);
      const args = log.info.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'emailEvent');
      assert.deepEqual(args[1], {
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
      assert.equal(db.accountRecord.callCount, 1);
      const args = db.accountRecord.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'wibble@example.com');

      assert.equal(db.deleteAccount.callCount, 0);
    });

    it('called message.del', () => {
      assert.equal(del.callCount, 1);
      assert.lengthOf(del.args[0], 0);
    });

    it('did not log an error', () => {
      assert.equal(log.error.callCount, 0);
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
      assert.equal(log.flowEvent.callCount, 2);

      let args = log.flowEvent.args[0];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        event: 'email.blee.bounced',
        flow_id: 'wibble',
        flow_time: 2,
        time: now,
      });

      args = log.flowEvent.args[1];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        event: 'email.blee.bounced',
        flow_id: 'wibble',
        flow_time: 2,
        time: now,
      });
    });

    it('logged 2 email events', () => {
      assert.equal(log.info.callCount, 2);

      let args = log.info.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'emailEvent');
      assert.deepEqual(args[1], {
        complaint: true,
        domain: 'other',
        flow_id: 'wibble',
        locale: 'fr',
        template: 'blee',
        templateVersion: '',
        type: 'bounced',
      });

      args = log.info.args[1];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'emailEvent');
      assert.deepEqual(args[1], {
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
      assert.equal(db.accountRecord.callCount, 2);

      let args = db.accountRecord.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'foo@example.com');

      args = db.accountRecord.args[1];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'pmbooth@gmail.com');

      assert.equal(db.deleteAccount.callCount, 0);
    });

    it('called message.del', () => {
      assert.equal(del.callCount, 1);
    });

    it('did not log an error', () => {
      assert.equal(log.error.callCount, 0);
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
      assert.equal(log.flowEvent.callCount, 2);

      assert.equal(log.info.callCount, 4);

      let args = log.info.args[2];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'accountDeleted');
      assert.deepEqual(args[1], {
        emailVerified: false,
        createdAt: emailRecord.createdAt,
      });

      args = log.info.args[3];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'accountDeleted');
      assert.deepEqual(args[1], {
        emailVerified: false,
        createdAt: emailRecord.createdAt,
      });
    });

    it('deleted the accounts', () => {
      assert.equal(db.accountRecord.callCount, 2);

      let args = db.accountRecord.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'wibble@example.com');

      args = db.accountRecord.args[1];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'blee@example.com');

      assert.equal(db.deleteAccount.callCount, 2);

      args = db.deleteAccount.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], emailRecord);

      args = db.deleteAccount.args[1];
      assert.lengthOf(args, 1);
      assert.equal(args[0], emailRecord);
    });

    it('called message.del', () => {
      assert.equal(del.callCount, 1);
    });

    it('did not log an error', () => {
      assert.equal(log.error.callCount, 0);
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
      assert.equal(log.flowEvent.callCount, 1);
      assert.equal(log.info.callCount, 2);
    });

    it('deleted the account', () => {
      assert.equal(db.accountRecord.callCount, 1);
      assert.equal(db.deleteAccount.callCount, 1);
    });

    it('called message.del', () => {
      assert.equal(del.callCount, 1);
    });

    it('did not log an error', () => {
      assert.equal(log.error.callCount, 0);
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
      assert.equal(log.flowEvent.callCount, 1);
      assert.equal(log.info.callCount, 1);
    });

    it('did not delete the account', () => {
      assert.equal(db.accountRecord.callCount, 1);
      assert.equal(db.deleteAccount.callCount, 0);
    });

    it('called message.del', () => {
      assert.equal(del.callCount, 1);
    });

    it('did not log an error', () => {
      assert.equal(log.error.callCount, 0);
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
      assert.equal(log.flowEvent.callCount, 1);
      const args = log.flowEvent.args[0];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        event: 'email.bar.delivered',
        flow_id: 'foo',
        flow_time: 1,
        time: now,
      });
    });

    it('logged an email event', () => {
      assert.equal(log.info.callCount, 1);
      const args = log.info.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'emailEvent');
      assert.deepEqual(args[1], {
        domain: 'other',
        flow_id: 'foo',
        locale: 'en-gb',
        template: 'bar',
        templateVersion: 'baz',
        type: 'delivered',
      });
    });

    it('did not delete the account', () => {
      assert.equal(db.accountRecord.callCount, 0);
      assert.equal(db.deleteAccount.callCount, 0);
    });

    it('called message.del', () => {
      assert.equal(del.callCount, 1);
    });

    it('did not log an error', () => {
      assert.equal(log.error.callCount, 0);
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
      assert.isAtLeast(log.error.callCount, 1);

      const args = log.error.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'emailHeaders.missing');
      assert.deepEqual(args[1], {
        origin: 'notification',
      });
    });

    it('did not log a flow event', () => {
      assert.equal(log.flowEvent.callCount, 0);
    });

    it('logged an email event', () => {
      assert.equal(log.info.callCount, 1);
      const args = log.info.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'emailEvent');
      assert.deepEqual(args[1], {
        bounced: true,
        domain: 'other',
        locale: '',
        template: '',
        templateVersion: '',
        type: 'bounced',
      });
    });

    it('did not delete the account', () => {
      assert.equal(db.accountRecord.callCount, 1);
      assert.equal(db.deleteAccount.callCount, 0);
    });

    it('called message.del', () => {
      assert.equal(del.callCount, 1);
    });
  });
});
