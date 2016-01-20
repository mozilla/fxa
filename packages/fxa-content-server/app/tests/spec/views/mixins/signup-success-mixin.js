/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var assert = require('chai').assert;
  var p = require('lib/promise');
  var SignUpSuccessMixin = require('views/mixins/signup-success-mixin');
  var sinon = require('sinon');

  describe('views/mixins/signup-success-mixin', function () {
    it('exports correct interface', function () {
      assert.isObject(SignUpSuccessMixin);
      assert.lengthOf(Object.keys(SignUpSuccessMixin), 1);
      assert.isFunction(SignUpSuccessMixin.onSignUpSuccess);
      assert.lengthOf(SignUpSuccessMixin.onSignUpSuccess, 1);
    });

    describe('instantiate', function () {
      var account;
      var view;

      beforeEach(function () {
        account = {
          get: function () {}
        };
        view = {
          _formPrefill: {
            clear: sinon.spy()
          },
          invokeBrokerMethod: sinon.spy(function () {
            return p();
          }),
          logViewEvent: sinon.spy(),
          navigate: sinon.spy(),
          onSignUpSuccess: SignUpSuccessMixin.onSignUpSuccess,
          relier: {
            has: function () {}
          }
        };
      });

      describe('account is not verified', function () {
        beforeEach(function () {
          sinon.spy(account, 'get');
          return view.onSignUpSuccess(account);
        });

        it('calls view.logViewEvent correctly', function () {
          assert.equal(view.logViewEvent.callCount, 1);
          assert.equal(view.logViewEvent.thisValues[0], view);
          var args = view.logViewEvent.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0], 'success');
        });

        it('calls view._formPrefill.clear correctly', function () {
          assert.equal(view._formPrefill.clear.callCount, 1);
          assert.equal(view._formPrefill.clear.thisValues[0], view._formPrefill);
          assert.lengthOf(view._formPrefill.clear.args[0], 0);
        });

        it('calls account.get correctly', function () {
          assert.equal(account.get.callCount, 1);
          assert.equal(account.get.thisValues[0], account);
          var args = account.get.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0], 'verified');
        });

        it('does not call view.invokeBrokerMethod', function () {
          assert.equal(view.invokeBrokerMethod.callCount, 0);
        });

        it('calls view.navigate correctly', function () {
          assert.equal(view.navigate.callCount, 1);
          assert.equal(view.navigate.thisValues[0], view);
          var args = view.navigate.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'confirm');
          assert.isObject(args[1]);
          assert.lengthOf(Object.keys(args[1]), 1);
          assert.equal(args[1].account, account);
        });
      });

      describe('view._formPrefill is undefined', function () {
        beforeEach(function () {
          view._formPrefill = undefined;
        });

        it('does not throw', function () {
          assert.doesNotThrow(function () {
            return view.onSignUpSuccess(account);
          });
        });
      });

      describe('account is verified', function () {
        beforeEach(function () {
          sinon.stub(account, 'get', function () {
            return true;
          });
        });

        afterEach(function () {
          account.get.restore();
        });

        describe('view.relier has preVerifyToken', function () {
          beforeEach(function () {
            sinon.stub(view.relier, 'has', function () {
              return true;
            });
            return view.onSignUpSuccess(account);
          });

          afterEach(function () {
            view.relier.has.restore();
          });

          it('calls view.logViewEvent correctly', function () {
            assert.equal(view.logViewEvent.callCount, 2);

            assert.equal(view.logViewEvent.thisValues[0], view);
            var args = view.logViewEvent.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'success');

            assert.equal(view.logViewEvent.thisValues[1], view);
            args = view.logViewEvent.args[1];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'preverified.success');
          });

          it('calls view._formPrefill.clear', function () {
            assert.equal(view._formPrefill.clear.callCount, 1);
          });

          it('calls account.get', function () {
            assert.equal(account.get.callCount, 1);
          });

          it('calls view.invokeBrokerMethod correctly', function () {
            assert.equal(view.invokeBrokerMethod.callCount, 1);
            assert.equal(view.invokeBrokerMethod.thisValues[0], view);
            var args = view.invokeBrokerMethod.args[0];
            assert.lengthOf(args, 2);
            assert.equal(args[0], 'afterSignIn');
            assert.equal(args[1], account);
          });

          it('calls view.relier.has correctly', function () {
            assert.equal(view.relier.has.callCount, 1);
            assert.equal(view.relier.has.thisValues[0], view.relier);
            var args = view.relier.has.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'preVerifyToken');
          });

          it('calls view.navigate correctly', function () {
            assert.equal(view.navigate.callCount, 1);
            assert.equal(view.navigate.thisValues[0], view);
            var args = view.navigate.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'signup_complete');
          });
        });

        describe('view.relier does not have preVerifyToken', function () {
          beforeEach(function () {
            sinon.stub(view.relier, 'has', function () {
              return false;
            });
            return view.onSignUpSuccess(account);
          });

          afterEach(function () {
            view.relier.has.restore();
          });

          it('calls view.logViewEvent', function () {
            assert.equal(view.logViewEvent.callCount, 1);
          });

          it('calls view._formPrefill.clear', function () {
            assert.equal(view.logViewEvent.callCount, 1);
          });

          it('calls account.get', function () {
            assert.equal(account.get.callCount, 1);
          });

          it('calls view.invokeBrokerMethod', function () {
            assert.equal(view.invokeBrokerMethod.callCount, 1);
          });

          it('calls view.relier.has', function () {
            assert.equal(view.relier.has.callCount, 1);
          });

          it('calls view.navigate correctly', function () {
            assert.equal(view.navigate.callCount, 1);
            assert.equal(view.navigate.thisValues[0], view);
            var args = view.navigate.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'settings');
          });
        });
      });
    });
  });
});

