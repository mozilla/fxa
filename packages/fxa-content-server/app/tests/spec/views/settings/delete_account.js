/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import AuthErrors from 'lib/auth-errors';
import Broker from 'models/auth_brokers/base';
import AttachedClients from 'models/attached-clients';
import chai from 'chai';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import NullChannel from 'lib/channels/null';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import Translator from 'lib/translator';
import View from 'views/settings/delete_account';
import BaseView from '../../../../scripts/views/base';

var assert = chai.assert;
var wrapAssertion = TestHelpers.wrapAssertion;

describe('views/settings/delete_account', function() {
  const UID = '123';
  const password = 'password';
  let account;
  let broker;
  let email;
  let metrics;
  let notifier;
  let relier;
  let translator;
  let tabChannelMock;
  let user;
  let view;
  let attachedClients;
  let parentView;
  let activeSubscriptions;

  function initView() {
    view = new View({
      attachedClients,
      broker,
      metrics,
      notifier,
      parentView,
      translator,
      user,
      relier,
      activeSubscriptions,
    });

    sinon.spy(view, 'logFlowEvent');

    return view.render();
  }

  beforeEach(() => {
    relier = new Relier();
    tabChannelMock = new NullChannel();
    user = new User();
    parentView = new BaseView();
    translator = new Translator({ forceEnglish: true });
    broker = new Broker({ relier });
    notifier = new Notifier({ tabChannel: tabChannelMock });
    metrics = new Metrics({ notifier });

    account = user.initAccount({
      email: email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });

    const clientList = [
      {
        deviceId: 'device-1',
        os: 'Windows',
        isCurrentSession: true,
        isWebSession: true,
        name: 'alpha',
        deviceType: 'tablet',
      },
      {
        clientId: 'app-1',
        isCurrentSession: true,
        isOAuthApp: true,
        name: 'beta',
      },
      {
        name: 'omega',
        clientType: 'webSession',
        isWebSession: true,
        userAgent: 'Firefox 40',
      },
      {
        clientId: 'app-2',
        isOAuthApp: true,
        lastAccessTime: Date.now(),
        name: 'Pocket',
        scope: ['profile', 'profile:write'],
      },
    ];

    attachedClients = new AttachedClients(clientList, {
      notifier,
    });

    sinon
      .stub(attachedClients, 'fetchClients')
      .callsFake(() => Promise.resolve());

    activeSubscriptions = [
      {
        plan_id: '321doneProMonthly',
        plan_name: '321done Pro Monthly',
        status: 'active',
      },
      {
        plan_id: '321doneProYearly',
        plan_name: '321done Pro Yearly',
        status: 'inactive',
      },
    ];

    sinon.stub(account, 'settingsData').callsFake(() =>
      Promise.resolve({
        subscriptions: activeSubscriptions,
      })
    );

    return initView();
  });

  afterEach(function() {
    metrics.destroy();
    metrics = null;

    $(view.el).remove();

    if ($.prototype.trigger.restore) {
      $.prototype.trigger.restore();
    }

    view.destroy();
    view = null;
  });

  describe('constructor', () => {
    beforeEach(() => {
      view = new View({
        notifier,
        parentView,
        user,
      });
    });

    it('creates an `AttachedClients` instance if one not passed in', () => {
      assert.ok(view._attachedClients);
    });
  });

  describe('with session', function() {
    beforeEach(() => {
      email = TestHelpers.createEmail();

      sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
      sinon.stub(notifier, 'trigger').callsFake(() => {});

      return view.render().then(() => {
        $('body').append(view.el);
      });
    });

    describe('render', () => {
      beforeEach(() => {
        sinon.spy(attachedClients, 'fetch');
      });

      it('does not fetch the clients list immediately to avoid startup XHR requests', () => {
        assert.isFalse(attachedClients.fetch.called);
      });

      it('does not fetch the subscriptions list immediately to avoid startup XHR requests', () => {
        assert.isFalse(account.settingsData.called);
      });
    });

    describe('_fetchAttachedClients', () => {
      beforeEach(() => {
        return Promise.resolve()
          .then(() => {
            assert.equal(view.logFlowEvent.callCount, 0);
            return view._fetchAttachedClients();
          })
          .then(() => {
            assert.equal(view.logFlowEvent.callCount, 1);
            const args = view.logFlowEvent.args[0];
            assert.lengthOf(args, 1);
            const eventParts = args[0].split('.');
            assert.lengthOf(eventParts, 4);
            assert.equal(eventParts[0], 'timing');
            assert.equal(eventParts[1], 'clients');
            assert.equal(eventParts[2], 'fetch');
            assert.match(eventParts[3], /^[0-9]+$/);
          });
      });

      it('delegates to the user to fetch the device list', () => {
        assert.isTrue(attachedClients.fetchClients.calledWith(user));
      });
    });

    describe('_fetchActiveSubscriptions', () => {
      beforeEach(() => {
        return Promise.resolve()
          .then(() => {
            assert.equal(view.logFlowEvent.callCount, 0);
            return view._fetchActiveSubscriptions();
          })
          .then(() => {
            assert.equal(view.logFlowEvent.callCount, 1);
            const args = view.logFlowEvent.args[0];
            assert.lengthOf(args, 1);
            const eventParts = args[0].split('.');
            assert.lengthOf(eventParts, 4);
            assert.equal(eventParts[0], 'timing');
            assert.equal(eventParts[1], 'settings');
            assert.equal(eventParts[2], 'fetch');
            assert.match(eventParts[3], /^[0-9]+$/);
          });
      });
      it('delegates to the account to fetch the subscriptions list from settingsData', () => {
        assert.isTrue(account.settingsData.called);
      });
    });

    describe('_toggleEnableSubmit', () => {
      beforeEach(() => {
        sinon.spy(view, '_toggleEnableSubmit');
      });

      it('should be disabled if checkboxes are not checked', () => {
        assert.isTrue(view.$('.delete-account-button').is(':disabled'));
      });

      it('enables the submit button if all checkboxes are checked', () => {
        view.$('.delete-account-checkbox').each(function() {
          $(this).prop('checked', true);
        });
        view._toggleEnableSubmit();

        assert.isFalse(view.$('.delete-account-button').is(':disabled'));
      });

      it('disables the submit button if all checkboxes are checked and one is unchecked', () => {
        view.$('.delete-account-checkbox').each(function() {
          $(this).prop('checked', true);
        });
        view._toggleEnableSubmit();

        view
          .$('.delete-account-checkbox')
          .first()
          .prop('checked', false);
        view._toggleEnableSubmit();

        assert.isTrue(view.$('.delete-account-button').is(':disabled'));
      });
    });

    describe('openPanel - failed fetch of attachedClients or activeSubscriptions', () => {
      beforeEach(() => {
        sinon.spy($.prototype, 'trigger');
        sinon.stub(view, 'logError');
        sinon
          .stub(view, '_fetchAttachedClients')
          .callsFake(() =>
            Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'))
          );
        sinon
          .stub(view, '_fetchActiveSubscriptions')
          .callsFake(() => Promise.resolve());
        return view.openPanel();
      });

      it('logs the error', () => {
        assert.isTrue(view.logError.calledOnce);
        const err = view.logError.args[0][0];
        assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
      });

      it('adds `hide` class to `delete-account-product-container` if client or subscriptions fetch fails', () => {
        assert.isTrue(
          view.$('.delete-account-product-container').hasClass('hide')
        );
      });
    });

    describe('openPanel', () => {
      beforeEach(() => {
        sinon.spy($.prototype, 'trigger');
        sinon.spy(view, '_fetchAttachedClients');
        sinon.spy(view, '_fetchActiveSubscriptions');
        return view.openPanel();
      });

      it('fetches the device and subscriptions list', () => {
        assert.isTrue(
          TestHelpers.isEventLogged(metrics, 'settings.delete-account.open')
        );
        assert.isTrue(view._fetchAttachedClients.calledOnce);
        assert.isTrue(view._fetchActiveSubscriptions.calledOnce);
      });

      it('renders only `status: "active"` subscriptions', () => {
        assert.isTrue(
          view.$('.delete-account-product-subscription').length === 1
        );
      });

      it('renders subscription title attributes', () => {
        assert.equal(
          view.$('.delete-account-product-subscription').attr('title'),
          '321done Pro Monthly'
        );
      });

      it('renders attachedClients already in the collection', () => {
        assert.ok(view.$('.delete-account-product-client').length, 2);
      });

      it('renders only `isOAuthApp: true` clients', () => {
        assert.isTrue(view.$('.delete-account-product-client').length === 2);
      });

      it('renders client title attributes', () => {
        assert.equal(
          view
            .$('.delete-account-product-client')
            .eq(0)
            .attr('title'),
          'beta'
        );
        assert.equal(
          view
            .$('.delete-account-product-client')
            .eq(1)
            .attr('title'),
          'Pocket'
        );
      });

      it('renders only `active: true` subscriptions', () => {
        assert.isTrue(
          view.$('.delete-account-product-subscription').length === 1
        );
      });

      it('renders subscription title attributes', () => {
        assert.equal(
          view.$('.delete-account-product-subscription').attr('title'),
          '321done Pro Monthly'
        );
      });

      describe('_uniqueBrowserNames', () => {
        beforeEach(() => {
          activeSubscriptions = [];
          attachedClients = [
            {
              name: 'alpha',
              isWebSession: true,
              clientType: 'webSession',
              userAgent: 'Firefox 68',
            },
            {
              name: 'beta',
              isWebSession: true,
              clientType: 'webSession',
              userAgent: 'Firefox 68',
            },
            {
              name: 'omega',
              isWebSession: true,
              clientType: 'webSession',
              userAgent: 'Firefox 70',
            },
          ];

          return view.render().then(() => view.openPanel());
        });

        it('renders an array with unique "userAgent" properties, ignoring version number', () => {
          assert.isTrue($('.delete-account-product-browser').length === 1);
        });

        it('renders title with "browser" instead of a version number', () => {
          assert.equal(
            view.$('.delete-account-product-browser').attr('title'),
            'Firefox browser'
          );
        });
      });

      describe('_getNumberOfProducts', () => {
        it('adds `hide` class to `delete-account-product-container` if number of rendered products is 0', () => {
          activeSubscriptions = [];
          attachedClients = [];

          return view
            .render()
            .then(() => view.openPanel())
            .then(() => {
              assert.isTrue($('.delete-account-product-list li').length === 0);
              assert.isTrue(
                view.$('.delete-account-product-container').hasClass('hide')
              );
            });
        });

        it('does not add `two-col` class to `delete-account-product-list` if number of rendered products is 3', () => {
          activeSubscriptions = [];

          return view
            .render()
            .then(() => view.openPanel())
            .then(() => {
              assert.isTrue($('.delete-account-product-list li').length === 3);
              assert.isFalse(
                view.$('.delete-account-product-list').hasClass('two-col')
              );
            });
        });

        it('adds `two-col` class to `delete-account-product-list` if number of rendered products 4', () => {
          assert.isTrue(view.$('.delete-account-product-list li').length === 4);
          assert.isTrue(
            view.$('.delete-account-product-list').hasClass('two-col')
          );
        });
      });

      describe('isValid', function() {
        it('returns true if all checkboxes are checked and password is filled out', function() {
          $('form input[type=password]').val(password);
          $('.delete-account-checkbox').each(function() {
            $(this).prop('checked', true);
          });

          assert.equal(view.isValid(), true);
        });

        it('returns false if password is too short', function() {
          $('form input[type=password]').val('passwor');

          assert.equal(view.isValid(), false);
        });

        it('returns false if all 3 checkboxes are not checked', function() {
          $('.delete-account-checkbox').each(function(i) {
            if (i !== 0) {
              // leave the first one unchecked
              $(this).prop('checked', true);
            }
          });

          assert.equal(view.isValid(), false);
        });
      });

      describe('showValidationErrors', function() {
        it('shows an error if the password is invalid', function(done) {
          view.$('[type=email]').val('testuser@testuser.com');
          view.$('[type=password]').val('passwor');

          view.on('validation_error', function(which, msg) {
            wrapAssertion(function() {
              assert.ok(msg);
            }, done);
          });

          view.showValidationErrors();
        });
      });

      describe('submit', function() {
        beforeEach(function() {
          $('form input[type=email]').val(email);
          $('form input[type=password]').val(password);
        });

        describe('success', function() {
          beforeEach(function() {
            sinon.stub(user, 'deleteAccount').callsFake(function() {
              return Promise.resolve();
            });

            sinon.spy(broker, 'afterDeleteAccount');
            sinon.spy(view, 'logViewEvent');
            sinon.spy(view, 'navigate');

            return view.submit();
          });

          it('delegates to the user model', function() {
            assert.isTrue(user.deleteAccount.calledOnce);
            assert.isTrue(user.deleteAccount.calledWith(account, password));
          });

          it('notifies the broker', function() {
            assert.isTrue(broker.afterDeleteAccount.calledOnce);
            assert.isTrue(broker.afterDeleteAccount.calledWith(account));
          });

          it('redirects to signup, clearing query params', function() {
            assert.equal(view.navigate.args[0][0], 'signup');

            assert.ok(view.navigate.args[0][1].success);
            assert.isTrue(view.navigate.args[0][2].clearQueryParams);
          });

          it('logs success', function() {
            assert.isTrue(view.logViewEvent.calledOnce);
            assert.isTrue(view.logViewEvent.calledWith('deleted'));
          });
        });

        describe('error', function() {
          beforeEach(function() {
            view.$('#password').val('bad_password');

            sinon.stub(user, 'deleteAccount').callsFake(function() {
              return Promise.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
            });

            sinon.stub(view, 'showValidationError').callsFake(function() {});
            return view.submit();
          });

          it('display an error message', function() {
            assert.isTrue(view.showValidationError.called);
          });
        });

        describe('other errors', function() {
          beforeEach(function() {
            sinon.stub(user, 'deleteAccount').callsFake(function() {
              return Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
            });
          });

          it('are re-thrown', function() {
            return view.submit().then(assert.fail, function(err) {
              assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
            });
          });
        });
      });
    });
  });
});
