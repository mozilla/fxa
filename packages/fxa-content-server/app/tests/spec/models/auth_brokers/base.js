/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Account = require('models/account');
  var BaseAuthenticationBroker = require('models/auth_brokers/base');
  var chai = require('chai');
  var Relier = require('models/reliers/relier');
  var SameBrowserVerificationModel = require('models/verification/same-browser');
  var sinon = require('sinon');
  var WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('models/auth_brokers/base', function () {
    var account;
    var broker;
    var relier;
    var windowMock;

    beforeEach(function () {
      account = new Account({ uid: 'users_uid' });
      relier = new Relier({ context: 'fx_fennec_v1' });
      windowMock = new WindowMock();

      broker = new BaseAuthenticationBroker({
        relier: relier,
        window: windowMock
      });
    });

    function testDoesNotHalt(behavior) {
      assert.ok(behavior);
      assert.isUndefined(behavior.halt);
      return behavior;
    }

    describe('afterLoaded', function () {
      it('returns a promise', function () {
        return broker.afterLoaded()
          .then(assert.pass);
      });
    });

    describe('cancel', function () {
      it('returns a promise', function () {
        return broker.cancel()
          .then(assert.pass);
      });
    });

    describe('persistVerificationData', function () {
      var verificationInfo;

      beforeEach(function () {
        return broker.persistVerificationData(account)
          .then(function () {
            verificationInfo = new SameBrowserVerificationModel({}, {
              namespace: 'context',
              uid: 'users_uid'
            });
            verificationInfo.load();
          });
      });

      it('persist the relier\'s `context` to localStorage', function () {
        assert.equal(verificationInfo.get('context'), 'fx_fennec_v1');
      });
    });

    describe('unpersistVerificationData', function () {
      var verificationInfo;

      beforeEach(function () {
        return broker.persistVerificationData(account)
          .then(function () {
            return broker.unpersistVerificationData(account);
          })
          .then(function () {
            verificationInfo = new SameBrowserVerificationModel({}, {
              namespace: 'context',
              uid: 'users_uid'
            });
            verificationInfo.load();
          });
      });

      it('delete\'s the stored `context` from localStorage', function () {
        assert.isFalse(verificationInfo.has('context'));
      });
    });

    describe('afterChangePassword', function () {
      it('returns a promise', function () {
        return broker.afterChangePassword(account)
          .then(testDoesNotHalt);
      });
    });

    describe('afterCompleteResetPassword', function () {
      beforeEach(function () {
        sinon.spy(broker, 'unpersistVerificationData');
        return broker.afterCompleteResetPassword(account);
      });

      it('unpersistVerificationDatas data', function () {
        assert.isTrue(broker.unpersistVerificationData.calledWith(account));
      });
    });

    describe('afterCompleteSignUp', function () {
      beforeEach(function () {
        sinon.spy(broker, 'unpersistVerificationData');
        return broker.afterCompleteSignUp(account);
      });

      it('unpersistVerificationDatas data', function () {
        assert.isTrue(broker.unpersistVerificationData.calledWith(account));
      });
    });

    describe('afterDeleteAccount', function () {
      it('returns a promise', function () {
        return broker.afterDeleteAccount(account)
          .then(testDoesNotHalt);
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('returns a promise', function () {
        return broker.afterResetPasswordConfirmationPoll(account)
          .then(testDoesNotHalt);
      });
    });

    describe('afterSignIn', function () {
      it('returns a promise', function () {
        return broker.afterSignIn(account)
          .then(testDoesNotHalt);
      });
    });

    describe('afterForceAuth', function () {
      it('returns a promise', function () {
        return broker.afterForceAuth(account)
          .then(testDoesNotHalt);
      });
    });

    describe('beforeSignIn', function () {
      it('returns a promise', function () {
        return broker.beforeSignIn(account)
          .then(testDoesNotHalt);
      });
    });

    describe('afterSignUpConfirmationPoll', function () {
      it('returns a promise', function () {
        return broker.afterSignUpConfirmationPoll(account)
          .then(testDoesNotHalt);
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('returns a promise', function () {
        return broker.beforeSignUpConfirmationPoll(account)
          .then(testDoesNotHalt);
      });
    });

    describe('afterCompleteAccountUnlock', function () {
      beforeEach(function () {
        sinon.spy(broker, 'unpersistVerificationData');
        return broker.afterCompleteAccountUnlock(account);
      });

      it('unpersistVerificationDatas data', function () {
        assert.isTrue(broker.unpersistVerificationData.calledWith(account));
      });
    });

    describe('transformLink', function () {
      it('does nothing to the link', function () {
        assert.equal(broker.transformLink('signin'), 'signin');
      });
    });

    describe('isForceAuth', function () {
      it('returns `false` by default', function () {
        assert.isFalse(broker.isForceAuth());
      });

      it('returns `true` if flow began at `/force_auth`', function () {
        windowMock.location.pathname = '/force_auth';
        return broker.fetch()
          .then(function () {
            assert.isTrue(broker.isForceAuth());
          });
      });
    });

    describe('isAutomatedBrowser', function () {
      it('returns `false` by default', function () {
        assert.isFalse(broker.isAutomatedBrowser());
      });

      it('returns `true` if the URL contains `isAutomatedBrowser=true`', function () {
        windowMock.location.search = '?automatedBrowser=true';
        return broker.fetch()
          .then(function () {
            assert.isTrue(broker.isAutomatedBrowser());
          });
      });
    });

    describe('capabilities', function () {
      describe('hasCapability', function () {
        it('returns `false` by default', function () {
          assert.isFalse(broker.hasCapability('some-capability'));
        });

        it('returns `false` if the capability\'s value is falsy', function () {
          broker.setCapability('some-capability', false);
          assert.isFalse(broker.hasCapability('some-capability'));

          broker.setCapability('some-capability', undefined);
          assert.isFalse(broker.hasCapability('some-capability'));

          broker.setCapability('some-capability', null);
          assert.isFalse(broker.hasCapability('some-capability'));

          broker.setCapability('some-capability', 0);
          assert.isFalse(broker.hasCapability('some-capability'));
        });

        it('returns `true` if `setCapability` was called with truthy value', function () {
          broker.setCapability('some-capability', { key: 'value' });
          assert.isTrue(broker.hasCapability('some-capability'));

          broker.setCapability('other-capability', true);
          assert.isTrue(broker.hasCapability('other-capability'));

          broker.unsetCapability('other-capability');
          assert.isFalse(broker.hasCapability('other-capability'));
        });

        it('returns `true` for `signup` by default', function () {
          assert.isTrue(broker.hasCapability('signup'));
        });

        it('returns `true` for `handleSignedInNotification` by default', function () {
          assert.isTrue(broker.hasCapability('handleSignedInNotification'));
        });

        it('returns `true` for `emailVerificationMarketingSnippet` by default', function () {
          assert.isTrue(broker.hasCapability('emailVerificationMarketingSnippet'));
        });

        it('returns `false` for `syncPreferencesNotification` by default', function () {
          assert.isFalse(broker.hasCapability('syncPreferencesNotification'));
        });
      });

      describe('getCapability', function () {
        it('returns `undefined` by default', function () {
          assert.isUndefined(broker.getCapability('missing-capability'));
        });

        it('returns the capability value if available', function () {
          var capabilityMetadata = { key: 'value' };
          broker.setCapability('some-capability', capabilityMetadata);
          assert.deepEqual(
            broker.getCapability('some-capability'), capabilityMetadata);


          broker.unsetCapability('some-capability');
          assert.isUndefined(broker.getCapability('some-capability'));
        });
      });
    });

    describe('getBehavior', function () {
      it('gets a behavior, if defined', function () {
        var behavior = broker.getBehavior('beforeSignIn');
        assert.isDefined(behavior);
      });

      it('throws if behavior is not defined', function () {
        assert.throws(function () {
          broker.getBehavior('NOT_SET');
        }, 'behavior not found for: NOT_SET');
      });
    });

    describe('setBehavior', function () {
      it('sets a behavior', function () {
        broker.setBehavior('new behavior', { halt: true });
        assert.isTrue(broker.getBehavior('new behavior').halt);
      });
    });
  });
});


