/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EventEmitter } from 'events';
import sinon from 'sinon';
import Container from 'typedi';

const bounces = require('./bounces');
const { AppError: error } = require('@fxa/accounts/errors');
const { mockLog, mockStatsd } = require('../../test/mocks');
const { StripeHelper } = require('../payments/stripe');
const emailHelpers = require('./utils/helpers');

const mockBounceQueue = new EventEmitter() as EventEmitter & {
  start: () => void;
};
(mockBounceQueue as any).start = function start() {};

describe('bounce messages', () => {
  let log: any,
    mockConfig: any,
    mockDB: any,
    mockStripeHelper: any,
    statsd: any;

  function mockMessage(msg: any) {
    msg.del = sinon.spy();
    msg.headers = {};
    return msg;
  }

  function mockedBounces(log: any, db: any) {
    return bounces(log, error, mockConfig, statsd)(mockBounceQueue, db);
  }

  beforeEach(() => {
    log = mockLog();
    statsd = mockStatsd();
    mockConfig = {
      smtp: {
        bounces: {
          deleteAccount: true,
        },
      },
    };
    mockDB = {
      createEmailBounce: sinon.spy(() => Promise.resolve({})),
      accountRecord: sinon.spy((email: string) => {
        return Promise.resolve({
          createdAt: Date.now(),
          email: email,
          emailVerified: false,
          uid: '123456',
        });
      }),
      deleteAccount: sinon.spy(() => Promise.resolve({})),
    };
    mockStripeHelper = {
      hasActiveSubscription: async () => Promise.resolve(false),
    };
    Container.set(StripeHelper, mockStripeHelper);
  });

  afterEach(() => {
    mockBounceQueue.removeAllListeners();
    Container.reset();
  });

  it('should not log an error for headers', async () => {
    await mockedBounces(log, {}).handleBounce(
      mockMessage({ junk: 'message' })
    );
    expect(log.error.callCount).toBe(0);
  });

  it('should log an error for missing headers', async () => {
    const message = mockMessage({ junk: 'message' });
    message.headers = undefined;
    await mockedBounces(log, {}).handleBounce(message);
    expect(log.error.callCount).toBe(1);
  });

  it('should ignore unknown message types', async () => {
    await mockedBounces(log, {}).handleBounce(
      mockMessage({ junk: 'message' })
    );
    expect(log.info.callCount).toBe(0);
    expect(log.error.callCount).toBe(0);
    expect(log.warn.callCount).toBe(1);
    expect(log.warn.args[0][0]).toBe('emailHeaders.keys');
  });

  it('should record metrics about bounce type', async () => {
    const bounceType = 'Transient';
    await mockedBounces(log, mockDB).handleBounce(
      mockMessage({
        bounce: {
          bounceType,
          bouncedRecipients: [
            { emailAddress: 'test@example.com' },
            { emailAddress: 'foobar@example.com' },
          ],
        },
      })
    );
    expect(statsd.increment.callCount).toBe(1);
    sinon.assert.calledWith(statsd.increment, 'email.bounce.message', {
      bounceType,
      bounceSubType: 'none',
      hasDiagnosticCode: false,
      hasComplaint: false,
    });
  });

  it('should handle multiple recipients in turn', async () => {
    const bounceType = 'Permanent';
    const mockMsg = mockMessage({
      bounce: {
        bounceType,
        bouncedRecipients: [
          { emailAddress: 'test@example.com' },
          { emailAddress: 'foobar@example.com' },
        ],
      },
    });
    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.createEmailBounce.callCount).toBe(2);
    expect(mockDB.accountRecord.callCount).toBe(2);
    expect(mockDB.deleteAccount.callCount).toBe(2);
    expect(mockDB.accountRecord.args[0][0]).toBe('test@example.com');
    expect(mockDB.accountRecord.args[1][0]).toBe('foobar@example.com');
    expect(mockMsg.del.callCount).toBe(1);
  });

  it('should not delete account when account delete is disabled', async () => {
    mockConfig.smtp.bounces.deleteAccount = false;
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Transient',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [{ name: 'X-Template-Name', value: 'verifyEmail' }],
      },
    });
    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.deleteAccount.callCount).toBe(0);
    expect(mockMsg.del.callCount).toBe(1);
    sinon.assert.calledWith(log.debug, 'accountNotDeleted', {
      uid: '123456',
      email: 'test@example.com',
      accountDeleteEnabled: false,
      emailUnverified: true,
      isRecentAccount: true,
      hasNoActiveSubscription: true,
      errorMessage: undefined,
      errorStackTrace: undefined,
    });
  });

  it('should delete account registered with a Transient bounce', async () => {
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Transient',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [{ name: 'X-Template-Name', value: 'verifyEmail' }],
      },
    });
    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.deleteAccount.callCount).toBe(1);
    expect(mockMsg.del.callCount).toBe(1);
  });

  it('should not delete account that bounces and is older than 6 hours', async () => {
    const SEVEN_HOURS_AGO = Date.now() - 1000 * 60 * 60 * 7;
    mockDB.accountRecord = sinon.spy((email: string) => {
      return Promise.resolve({
        createdAt: SEVEN_HOURS_AGO,
        uid: '123456',
        email,
        emailVerified: email === 'verified@example.com',
      });
    });

    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Transient',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [{ name: 'X-Template-Name', value: 'verifyLoginEmail' }],
      },
    });
    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.deleteAccount.callCount).toBe(0);
    expect(mockMsg.del.callCount).toBe(1);
  });

  it('should delete account that bounces and is younger than 6 hours', async () => {
    const FOUR_HOURS_AGO = Date.now() - 1000 * 60 * 60 * 5;
    mockDB.accountRecord = sinon.spy((email: string) => {
      return Promise.resolve({
        createdAt: FOUR_HOURS_AGO,
        uid: '123456',
        email,
        emailVerified: email === 'verified@example.com',
      });
    });

    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Transient',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [{ name: 'X-Template-Name', value: 'verifyLoginEmail' }],
      },
    });
    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.deleteAccount.callCount).toBe(1);
    expect(mockMsg.del.callCount).toBe(1);
  });

  it('should delete accounts on login verification with a Transient bounce', async () => {
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Transient',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [{ name: 'X-Template-Name', value: 'verifyLoginEmail' }],
      },
    });
    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.deleteAccount.callCount).toBe(1);
    expect(mockMsg.del.callCount).toBe(1);
  });

  it('should treat complaints like bounces', async () => {
    const complaintType = 'abuse';
    await mockedBounces(log, mockDB).handleBounce(
      mockMessage({
        complaint: {
          userAgent: 'AnyCompany Feedback Loop (V0.01)',
          complaintFeedbackType: complaintType,
          complainedRecipients: [
            { emailAddress: 'test@example.com' },
            { emailAddress: 'foobar@example.com' },
          ],
        },
      })
    );
    expect(mockDB.createEmailBounce.callCount).toBe(2);
    expect(mockDB.createEmailBounce.args[0][0].bounceType).toBe('Complaint');
    expect(mockDB.createEmailBounce.args[0][0].bounceSubType).toBe(
      complaintType
    );
    expect(mockDB.accountRecord.callCount).toBe(2);
    expect(mockDB.deleteAccount.callCount).toBe(2);
    expect(mockDB.accountRecord.args[0][0]).toBe('test@example.com');
    expect(mockDB.accountRecord.args[1][0]).toBe('foobar@example.com');
    expect(log.info.callCount).toBe(6);
    expect(log.info.args[0][0]).toBe('emailEvent');
    expect(log.info.args[0][1].domain).toBe('other');
    expect(log.info.args[0][1].type).toBe('bounced');
    expect(log.info.args[4][1].complaint).toBe(true);
    expect(log.info.args[4][1].complaintFeedbackType).toBe(complaintType);
    expect(log.info.args[4][1].complaintUserAgent).toBe(
      'AnyCompany Feedback Loop (V0.01)'
    );
  });

  it('should not delete verified accounts on bounce', async () => {
    mockDB.accountRecord = sinon.spy((email: string) => {
      return Promise.resolve({
        createdAt: Date.now(),
        uid: '123456',
        email,
        emailVerified: email === 'verified@example.com',
      });
    });

    await mockedBounces(log, mockDB).handleBounce(
      mockMessage({
        bounce: {
          bounceType: 'Permanent',
          bouncedRecipients: [
            {
              emailAddress: 'test@example.com',
              action: 'failed',
              status: '5.0.0',
              diagnosticCode: 'smtp; 550 user unknown',
            },
            { emailAddress: 'verified@example.com', status: '4.0.0' },
          ],
        },
      })
    );
    expect(mockDB.accountRecord.callCount).toBe(2);
    expect(mockDB.accountRecord.args[0][0]).toBe('test@example.com');
    expect(mockDB.accountRecord.args[1][0]).toBe('verified@example.com');
    expect(mockDB.deleteAccount.callCount).toBe(1);
    expect(mockDB.deleteAccount.args[0][0].email).toBe('test@example.com');
    expect(log.info.callCount).toBe(5);
    expect(log.info.args[1][0]).toBe('handleBounce');
    expect(log.info.args[1][1].email).toBe('test@example.com');
    expect(log.info.args[1][1].domain).toBe('other');
    expect(log.info.args[1][1].mailStatus).toBe('5.0.0');
    expect(log.info.args[1][1].action).toBe('failed');
    expect(log.info.args[1][1].diagnosticCode).toBe(
      'smtp; 550 user unknown'
    );
    expect(log.info.args[2][0]).toBe('accountDeleted');
    expect(log.info.args[2][1].email).toBe('test@example.com');
    expect(log.info.args[4][0]).toBe('handleBounce');
    expect(log.info.args[4][1].email).toBe('verified@example.com');
    expect(log.info.args[4][1].mailStatus).toBe('4.0.0');
  });

  it('should not delete an unverified account that bounces, is older than 6 hours but has an active subscription', async () => {
    mockStripeHelper.hasActiveSubscription = async () =>
      Promise.resolve(true);
    const SEVEN_HOURS_AGO = Date.now() - 1000 * 60 * 60 * 7;
    mockDB.accountRecord = sinon.spy((email: string) => {
      return Promise.resolve({
        createdAt: SEVEN_HOURS_AGO,
        uid: '123456',
        email,
        emailVerified: false,
      });
    });

    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Transient',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [{ name: 'X-Template-Name', value: 'verifyLoginEmail' }],
      },
    });
    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.deleteAccount.callCount).toBe(0);
    expect(mockMsg.del.callCount).toBe(1);
  });

  it('should log errors when looking up the email record', async () => {
    mockDB.accountRecord = sinon.spy(() => Promise.reject(new error({})));
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
    });
    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.accountRecord.callCount).toBe(1);
    expect(mockDB.accountRecord.args[0][0]).toBe('test@example.com');
    expect(log.info.callCount).toBe(2);
    expect(log.info.args[1][0]).toBe('handleBounce');
    expect(log.info.args[1][1].email).toBe('test@example.com');
    expect(log.error.callCount).toBe(2);
    expect(log.error.args[1][0]).toBe('databaseError');
    expect(log.error.args[1][1].email).toBe('test@example.com');
    expect(mockMsg.del.callCount).toBe(1);
  });

  it('should log errors when deleting the email record', async () => {
    mockDB.deleteAccount = sinon.spy(() =>
      Promise.reject(error.unknownAccount('test@example.com'))
    );
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
    });
    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.accountRecord.callCount).toBe(1);
    expect(mockDB.accountRecord.args[0][0]).toBe('test@example.com');
    expect(mockDB.deleteAccount.callCount).toBe(1);
    expect(mockDB.deleteAccount.args[0][0].email).toBe('test@example.com');
    expect(log.info.callCount).toBe(2);
    expect(log.info.args[1][0]).toBe('handleBounce');
    expect(log.info.args[1][1].email).toBe('test@example.com');
    expect(log.error.callCount).toBe(2);
    expect(log.error.args[1][0]).toBe('databaseError');
    expect(log.error.args[1][1].email).toBe('test@example.com');
    expect(log.error.args[1][1].err.errno).toBe(error.ERRNO.ACCOUNT_UNKNOWN);
    expect(mockMsg.del.callCount).toBe(1);
  });

  it('should normalize quoted email addresses for lookup', async () => {
    mockDB.accountRecord = sinon.spy((email: string) => {
      if (email !== 'test.@example.com') {
        return Promise.reject(error.unknownAccount(email));
      }
      return Promise.resolve({
        createdAt: Date.now(),
        uid: '123456',
        email,
        emailVerified: false,
      });
    });
    await mockedBounces(log, mockDB).handleBounce(
      mockMessage({
        bounce: {
          bounceType: 'Permanent',
          bouncedRecipients: [{ emailAddress: '"test."@example.com' }],
        },
      })
    );
    expect(mockDB.createEmailBounce.callCount).toBe(1);
    expect(mockDB.createEmailBounce.args[0][0].email).toBe(
      'test.@example.com'
    );
    expect(mockDB.accountRecord.callCount).toBe(1);
    expect(mockDB.accountRecord.args[0][0]).toBe('test.@example.com');
    expect(mockDB.deleteAccount.callCount).toBe(1);
    expect(mockDB.deleteAccount.args[0][0].email).toBe(
      'test.@example.com'
    );
  });

  it('should handle multiple consecutive dots even if not quoted', async () => {
    mockDB.accountRecord = sinon.spy((email: string) => {
      if (email !== 'test..me@example.com') {
        return Promise.reject(error.unknownAccount(email));
      }
      return Promise.resolve({
        createdAt: Date.now(),
        uid: '123456',
        email,
        emailVerified: false,
      });
    });

    await mockedBounces(log, mockDB).handleBounce(
      mockMessage({
        bounce: {
          bounceType: 'Permanent',
          bouncedRecipients: [{ emailAddress: 'test..me@example.com' }],
        },
      })
    );
    expect(mockDB.createEmailBounce.callCount).toBe(1);
    expect(mockDB.createEmailBounce.args[0][0].email).toBe(
      'test..me@example.com'
    );
    expect(mockDB.accountRecord.callCount).toBe(1);
    expect(mockDB.accountRecord.args[0][0]).toBe('test..me@example.com');
    expect(mockDB.deleteAccount.callCount).toBe(1);
    expect(mockDB.deleteAccount.args[0][0].email).toBe(
      'test..me@example.com'
    );
  });

  it('should log a warning if it receives an unparseable email address', async () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.reject(error.unknownAccount())
    );
    await mockedBounces(log, mockDB).handleBounce(
      mockMessage({
        bounce: {
          bounceType: 'Permanent',
          bouncedRecipients: [
            { emailAddress: 'how did this even happen?' },
          ],
        },
      })
    );
    expect(mockDB.createEmailBounce.callCount).toBe(0);
    expect(mockDB.accountRecord.callCount).toBe(0);
    expect(mockDB.deleteAccount.callCount).toBe(0);
    expect(log.warn.callCount).toBe(2);
    expect(log.warn.args[1][0]).toBe('handleBounce.addressParseFailure');
  });

  it('should log email template name, language, and bounceType', async () => {
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bounceSubType: 'General',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [
          { name: 'Content-Language', value: 'db-LB' },
          { name: 'X-Template-Name', value: 'verifyLoginEmail' },
        ],
      },
    });

    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.accountRecord.callCount).toBe(1);
    expect(mockDB.accountRecord.args[0][0]).toBe('test@example.com');
    expect(mockDB.deleteAccount.callCount).toBe(1);
    expect(mockDB.deleteAccount.args[0][0].email).toBe('test@example.com');
    expect(log.info.callCount).toBe(3);
    expect(log.info.args[1][0]).toBe('handleBounce');
    expect(log.info.args[1][1].email).toBe('test@example.com');
    expect(log.info.args[1][1].template).toBe('verifyLoginEmail');
    expect(log.info.args[1][1].bounceType).toBe('Permanent');
    expect(log.info.args[1][1].bounceSubType).toBe('General');
    expect(log.info.args[1][1].lang).toBe('db-LB');
  });

  it('should emit flow metrics', async () => {
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bounceSubType: 'General',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [
          { name: 'X-Template-Name', value: 'verifyLoginEmail' },
          { name: 'X-Flow-Id', value: 'someFlowId' },
          { name: 'X-Flow-Begin-Time', value: '1234' },
          { name: 'Content-Language', value: 'en' },
        ],
      },
    });

    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.accountRecord.callCount).toBe(1);
    expect(mockDB.accountRecord.args[0][0]).toBe('test@example.com');
    expect(mockDB.deleteAccount.callCount).toBe(1);
    expect(mockDB.deleteAccount.args[0][0].email).toBe('test@example.com');
    expect(log.flowEvent.callCount).toBe(1);
    expect(log.flowEvent.args[0][0].event).toBe(
      'email.verifyLoginEmail.bounced'
    );
    expect(log.flowEvent.args[0][0].flow_id).toBe('someFlowId');
    expect(log.flowEvent.args[0][0].flow_time > 0).toBe(true);
    expect(log.flowEvent.args[0][0].time > 0).toBe(true);
    expect(log.info.callCount).toBe(3);
    expect(log.info.args[0][0]).toBe('emailEvent');
    expect(log.info.args[0][1].type).toBe('bounced');
    expect(log.info.args[0][1].template).toBe('verifyLoginEmail');
    expect(log.info.args[0][1].flow_id).toBe('someFlowId');
  });

  it('should log email domain if popular one', async () => {
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bounceSubType: 'General',
        bouncedRecipients: [{ emailAddress: 'test@aol.com' }],
      },
      mail: {
        headers: [
          { name: 'X-Template-Name', value: 'verifyLoginEmail' },
          { name: 'X-Flow-Id', value: 'someFlowId' },
          { name: 'X-Flow-Begin-Time', value: '1234' },
          { name: 'Content-Language', value: 'en' },
        ],
      },
    });

    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(log.flowEvent.callCount).toBe(1);
    expect(log.flowEvent.args[0][0].event).toBe(
      'email.verifyLoginEmail.bounced'
    );
    expect(log.flowEvent.args[0][0].flow_id).toBe('someFlowId');
    expect(log.flowEvent.args[0][0].flow_time > 0).toBe(true);
    expect(log.flowEvent.args[0][0].time > 0).toBe(true);
    expect(log.info.callCount).toBe(3);
    expect(log.info.args[0][0]).toBe('emailEvent');
    expect(log.info.args[0][1].domain).toBe('aol.com');
    expect(log.info.args[0][1].type).toBe('bounced');
    expect(log.info.args[0][1].template).toBe('verifyLoginEmail');
    expect(log.info.args[0][1].locale).toBe('en');
    expect(log.info.args[0][1].flow_id).toBe('someFlowId');
    expect(log.info.args[1][1].email).toBe('test@aol.com');
    expect(log.info.args[1][1].domain).toBe('aol.com');
  });

  it('should log account email event (emailBounced)', async () => {
    const stub = sinon
      .stub(emailHelpers, 'logAccountEventFromMessage')
      .returns(Promise.resolve());
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bounceSubType: 'General',
        bouncedRecipients: [{ emailAddress: 'test@aol.com' }],
      },
      mail: {
        headers: [
          { name: 'X-Template-Name', value: 'verifyLoginEmail' },
          { name: 'X-Flow-Id', value: 'someFlowId' },
          { name: 'X-Flow-Begin-Time', value: '1234' },
          { name: 'X-Uid', value: 'en' },
        ],
      },
    });

    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    sinon.assert.calledOnceWithExactly(
      emailHelpers.logAccountEventFromMessage,
      mockMsg,
      'emailBounced'
    );
    stub.restore();
  });
});
