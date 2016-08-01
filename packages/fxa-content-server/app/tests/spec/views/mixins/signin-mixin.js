/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Account = require('models/account');
  var assert = require('chai').assert;
  var AuthBroker = require('models/auth_brokers/base');
  var Backbone = require('backbone');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var SignInMixin = require('views/mixins/signin-mixin');
  var sinon = require('sinon');
  var VerificationMethods = require('lib/verification-methods');
  var VerificationReasons = require('lib/verification-reasons');

  var RESUME_TOKEN = 'a big hairy resume token';

  describe('views/mixins/signin-mixin', function () {
    it('exports correct interface', function () {
      assert.isObject(SignInMixin);
      assert.lengthOf(Object.keys(SignInMixin), 2);
      assert.isFunction(SignInMixin.signIn);
      assert.isFunction(SignInMixin.onSignInSuccess);
    });

    describe('signIn', function () {
      var account;
      var broker;
      var flow;
      var model;
      var relier;
      var view;

      beforeEach(function () {
        account = new Account({
          email: 'testuser@testuser.com',
          verified: true
        });
        broker = new AuthBroker();
        flow = {};
        model = new Backbone.Model();

        relier = new Relier();
        view = {
          _formPrefill: {
            clear: sinon.spy()
          },
          broker: broker,
          flow: flow,
          getStringifiedResumeToken: sinon.spy(function () {
            return RESUME_TOKEN;
          }),
          invokeBrokerMethod: sinon.spy(function () {
            return p();
          }),
          logViewEvent: sinon.spy(),
          model: model,
          navigate: sinon.spy(),
          onSignInSuccess: SignInMixin.onSignInSuccess,
          relier: relier,
          signIn: SignInMixin.signIn,
          user: {
            signInAccount: sinon.spy(function (account) {
              return p(account);
            })
          }
        };
      });

      describe('account needs permissions', function () {
        beforeEach(function () {
          sinon.stub(relier, 'accountNeedsPermissions', function () {
            return true;
          });

          return view.signIn(account, 'password');
        });

        it('invokes the correct broker method', function () {
          assert.isTrue(
            view.invokeBrokerMethod.calledWith('beforeSignIn', 'testuser@testuser.com'));
        });

        it('signs in the user', function () {
          assert.isTrue(
            view.user.signInAccount.calledWith(account, 'password', relier));
          assert.equal(view.user.signInAccount.args[0][3].resume, RESUME_TOKEN);
        });

        it('redirects to the `signin_permissions` screen', function () {
          assert.isTrue(view.navigate.calledOnce);

          var args = view.navigate.args[0];
          assert.equal(args[0], 'signin_permissions');
          assert.deepEqual(args[1].account, account);
          assert.isFunction(args[1].onSubmitComplete);
        });

        it('does not log any events', function () {
          assert.isFalse(view.logViewEvent.called);
        });
      });

      describe('verified account', function () {
        describe('with `redirectTo` specified', function () {
          beforeEach(function () {
            model.set('redirectTo', 'settings/avatar');

            return view.signIn(account, 'password');
          });

          it('calls view.logViewEvent correctly', function () {
            assert.equal(view.logViewEvent.callCount, 2);
            assert.isTrue(view.logViewEvent.calledWith('success'));
            assert.isTrue(view.logViewEvent.calledWith('signin.success'));
          });

          it('calls view._formPrefill.clear correctly', function () {
            assert.equal(view._formPrefill.clear.callCount, 1);
            assert.lengthOf(view._formPrefill.clear.args[0], 0);
          });

          it('calls view.invokeBrokerMethod correctly', function () {
            assert.equal(view.invokeBrokerMethod.callCount, 2);

            var args = view.invokeBrokerMethod.args[0];
            assert.lengthOf(args, 2);
            assert.equal(args[0], 'beforeSignIn');
            assert.equal(args[1], 'testuser@testuser.com');

            args = view.invokeBrokerMethod.args[1];
            assert.lengthOf(args, 2);
            assert.equal(args[0], 'afterSignIn');
            assert.equal(args[1], account);
          });

          it('calls view.navigate correctly', function () {
            assert.equal(view.navigate.callCount, 1);
            var args = view.navigate.args[0];
            assert.lengthOf(args, 4);
            assert.equal(args[0], 'settings/avatar');
            assert.isObject(args[1]);
            assert.lengthOf(Object.keys(args[1]), 0);
            assert.deepEqual(args[2], {});
            assert.isUndefined(args[3]);
          });
        });

        describe('without `redirectTo` specified', function () {
          beforeEach(function () {
            model.unset('redirectTo');

            return view.signIn(account, 'password');
          });

          it('calls view.navigate correctly', function () {
            assert.equal(view.navigate.callCount, 1);
            var args = view.navigate.args[0];
            assert.lengthOf(args, 4);
            assert.equal(args[0], 'settings');
            assert.isObject(args[1]);
            assert.lengthOf(Object.keys(args[1]), 0);
            assert.deepEqual(args[2], {});
            assert.isUndefined(args[3]);
          });
        });
      });

      describe('unverified account', function () {
        beforeEach(function () {
          account.set({
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_UP,
            verified: false
          });

          return view.signIn(account, 'password');
        });

        it('signs in the user', function () {
          assert.isTrue(
            view.user.signInAccount.calledWith(account, 'password', relier));
          assert.equal(view.user.signInAccount.args[0][3].resume, RESUME_TOKEN);
        });

        it('calls view.navigate correctly', function () {
          assert.equal(view.navigate.callCount, 1);
          var args = view.navigate.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'confirm');
          assert.strictEqual(args[1].account, account);
          assert.strictEqual(args[1].flow, flow);
        });
      });

      describe('unverified session', function () {
        beforeEach(function () {
          account.set({
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
            verified: false
          });

          return view.signIn(account, 'password');
        });

        it('signs in the user', function () {
          assert.isTrue(
            view.user.signInAccount.calledWith(account, 'password', relier));
          assert.equal(view.user.signInAccount.args[0][3].resume, RESUME_TOKEN);
        });

        it('calls view.navigate correctly', function () {
          assert.equal(view.navigate.callCount, 1);
          var args = view.navigate.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'confirm_signin');
          assert.strictEqual(args[1].account, account);
          assert.strictEqual(args[1].flow, flow);
        });
      });

      describe('_formPrefill undefined', function () {
        beforeEach(function () {
          view._formPrefill = undefined;
        });

        it('does not throw', function () {
          assert.doesNotThrow(function () {
            return view.signIn(account);
          });
        });
      });
    });
  });
});

