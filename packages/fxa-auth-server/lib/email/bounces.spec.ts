/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EventEmitter } from 'events';
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
    msg.del = jest.fn();
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
      createEmailBounce: jest.fn(() => Promise.resolve({})),
      accountRecord: jest.fn((email: string) => {
        return Promise.resolve({
          createdAt: Date.now(),
          email: email,
          emailVerified: false,
          uid: '123456',
        });
      }),
      deleteAccount: jest.fn(() => Promise.resolve({})),
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
    await mockedBounces(log, {}).handleBounce(mockMessage({ junk: 'message' }));
    expect(log.error).toHaveBeenCalledTimes(0);
  });

  it('should log an error for missing headers', async () => {
    const message = mockMessage({ junk: 'message' });
    message.headers = undefined;
    await mockedBounces(log, {}).handleBounce(message);
    expect(log.error).toHaveBeenCalledTimes(1);
  });

  it('should ignore unknown message types', async () => {
    await mockedBounces(log, {}).handleBounce(mockMessage({ junk: 'message' }));
    expect(log.info).toHaveBeenCalledTimes(0);
    expect(log.error).toHaveBeenCalledTimes(0);
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(log.warn).toHaveBeenCalledWith(
      'emailHeaders.keys',
      expect.anything()
    );
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
    expect(statsd.increment).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith('email.bounce.message', {
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
    expect(mockDB.createEmailBounce).toHaveBeenCalledTimes(2);
    expect(mockDB.accountRecord).toHaveBeenCalledTimes(2);
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(2);
    expect(mockDB.accountRecord).toHaveBeenNthCalledWith(1, 'test@example.com');
    expect(mockDB.accountRecord).toHaveBeenNthCalledWith(
      2,
      'foobar@example.com'
    );
    expect(mockMsg.del).toHaveBeenCalledTimes(1);
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
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(0);
    expect(mockMsg.del).toHaveBeenCalledTimes(1);
    expect(log.debug).toHaveBeenCalledWith('accountNotDeleted', {
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
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(1);
    expect(mockMsg.del).toHaveBeenCalledTimes(1);
  });

  it('should not delete account that bounces and is older than 6 hours', async () => {
    const SEVEN_HOURS_AGO = Date.now() - 1000 * 60 * 60 * 7;
    mockDB.accountRecord = jest.fn((email: string) => {
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
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(0);
    expect(mockMsg.del).toHaveBeenCalledTimes(1);
  });

  it('should delete account that bounces and is younger than 6 hours', async () => {
    const FOUR_HOURS_AGO = Date.now() - 1000 * 60 * 60 * 5;
    mockDB.accountRecord = jest.fn((email: string) => {
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
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(1);
    expect(mockMsg.del).toHaveBeenCalledTimes(1);
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
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(1);
    expect(mockMsg.del).toHaveBeenCalledTimes(1);
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
    expect(mockDB.createEmailBounce).toHaveBeenCalledTimes(2);
    expect(mockDB.createEmailBounce).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        bounceType: 'Complaint',
        bounceSubType: complaintType,
      })
    );
    expect(mockDB.accountRecord).toHaveBeenCalledTimes(2);
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(2);
    expect(mockDB.accountRecord).toHaveBeenNthCalledWith(1, 'test@example.com');
    expect(mockDB.accountRecord).toHaveBeenNthCalledWith(
      2,
      'foobar@example.com'
    );
    expect(log.info).toHaveBeenCalledTimes(6);
    expect(log.info).toHaveBeenNthCalledWith(
      1,
      'emailEvent',
      expect.objectContaining({ domain: 'other', type: 'bounced' })
    );
    expect(log.info).toHaveBeenNthCalledWith(
      5,
      expect.anything(),
      expect.objectContaining({
        complaint: true,
        complaintFeedbackType: complaintType,
        complaintUserAgent: 'AnyCompany Feedback Loop (V0.01)',
      })
    );
  });

  it('should not delete verified accounts on bounce', async () => {
    mockDB.accountRecord = jest.fn((email: string) => {
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
    expect(mockDB.accountRecord).toHaveBeenCalledTimes(2);
    expect(mockDB.accountRecord).toHaveBeenNthCalledWith(1, 'test@example.com');
    expect(mockDB.accountRecord).toHaveBeenNthCalledWith(
      2,
      'verified@example.com'
    );
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(1);
    expect(mockDB.deleteAccount).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    );
    expect(log.info).toHaveBeenCalledTimes(5);
    expect(log.info).toHaveBeenNthCalledWith(
      2,
      'handleBounce',
      expect.objectContaining({
        email: 'test@example.com',
        domain: 'other',
        mailStatus: '5.0.0',
        action: 'failed',
        diagnosticCode: 'smtp; 550 user unknown',
      })
    );
    expect(log.info).toHaveBeenNthCalledWith(
      3,
      'accountDeleted',
      expect.objectContaining({ email: 'test@example.com' })
    );
    expect(log.info).toHaveBeenNthCalledWith(
      5,
      'handleBounce',
      expect.objectContaining({
        email: 'verified@example.com',
        mailStatus: '4.0.0',
      })
    );
  });

  it('should not delete an unverified account that bounces, is older than 6 hours but has an active subscription', async () => {
    mockStripeHelper.hasActiveSubscription = async () => Promise.resolve(true);
    const SEVEN_HOURS_AGO = Date.now() - 1000 * 60 * 60 * 7;
    mockDB.accountRecord = jest.fn((email: string) => {
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
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(0);
    expect(mockMsg.del).toHaveBeenCalledTimes(1);
  });

  it('should log errors when looking up the email record', async () => {
    mockDB.accountRecord = jest.fn(() => Promise.reject(new error({})));
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
    });
    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);
    expect(mockDB.accountRecord).toHaveBeenCalledWith('test@example.com');
    expect(log.info).toHaveBeenCalledTimes(2);
    expect(log.info).toHaveBeenNthCalledWith(
      2,
      'handleBounce',
      expect.objectContaining({ email: 'test@example.com' })
    );
    expect(log.error).toHaveBeenCalledTimes(2);
    expect(log.error).toHaveBeenNthCalledWith(
      2,
      'databaseError',
      expect.objectContaining({ email: 'test@example.com' })
    );
    expect(mockMsg.del).toHaveBeenCalledTimes(1);
  });

  it('should log errors when deleting the email record', async () => {
    mockDB.deleteAccount = jest.fn(() =>
      Promise.reject(error.unknownAccount('test@example.com'))
    );
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
    });
    await mockedBounces(log, mockDB).handleBounce(mockMsg);
    expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);
    expect(mockDB.accountRecord).toHaveBeenCalledWith('test@example.com');
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(1);
    expect(mockDB.deleteAccount).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    );
    expect(log.info).toHaveBeenCalledTimes(2);
    expect(log.info).toHaveBeenNthCalledWith(
      2,
      'handleBounce',
      expect.objectContaining({ email: 'test@example.com' })
    );
    expect(log.error).toHaveBeenCalledTimes(2);
    expect(log.error).toHaveBeenNthCalledWith(
      2,
      'databaseError',
      expect.objectContaining({
        email: 'test@example.com',
        err: expect.objectContaining({ errno: error.ERRNO.ACCOUNT_UNKNOWN }),
      })
    );
    expect(mockMsg.del).toHaveBeenCalledTimes(1);
  });

  it('should normalize quoted email addresses for lookup', async () => {
    mockDB.accountRecord = jest.fn((email: string) => {
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
    expect(mockDB.createEmailBounce).toHaveBeenCalledTimes(1);
    expect(mockDB.createEmailBounce).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test.@example.com' })
    );
    expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);
    expect(mockDB.accountRecord).toHaveBeenCalledWith('test.@example.com');
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(1);
    expect(mockDB.deleteAccount).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test.@example.com' })
    );
  });

  it('should handle multiple consecutive dots even if not quoted', async () => {
    mockDB.accountRecord = jest.fn((email: string) => {
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
    expect(mockDB.createEmailBounce).toHaveBeenCalledTimes(1);
    expect(mockDB.createEmailBounce).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test..me@example.com' })
    );
    expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);
    expect(mockDB.accountRecord).toHaveBeenCalledWith('test..me@example.com');
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(1);
    expect(mockDB.deleteAccount).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test..me@example.com' })
    );
  });

  it('should log a warning if it receives an unparseable email address', async () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.reject(error.unknownAccount())
    );
    await mockedBounces(log, mockDB).handleBounce(
      mockMessage({
        bounce: {
          bounceType: 'Permanent',
          bouncedRecipients: [{ emailAddress: 'how did this even happen?' }],
        },
      })
    );
    expect(mockDB.createEmailBounce).toHaveBeenCalledTimes(0);
    expect(mockDB.accountRecord).toHaveBeenCalledTimes(0);
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(0);
    expect(log.warn).toHaveBeenCalledTimes(2);
    expect(log.warn).toHaveBeenNthCalledWith(
      2,
      'handleBounce.addressParseFailure',
      expect.anything()
    );
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
    expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);
    expect(mockDB.accountRecord).toHaveBeenCalledWith('test@example.com');
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(1);
    expect(mockDB.deleteAccount).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    );
    expect(log.info).toHaveBeenCalledTimes(3);
    expect(log.info).toHaveBeenNthCalledWith(
      2,
      'handleBounce',
      expect.objectContaining({
        email: 'test@example.com',
        template: 'verifyLoginEmail',
        bounceType: 'Permanent',
        bounceSubType: 'General',
        lang: 'db-LB',
      })
    );
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
    expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);
    expect(mockDB.accountRecord).toHaveBeenCalledWith('test@example.com');
    expect(mockDB.deleteAccount).toHaveBeenCalledTimes(1);
    expect(mockDB.deleteAccount).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    );
    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    expect(log.flowEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'email.verifyLoginEmail.bounced',
        flow_id: 'someFlowId',
      })
    );
    expect(log.flowEvent.mock.calls[0][0].flow_time > 0).toBe(true);
    expect(log.flowEvent.mock.calls[0][0].time > 0).toBe(true);
    expect(log.info).toHaveBeenCalledTimes(3);
    expect(log.info).toHaveBeenNthCalledWith(
      1,
      'emailEvent',
      expect.objectContaining({
        type: 'bounced',
        template: 'verifyLoginEmail',
        flow_id: 'someFlowId',
      })
    );
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
    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    expect(log.flowEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'email.verifyLoginEmail.bounced',
        flow_id: 'someFlowId',
      })
    );
    expect(log.flowEvent.mock.calls[0][0].flow_time > 0).toBe(true);
    expect(log.flowEvent.mock.calls[0][0].time > 0).toBe(true);
    expect(log.info).toHaveBeenCalledTimes(3);
    expect(log.info).toHaveBeenNthCalledWith(
      1,
      'emailEvent',
      expect.objectContaining({
        domain: 'aol.com',
        type: 'bounced',
        template: 'verifyLoginEmail',
        locale: 'en',
        flow_id: 'someFlowId',
      })
    );
    expect(log.info).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({ email: 'test@aol.com', domain: 'aol.com' })
    );
  });

  it('should log account email event (emailBounced)', async () => {
    const stub = jest
      .spyOn(emailHelpers, 'logAccountEventFromMessage')
      .mockReturnValue(Promise.resolve());
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
    expect(emailHelpers.logAccountEventFromMessage).toHaveBeenCalledTimes(1);
    expect(emailHelpers.logAccountEventFromMessage).toHaveBeenCalledWith(
      mockMsg,
      'emailBounced'
    );
    stub.mockRestore();
  });
});
