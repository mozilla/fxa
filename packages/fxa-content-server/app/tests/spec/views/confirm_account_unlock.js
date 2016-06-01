/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var Backbone = require('backbone');
  var chai = require('chai');
  var Duration = require('duration');
  var FxaClient = require('lib/fxa-client');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var OAuthBroker = require('models/auth_brokers/oauth');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var SIGN_IN_REASONS = require('lib/sign-in-reasons');
  var TestHelpers = require('../../lib/helpers');
  var User = require('models/user');
  var View = require('views/confirm_account_unlock');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/confirm_account_unlock', function () {
    var account;
    var broker;
    var fxaClient;
    var metrics;
    var model;
    var notifier;
    var relier;
    var user;
    var view;
    var windowMock;
    var EMAIL = 'testuser@testuser.com';

    function initView() {
      view = new View({
        broker: broker,
        fxaClient: fxaClient,
        metrics: metrics,
        model: model,
        notifier: notifier,
        relier: relier,
        user: user,
        viewName: 'confirm-account-unlock',
        window: windowMock
      });
      view.VERIFICATION_POLL_IN_MS = new Duration('10ms').milliseconds();
    }

    beforeEach(function () {
      fxaClient = new FxaClient();
      metrics = new Metrics();
      notifier = new Notifier();
      relier = new Relier();
      windowMock = new WindowMock();

      broker = new OAuthBroker({
        relier: relier,
        session: Session,
        window: windowMock
      });
      user = new User({
        fxaClient: fxaClient,
        metrics: metrics
      });

      account = user.initAccount({
        email: EMAIL
      });

      model = new Backbone.Model({
        account: account,
        lockoutSource: 'signin',
        password: 'password'
      });

      initView();

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = metrics = null;
    });

    describe('beforeRender', function () {
      beforeEach(function () {
        sinon.stub(account, 'isDefault', function () {
          return true;
        });

        sinon.spy(view, 'navigate');

        return view.beforeRender();
      });

      it('redirects users who browse directly to the page to /signup', function () {
        assert.isTrue(view.navigate.calledWith('signup'));
      });
    });

    describe('render', function () {
      it('shows the confirm-account-unlock view', function () {
        assert.ok($('#fxa-confirm-account-unlock-header').length);
      });
    });

    describe('afterVisible', function () {
      describe('for signin', function () {
        beforeEach(function () {
          var count = 0;
          sinon.stub(fxaClient, 'signIn', function () {
            if (count === 3) {
              return p({
                sessionToken: 'newSessionToken'
              });
            }

            count++;
            return p.reject(AuthErrors.toError('ACCOUNT_LOCKED'));
          });

          // we want the poll to happen.
          windowMock.setTimeout = window.setTimeout.bind(window);

          sinon.stub(broker, 'afterSignIn', function () {
            return p({});
          });

          sinon.spy(view, 'navigate');

          return view.afterVisible();
        });

        it('polls until complete', function () {
          assert.equal(fxaClient.signIn.callCount, 4);
          var args = fxaClient.signIn.args[0];

          var signInEmail = args[0];
          assert.equal(signInEmail, EMAIL);

          var signInPassword = args[1];
          assert.equal(signInPassword, 'password');

          var signInRelier = args[2];
          assert.strictEqual(signInRelier, relier);

          var signInReason = args[3].reason;
          assert.equal(signInReason, SIGN_IN_REASONS.ACCOUNT_UNLOCK);
        });

        it('if caused by signin, notifies the broker when complete', function () {
          assert.isTrue(broker.afterSignIn.called);
        });

        it('redirects to `/account_unlock_complete`', function () {
          assert.isTrue(view.navigate.calledWith('account_unlock_complete'));
        });
      });

      describe('if not caused by signin', function () {
        beforeEach(function () {
          model.set({
            account: account,
            lockoutSource: 'change_password',
            password: 'password'
          });

          initView();

          sinon.stub(fxaClient, 'signIn', function () {
            return p({
              sessionToken: 'newSessionToken'
            });
          });

          sinon.spy(broker, 'afterSignIn');
          sinon.spy(view, 'back');

          return view.afterVisible();
        });

        it('does not notify the broker', function () {
          assert.isFalse(broker.afterSignIn.called);
        });

        it('navigates back a view', function () {
          assert.isTrue(view.back.called);
          assert.include(view.back.args[0][0].success, 'unlocked');
        });
      });

      describe('if user entered the wrong password', function () {
        beforeEach(function () {
          sinon.stub(fxaClient, 'signIn', function () {
            return p.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
          });

          sinon.spy(broker, 'afterSignIn');
          sinon.spy(view, 'back');

          return view.afterVisible();
        });

        it('does not notify the broker', function () {
          assert.isFalse(broker.afterSignIn.called);
        });

        it('navigates back', function () {
          assert.isTrue(view.back.called);
          assert.isTrue(
            AuthErrors.is(view.back.args[0][0].error, 'INCORRECT_PASSWORD'));
        });
      });

      describe('any other poll errors', function () {
        beforeEach(function () {
          sinon.stub(fxaClient, 'signIn', function () {
            return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
          });

          sinon.spy(view, 'displayError');

          return view.afterVisible();
        });

        it('are displayed verbatim', function () {
          assert.isTrue(view.displayError.called);

          var err = view.displayError.args[0][0];
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
        });
      });
    });

    describe('afterRender', function () {
      var FLOW_ID = 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103';

      beforeEach(function () {
        $('body').data('flowId', FLOW_ID);
        $('body').data('flowBegin', 3);
        sinon.spy(metrics, 'setActivityEventMetadata');
        sinon.spy(metrics, 'logFlowBegin');
        return view.afterRender();
      });

      it('called metrics.setActivityEventMetadata correctly', function () {
        assert.equal(metrics.setActivityEventMetadata.callCount, 1);
        var args = metrics.setActivityEventMetadata.args[0];
        assert.lengthOf(args, 1);
        assert.lengthOf(Object.keys(args[0]), 2);
        assert.equal(args[0].flowId, FLOW_ID);
        assert.equal(args[0].flowBeginTime, 3);
      });

      it('called metrics.logFlowBegin correctly', function () {
        assert.equal(metrics.logFlowBegin.callCount, 1);
        var args = metrics.logFlowBegin.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], FLOW_ID);
        assert.equal(args[1], 3);
      });
    });

    describe('submit', function () {
      it('logs events, calls `sendAccountUnlockEmail`, displays success message', function () {
        sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
          return p();
        });
        sinon.stub(view, 'getStringifiedResumeToken', function () {
          return 'resume token';
        });

        return view.submit()
          .then(function () {
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'confirm-account-unlock.resend'));
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'confirm-account-unlock.resend.success'));
            assert.isTrue(fxaClient.sendAccountUnlockEmail.calledWith(
              EMAIL,
              relier,
              {
                resume: 'resume token'
              }
            ));
            assert.isTrue(view.isSuccessVisible());
          });
      });

      it('throws errors for display', function () {
        sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
          return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        return view.submit()
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
          });
      });
    });
  });
});
