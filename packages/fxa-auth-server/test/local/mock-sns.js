/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
// noPreserveCache is needed to prevent the mock mailer from
// being used for all future tests that include mock-nexmo.
const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');
const config = require('../../config').getProperties();

describe('mock-sns', () => {
  let mailer;
  let mockSNS;

  const MockSNS = proxyquire('../../test/mock-sns', {
    nodemailer: {
      createTransport: () => mailer,
    },
  });

  before(() => {
    mailer = {
      sendMail: sinon.spy((config, callback) => callback()),
    };
    mockSNS = new MockSNS(null, config);
  });

  afterEach(() => {
    mailer.sendMail.resetHistory();
  });

  it('constructor creates an instance', () => {
    assert.ok(mockSNS);
  });

  describe('message.sendSms', () => {
    let result;

    beforeEach(() => {
      return mockSNS
        .publish({
          PhoneNumber: '+019999999999',
          Message: 'message',
        })
        .promise()
        .then((r) => (result = r));
    });

    it('returns message id', () => {
      assert.deepEqual(result, { MessageId: 'fake message id' });
    });

    it('calls mailer.sendMail correctly', () => {
      assert.equal(mailer.sendMail.callCount, 1);
      const sendConfig = mailer.sendMail.args[0][0];
      assert.equal(sendConfig.from, config.smtp.sender);
      assert.equal(sendConfig.to, 'sms.+019999999999@restmail.net');
      assert.equal(sendConfig.subject, 'MockSNS.publish');
      assert.equal(sendConfig.text, 'message');
    });
  });
});
