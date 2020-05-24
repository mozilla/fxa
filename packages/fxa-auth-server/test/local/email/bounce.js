/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const { assert } = require('chai');
const bounces = require(`${ROOT_DIR}/lib/email/bounces`);
const error = require(`${ROOT_DIR}/lib/error`);
const { EventEmitter } = require('events');
const { mockLog } = require('../../mocks');
const P = require(`${ROOT_DIR}/lib/promise`);
const sinon = require('sinon');

const mockBounceQueue = new EventEmitter();
mockBounceQueue.start = function start() {};

function mockMessage(msg) {
  msg.del = sinon.spy();
  msg.headers = {};
  return msg;
}

function mockedBounces(log, db) {
  return bounces(log, error)(mockBounceQueue, db);
}

describe('bounce messages', () => {
  let log, mockDB;
  beforeEach(() => {
    log = mockLog();
    mockDB = {
      createEmailBounce: sinon.spy(() => P.resolve({})),
      accountRecord: sinon.spy((email) => {
        return P.resolve({
          createdAt: Date.now(),
          email: email,
          emailVerified: false,
          uid: '123456',
        });
      }),
      deleteAccount: sinon.spy(() => P.resolve({})),
    };
  });

  afterEach(() => {
    mockBounceQueue.removeAllListeners();
  });

  it('should not log an error for headers', () => {
    return mockedBounces(log, {})
      .handleBounce(mockMessage({ junk: 'message' }))
      .then(() => assert.equal(log.error.callCount, 0));
  });

  it('should log an error for missing headers', () => {
    const message = mockMessage({
      junk: 'message',
    });
    message.headers = undefined;
    return mockedBounces(log, {})
      .handleBounce(message)
      .then(() => assert.equal(log.error.callCount, 1));
  });

  it('should ignore unknown message types', () => {
    return mockedBounces(log, {})
      .handleBounce(
        mockMessage({
          junk: 'message',
        })
      )
      .then(() => {
        assert.equal(log.info.callCount, 0);
        assert.equal(log.error.callCount, 0);
        assert.equal(log.warn.callCount, 1);
        assert.equal(log.warn.args[0][0], 'emailHeaders.keys');
      });
  });

  it('should handle multiple recipients in turn', () => {
    const bounceType = 'Permanent';
    const mockMsg = mockMessage({
      bounce: {
        bounceType: bounceType,
        bouncedRecipients: [
          { emailAddress: 'test@example.com' },
          { emailAddress: 'foobar@example.com' },
        ],
      },
    });
    return mockedBounces(log, mockDB)
      .handleBounce(mockMsg)
      .then(() => {
        assert.equal(mockDB.createEmailBounce.callCount, 2);
        assert.equal(mockDB.accountRecord.callCount, 2);
        assert.equal(mockDB.deleteAccount.callCount, 2);
        assert.equal(mockDB.accountRecord.args[0][0], 'test@example.com');
        assert.equal(mockDB.accountRecord.args[1][0], 'foobar@example.com');
        assert.equal(mockMsg.del.callCount, 1);
      });
  });

  it('should delete account registered with a Transient bounce', () => {
    const bounceType = 'Transient';
    const mockMsg = mockMessage({
      bounce: {
        bounceType: bounceType,
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [
          {
            name: 'X-Template-Name',
            value: 'verifyEmail',
          },
        ],
      },
    });
    return mockedBounces(log, mockDB)
      .handleBounce(mockMsg)
      .then(() => {
        assert.equal(mockDB.deleteAccount.callCount, 1, 'deletes the account');
        assert.equal(mockMsg.del.callCount, 1);
      });
  });

  it('should not delete account that bounces and is older than 6 hours', () => {
    const SEVEN_HOURS_AGO = Date.now() - 1000 * 60 * 60 * 7;
    mockDB.accountRecord = sinon.spy((email) => {
      return P.resolve({
        createdAt: SEVEN_HOURS_AGO,
        uid: '123456',
        email: email,
        emailVerified: email === 'verified@example.com',
      });
    });

    const bounceType = 'Transient';
    const mockMsg = mockMessage({
      bounce: {
        bounceType: bounceType,
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [
          {
            name: 'X-Template-Name',
            value: 'verifyLoginEmail',
          },
        ],
      },
    });
    return mockedBounces(log, mockDB)
      .handleBounce(mockMsg)
      .then(() => {
        assert.equal(
          mockDB.deleteAccount.callCount,
          0,
          'does not delete the account'
        );
        assert.equal(mockMsg.del.callCount, 1);
      });
  });

  it('should delete account that bounces and is younger than 6 hours', () => {
    const FOUR_HOURS_AGO = Date.now() - 1000 * 60 * 60 * 5;
    mockDB.accountRecord = sinon.spy((email) => {
      return P.resolve({
        createdAt: FOUR_HOURS_AGO,
        uid: '123456',
        email: email,
        emailVerified: email === 'verified@example.com',
      });
    });

    const bounceType = 'Transient';
    const mockMsg = mockMessage({
      bounce: {
        bounceType: bounceType,
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [
          {
            name: 'X-Template-Name',
            value: 'verifyLoginEmail',
          },
        ],
      },
    });
    return mockedBounces(log, mockDB)
      .handleBounce(mockMsg)
      .then(() => {
        assert.equal(mockDB.deleteAccount.callCount, 1, 'delete the account');
        assert.equal(mockMsg.del.callCount, 1);
      });
  });

  it('should delete accounts on login verification with a Transient bounce', () => {
    const bounceType = 'Transient';
    const mockMsg = mockMessage({
      bounce: {
        bounceType: bounceType,
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [
          {
            name: 'X-Template-Name',
            value: 'verifyLoginEmail',
          },
        ],
      },
    });
    return mockedBounces(log, mockDB)
      .handleBounce(mockMsg)
      .then(() => {
        assert.equal(mockDB.deleteAccount.callCount, 1, 'deletes the account');
        assert.equal(mockMsg.del.callCount, 1);
      });
  });

  it('should treat complaints like bounces', () => {
    const complaintType = 'abuse';
    return mockedBounces(log, mockDB)
      .handleBounce(
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
      )
      .then(() => {
        assert.equal(mockDB.createEmailBounce.callCount, 2);
        assert.equal(
          mockDB.createEmailBounce.args[0][0].bounceType,
          'Complaint'
        );
        assert.equal(
          mockDB.createEmailBounce.args[0][0].bounceSubType,
          complaintType
        );
        assert.equal(mockDB.accountRecord.callCount, 2);
        assert.equal(mockDB.deleteAccount.callCount, 2);
        assert.equal(mockDB.accountRecord.args[0][0], 'test@example.com');
        assert.equal(mockDB.accountRecord.args[1][0], 'foobar@example.com');
        assert.equal(log.info.callCount, 6);
        assert.equal(log.info.args[0][0], 'emailEvent');
        assert.equal(log.info.args[0][1].domain, 'other');
        assert.equal(log.info.args[0][1].type, 'bounced');
        assert.equal(log.info.args[4][1].complaint, true);
        assert.equal(log.info.args[4][1].complaintFeedbackType, complaintType);
        assert.equal(
          log.info.args[4][1].complaintUserAgent,
          'AnyCompany Feedback Loop (V0.01)'
        );
      });
  });

  it('should not delete verified accounts on bounce', () => {
    mockDB.accountRecord = sinon.spy((email) => {
      return P.resolve({
        createdAt: Date.now(),
        uid: '123456',
        email: email,
        emailVerified: email === 'verified@example.com',
      });
    });

    return mockedBounces(log, mockDB)
      .handleBounce(
        mockMessage({
          bounce: {
            bounceType: 'Permanent',
            // docs: http://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html#bounced-recipients
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
      )
      .then(() => {
        assert.equal(mockDB.accountRecord.callCount, 2);
        assert.equal(mockDB.accountRecord.args[0][0], 'test@example.com');
        assert.equal(mockDB.accountRecord.args[1][0], 'verified@example.com');
        assert.equal(mockDB.deleteAccount.callCount, 1);
        assert.equal(mockDB.deleteAccount.args[0][0].email, 'test@example.com');
        assert.equal(log.info.callCount, 5);
        assert.equal(log.info.args[1][0], 'handleBounce');
        assert.equal(log.info.args[1][1].email, 'test@example.com');
        assert.equal(log.info.args[1][1].domain, 'other');
        assert.equal(log.info.args[1][1].status, '5.0.0');
        assert.equal(log.info.args[1][1].action, 'failed');
        assert.equal(
          log.info.args[1][1].diagnosticCode,
          'smtp; 550 user unknown'
        );
        assert.equal(log.info.args[2][0], 'accountDeleted');
        assert.equal(log.info.args[2][1].email, 'test@example.com');
        assert.equal(log.info.args[4][0], 'handleBounce');
        assert.equal(log.info.args[4][1].email, 'verified@example.com');
        assert.equal(log.info.args[4][1].status, '4.0.0');
      });
  });

  it('should log errors when looking up the email record', () => {
    mockDB.accountRecord = sinon.spy(() => P.reject(new error({})));
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
    });
    return mockedBounces(log, mockDB)
      .handleBounce(mockMsg)
      .then(() => {
        assert.equal(mockDB.accountRecord.callCount, 1);
        assert.equal(mockDB.accountRecord.args[0][0], 'test@example.com');
        assert.equal(log.info.callCount, 2);
        assert.equal(log.info.args[1][0], 'handleBounce');
        assert.equal(log.info.args[1][1].email, 'test@example.com');
        assert.equal(log.error.callCount, 2);
        assert.equal(log.error.args[1][0], 'databaseError');
        assert.equal(log.error.args[1][1].email, 'test@example.com');
        assert.equal(mockMsg.del.callCount, 1);
      });
  });

  it('should log errors when deleting the email record', () => {
    mockDB.deleteAccount = sinon.spy(() =>
      P.reject(new error.unknownAccount('test@example.com'))
    );
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
    });
    return mockedBounces(log, mockDB)
      .handleBounce(mockMsg)
      .then(() => {
        assert.equal(mockDB.accountRecord.callCount, 1);
        assert.equal(mockDB.accountRecord.args[0][0], 'test@example.com');
        assert.equal(mockDB.deleteAccount.callCount, 1);
        assert.equal(mockDB.deleteAccount.args[0][0].email, 'test@example.com');
        assert.equal(log.info.callCount, 2);
        assert.equal(log.info.args[1][0], 'handleBounce');
        assert.equal(log.info.args[1][1].email, 'test@example.com');
        assert.equal(log.error.callCount, 2);
        assert.equal(log.error.args[1][0], 'databaseError');
        assert.equal(log.error.args[1][1].email, 'test@example.com');
        assert.equal(
          log.error.args[1][1].err.errno,
          error.ERRNO.ACCOUNT_UNKNOWN
        );
        assert.equal(mockMsg.del.callCount, 1);
      });
  });

  it('should normalize quoted email addresses for lookup', () => {
    mockDB.accountRecord = sinon.spy((email) => {
      // Lookup only succeeds when using original, unquoted email addr.
      if (email !== 'test.@example.com') {
        return P.reject(new error.unknownAccount(email));
      }
      return P.resolve({
        createdAt: Date.now(),
        uid: '123456',
        email: email,
        emailVerified: false,
      });
    });
    return mockedBounces(log, mockDB)
      .handleBounce(
        mockMessage({
          bounce: {
            bounceType: 'Permanent',
            bouncedRecipients: [
              // Bounce message has email addr in quoted form, since some
              // mail agents normalize it in this way.
              { emailAddress: '"test."@example.com' },
            ],
          },
        })
      )
      .then(() => {
        assert.equal(mockDB.createEmailBounce.callCount, 1);
        assert.equal(
          mockDB.createEmailBounce.args[0][0].email,
          'test.@example.com'
        );
        assert.equal(mockDB.accountRecord.callCount, 1);
        assert.equal(mockDB.accountRecord.args[0][0], 'test.@example.com');
        assert.equal(mockDB.deleteAccount.callCount, 1);
        assert.equal(
          mockDB.deleteAccount.args[0][0].email,
          'test.@example.com'
        );
      });
  });

  it('should handle multiple consecutive dots even if not quoted', () => {
    mockDB.accountRecord = sinon.spy((email) => {
      // Lookup only succeeds when using original, unquoted email addr.
      if (email !== 'test..me@example.com') {
        return P.reject(new error.unknownAccount(email));
      }
      return P.resolve({
        createdAt: Date.now(),
        uid: '123456',
        email: email,
        emailVerified: false,
      });
    });

    return mockedBounces(log, mockDB)
      .handleBounce(
        mockMessage({
          bounce: {
            bounceType: 'Permanent',
            bouncedRecipients: [
              // Some mail agents incorrectly fail to quote addresses that
              // contain multiple consecutive dots.  Ensure we work around it.
              { emailAddress: 'test..me@example.com' },
            ],
          },
        })
      )
      .then(() => {
        assert.equal(mockDB.createEmailBounce.callCount, 1);
        assert.equal(
          mockDB.createEmailBounce.args[0][0].email,
          'test..me@example.com'
        );
        assert.equal(mockDB.accountRecord.callCount, 1);
        assert.equal(mockDB.accountRecord.args[0][0], 'test..me@example.com');
        assert.equal(mockDB.deleteAccount.callCount, 1);
        assert.equal(
          mockDB.deleteAccount.args[0][0].email,
          'test..me@example.com'
        );
      });
  });

  it('should log a warning if it receives an unparseable email address', () => {
    mockDB.accountRecord = sinon.spy(() =>
      P.reject(new error.unknownAccount())
    );
    return mockedBounces(log, mockDB)
      .handleBounce(
        mockMessage({
          bounce: {
            bounceType: 'Permanent',
            bouncedRecipients: [{ emailAddress: 'how did this even happen?' }],
          },
        })
      )
      .then(() => {
        assert.equal(mockDB.createEmailBounce.callCount, 0);
        assert.equal(mockDB.accountRecord.callCount, 0);
        assert.equal(mockDB.deleteAccount.callCount, 0);
        assert.equal(log.warn.callCount, 2);
        assert.equal(log.warn.args[1][0], 'handleBounce.addressParseFailure');
      });
  });

  it('should log email template name, language, and bounceType', () => {
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bounceSubType: 'General',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [
          {
            name: 'Content-Language',
            value: 'db-LB',
          },
          {
            name: 'X-Template-Name',
            value: 'verifyLoginEmail',
          },
        ],
      },
    });

    return mockedBounces(log, mockDB)
      .handleBounce(mockMsg)
      .then(() => {
        assert.equal(mockDB.accountRecord.callCount, 1);
        assert.equal(mockDB.accountRecord.args[0][0], 'test@example.com');
        assert.equal(mockDB.deleteAccount.callCount, 1);
        assert.equal(mockDB.deleteAccount.args[0][0].email, 'test@example.com');
        assert.equal(log.info.callCount, 3);
        assert.equal(log.info.args[1][0], 'handleBounce');
        assert.equal(log.info.args[1][1].email, 'test@example.com');
        assert.equal(log.info.args[1][1].template, 'verifyLoginEmail');
        assert.equal(log.info.args[1][1].bounceType, 'Permanent');
        assert.equal(log.info.args[1][1].bounceSubType, 'General');
        assert.equal(log.info.args[1][1].lang, 'db-LB');
      });
  });

  it('should emit flow metrics', () => {
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bounceSubType: 'General',
        bouncedRecipients: [{ emailAddress: 'test@example.com' }],
      },
      mail: {
        headers: [
          {
            name: 'X-Template-Name',
            value: 'verifyLoginEmail',
          },
          {
            name: 'X-Flow-Id',
            value: 'someFlowId',
          },
          {
            name: 'X-Flow-Begin-Time',
            value: '1234',
          },
          {
            name: 'Content-Language',
            value: 'en',
          },
        ],
      },
    });

    return mockedBounces(log, mockDB)
      .handleBounce(mockMsg)
      .then(() => {
        assert.equal(mockDB.accountRecord.callCount, 1);
        assert.equal(mockDB.accountRecord.args[0][0], 'test@example.com');
        assert.equal(mockDB.deleteAccount.callCount, 1);
        assert.equal(mockDB.deleteAccount.args[0][0].email, 'test@example.com');
        assert.equal(log.flowEvent.callCount, 1);
        assert.equal(
          log.flowEvent.args[0][0].event,
          'email.verifyLoginEmail.bounced'
        );
        assert.equal(log.flowEvent.args[0][0].flow_id, 'someFlowId');
        assert.equal(log.flowEvent.args[0][0].flow_time > 0, true);
        assert.equal(log.flowEvent.args[0][0].time > 0, true);
        assert.equal(log.info.callCount, 3);
        assert.equal(log.info.args[0][0], 'emailEvent');
        assert.equal(log.info.args[0][1].type, 'bounced');
        assert.equal(log.info.args[0][1].template, 'verifyLoginEmail');
        assert.equal(log.info.args[0][1].flow_id, 'someFlowId');
      });
  });

  it('should log email domain if popular one', () => {
    const mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bounceSubType: 'General',
        bouncedRecipients: [{ emailAddress: 'test@aol.com' }],
      },
      mail: {
        headers: [
          {
            name: 'X-Template-Name',
            value: 'verifyLoginEmail',
          },
          {
            name: 'X-Flow-Id',
            value: 'someFlowId',
          },
          {
            name: 'X-Flow-Begin-Time',
            value: '1234',
          },
          {
            name: 'Content-Language',
            value: 'en',
          },
        ],
      },
    });

    return mockedBounces(log, mockDB)
      .handleBounce(mockMsg)
      .then(() => {
        assert.equal(log.flowEvent.callCount, 1);
        assert.equal(
          log.flowEvent.args[0][0].event,
          'email.verifyLoginEmail.bounced'
        );
        assert.equal(log.flowEvent.args[0][0].flow_id, 'someFlowId');
        assert.equal(log.flowEvent.args[0][0].flow_time > 0, true);
        assert.equal(log.flowEvent.args[0][0].time > 0, true);
        assert.equal(log.info.callCount, 3);
        assert.equal(log.info.args[0][0], 'emailEvent');
        assert.equal(log.info.args[0][1].domain, 'aol.com');
        assert.equal(log.info.args[0][1].type, 'bounced');
        assert.equal(log.info.args[0][1].template, 'verifyLoginEmail');
        assert.equal(log.info.args[0][1].locale, 'en');
        assert.equal(log.info.args[0][1].flow_id, 'someFlowId');
        assert.equal(log.info.args[1][1].email, 'test@aol.com');
        assert.equal(log.info.args[1][1].domain, 'aol.com');
      });
  });
});
