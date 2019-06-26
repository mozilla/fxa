/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import Constants from 'lib/constants';
import EmailResend from 'models/email-resend';
import sinon from 'sinon';

var assert = chai.assert;

describe('models/email-resend', function() {
  var emailResend;

  afterEach(function() {
    emailResend = null;
  });

  describe('incrementRequestCount', function() {
    it('increments the number of tries', function() {
      emailResend = new EmailResend();
      assert.equal(emailResend.get('tries'), 0);
      emailResend.incrementRequestCount();
      assert.equal(emailResend.get('tries'), 1);
    });

    it('calls onMaxTriesReached when max tries reached', function() {
      var onMaxTriesReached = sinon.spy();

      emailResend = new EmailResend();
      emailResend.on('maxTriesReached', onMaxTriesReached);

      for (var i = 0; i < Constants.EMAIL_RESEND_MAX_TRIES - 1; i++) {
        emailResend.incrementRequestCount();
      }
      assert.equal(onMaxTriesReached.callCount, 0);
      emailResend.incrementRequestCount();
      assert.equal(onMaxTriesReached.callCount, 1);
      for (i = 0; i < 10; i++) {
        emailResend.incrementRequestCount();
      }
      assert.equal(onMaxTriesReached.callCount, 11);
    });

    it('calls onMaxTriesReached according to the number of maxTries', function() {
      var onMaxTriesReached = sinon.spy();

      emailResend = new EmailResend({
        maxTries: 2,
      });
      emailResend.on('maxTriesReached', onMaxTriesReached);

      emailResend.incrementRequestCount();
      assert.equal(onMaxTriesReached.callCount, 0);
      emailResend.incrementRequestCount();
      assert.equal(onMaxTriesReached.callCount, 1);
      for (var i = 0; i < 10; i++) {
        emailResend.incrementRequestCount();
      }
      assert.equal(onMaxTriesReached.callCount, 11);
    });
  });

  describe('reset', function() {
    it('resets the number of tries', function() {
      emailResend = new EmailResend();
      emailResend.incrementRequestCount();
      emailResend.incrementRequestCount();
      emailResend.incrementRequestCount();
      emailResend.incrementRequestCount();
      assert.equal(emailResend.get('tries'), 4);
      emailResend.reset();
      assert.equal(emailResend.get('tries'), 0);
    });
  });

  describe('shouldResend', function() {
    it('it returns true to the first 4 tries only', function() {
      emailResend = new EmailResend();
      assert.isTrue(emailResend.shouldResend());
      emailResend.incrementRequestCount();
      assert.isTrue(emailResend.shouldResend());
      emailResend.incrementRequestCount();
      assert.isTrue(emailResend.shouldResend());
      emailResend.incrementRequestCount();
      assert.isTrue(emailResend.shouldResend());
      emailResend.incrementRequestCount();
      assert.isTrue(emailResend.shouldResend());
      for (var i = 0; i < 10; i++) {
        emailResend.incrementRequestCount();
        assert.isFalse(emailResend.shouldResend());
      }
    });
  });
});
