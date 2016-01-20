/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var assert = require('chai').assert;
  var p = require('lib/promise');
  var SignInSuccessMixin = require('views/mixins/signin-success-mixin');
  var sinon = require('sinon');

  describe('views/mixins/signin-success-mixin', function () {
    it('exports correct interface', function () {
      assert.isFunction(SignInSuccessMixin);
      assert.lengthOf(SignInSuccessMixin, 2);
      assert.isObject(SignInSuccessMixin());
      assert.lengthOf(Object.keys(SignInSuccessMixin()), 1);
      assert.isFunction(SignInSuccessMixin().onSignInSuccess);
      assert.lengthOf(SignInSuccessMixin().onSignInSuccess, 1);
    });

    describe('instantiate with defaults', function () {
      var account;
      var view;

      beforeEach(function () {
        account = {};
        view = {
          _formPrefill: {
            clear: sinon.spy()
          },
          invokeBrokerMethod: sinon.spy(function () {
            return p();
          }),
          logViewEvent: sinon.spy(),
          model: {
            get: sinon.spy()
          },
          navigate: sinon.spy(),
          onSignInSuccess: SignInSuccessMixin().onSignInSuccess
        };
      });

      describe('invoke', function () {
        beforeEach(function () {
          return view.onSignInSuccess(account);
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

        it('calls view.invokeBrokerMethod correctly', function () {
          assert.equal(view.invokeBrokerMethod.callCount, 1);
          assert.equal(view.invokeBrokerMethod.thisValues[0], view);
          var args = view.invokeBrokerMethod.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'afterSignIn');
          assert.equal(args[1], account);
        });

        it('calls view.model.get correctly', function () {
          assert.equal(view.model.get.callCount, 1);
          assert.equal(view.model.get.thisValues[0], view.model);
          var args = view.model.get.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0], 'redirectTo');
        });

        it('calls view.navigate correctly', function () {
          assert.equal(view.navigate.callCount, 1);
          assert.equal(view.navigate.thisValues[0], view);
          var args = view.navigate.args[0];
          assert.lengthOf(args, 4);
          assert.equal(args[0], 'settings');
          assert.isObject(args[1]);
          assert.lengthOf(Object.keys(args[1]), 0);
          assert.isUndefined(args[2]);
          assert.isUndefined(args[3]);
        });
      });

      describe('invoke with view._formPrefill undefined', function () {
        beforeEach(function () {
          view._formPrefill = undefined;
        });

        it('does not throw', function () {
          assert.doesNotThrow(function () {
            return view.onSignInSuccess(account);
          });
        });
      });
    });

    describe('instantiate with options then invoke', function () {
      var account;
      var view;

      beforeEach(function () {
        account = {};
        view = {
          invokeBrokerMethod: sinon.spy(function () {
            return p();
          }),
          logViewEvent: sinon.spy(),
          model: {
            get: sinon.spy(function () {
              return 'foo';
            })
          },
          navigate: sinon.spy(),
          onSignInSuccess: SignInSuccessMixin('bar', 'baz').onSignInSuccess
        };
        return view.onSignInSuccess(account);
      });

      it('calls view.logViewEvent', function () {
        assert.equal(view.logViewEvent.callCount, 1);
      });

      it('calls view.invokeBrokerMethod correctly', function () {
        assert.equal(view.invokeBrokerMethod.callCount, 1);
        assert.equal(view.invokeBrokerMethod.thisValues[0], view);
        var args = view.invokeBrokerMethod.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'bar');
        assert.equal(args[1], account);
      });

      it('calls view.model.get', function () {
        assert.equal(view.model.get.callCount, 1);
      });

      it('calls view.navigate correctly', function () {
        assert.equal(view.navigate.callCount, 1);
        assert.equal(view.navigate.thisValues[0], view);
        var args = view.navigate.args[0];
        assert.lengthOf(args, 4);
        assert.equal(args[0], 'foo');
        assert.isObject(args[1]);
        assert.lengthOf(Object.keys(args[1]), 0);
        assert.equal(args[2], 'baz');
        assert.isUndefined(args[3]);
      });
    });
  });
});

