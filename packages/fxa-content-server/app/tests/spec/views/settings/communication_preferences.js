/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import { assert } from 'chai';
import Constants from 'lib/constants';
import MarketingEmailErrors from 'lib/marketing-email-errors';
import MarketingEmailPrefs from 'models/marketing-email-prefs';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import Translator from 'lib/translator';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/communication_preferences';
import WindowMock from '../../../mocks/window';

const NEWSLETTER_ID = Constants.NEWSLETTER_ID_FXA_JOURNEY;

describe('views/settings/communication_preferences', function () {
  var account;
  var emailPrefsModel;
  var metrics;
  var notifier;
  var preferencesUrl = 'https://marketing.preferences.com/user/user-token';
  var relier;
  var user;
  var view;
  var translator;
  var windowMock;

  function render() {
    return view.render()
      .then(() => view.afterVisible());
  }

  beforeEach(function () {
    user = new User();
    relier = new Relier();
    account = new Account();
    notifier = new Notifier();
    metrics = new Metrics({ notifier, sentryMetrics: new SentryMetrics() });
    translator = new Translator({forceEnglish: true});
    windowMock = new WindowMock();

    emailPrefsModel = new MarketingEmailPrefs({
      newsletters: [ NEWSLETTER_ID ],
      preferencesUrl: preferencesUrl
    }, {
      account: account
    });

    sinon.stub(user, 'getAccountByUid').callsFake(function () {
      return new Account();
    });

    sinon.stub(emailPrefsModel, 'fetch').callsFake(function () {
      return Promise.resolve();
    });

    sinon.stub(emailPrefsModel, 'destroy').callsFake(function () {
      return Promise.resolve();
    });

    sinon.stub(account, 'getMarketingEmailPrefs').callsFake(function () {
      return emailPrefsModel;
    });

    view = new View({
      metrics,
      notifier,
      relier,
      translator,
      user,
      window: windowMock
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(function () {
      return account;
    });

    sinon.stub(view, 'checkAuthorization').callsFake(function () {
      return Promise.resolve(true);
    });

    sinon.stub(view, 'logFlowEvent').callsFake(() => {});

    return render();
  });

  afterEach(function () {
    $(view.el).remove();
    view.destroy();
    view = null;
  });

  describe('render', function () {
    it('adds the `basket-ready` class to the `#communications-preferences` element', function () {
      assert.lengthOf(view.$('#communication-preferences.basket-ready'), 1);
    });

    it('renders opted-in user correctly', function () {
      sinon.stub(emailPrefsModel, 'isOptedIn').callsFake(function () {
        return true;
      });

      return render()
        .then(function () {
          assert.lengthOf(view.$('#marketing-email-manage'), 1);
          assert.lengthOf(view.$('#marketing-email-done'), 1);
        });
    });

    it('renders not opted-in user correctly', function () {
      sinon.stub(emailPrefsModel, 'isOptedIn').callsFake(function () {
        return false;
      });

      return render()
        .then(function () {
          assert.isTrue(emailPrefsModel.isOptedIn.calledWith(NEWSLETTER_ID));
          assert.lengthOf(view.$('#marketing-email-optin'), 1);
          assert.lengthOf(view.$('#marketing-email-cancel'), 1);
        });
    });

    it('shows any other fetch errors', function () {
      emailPrefsModel.fetch.restore();
      sinon.stub(emailPrefsModel, 'fetch').callsFake(function () {
        return Promise.reject(MarketingEmailErrors.toError('USAGE_ERROR'));
      });

      return render()
        .then(function () {
          assert.ok(view.$('.error').text().length);
        });
    });

    it('correctly handles http 4xx errors as service unavailable', function () {
      emailPrefsModel.fetch.restore();
      sinon.stub(emailPrefsModel, 'fetch').callsFake(function () {
        var err = MarketingEmailErrors.toError('UNKNOWN_ERROR');
        err.code = 400;
        return Promise.reject(err);
      });

      return render()
        .then(function () {
          assert.equal(view.$('.error').text().trim(),
            MarketingEmailErrors.toMessage('SERVICE_UNAVAILABLE'));
          assert.isTrue(TestHelpers.isEventLogged(metrics,
            'error.settings.communication-preferences.basket-errors.99.400'));
        });
    });

    it('correctly handles http 5xx errors as service unavailable', function () {
      emailPrefsModel.fetch.restore();
      sinon.stub(emailPrefsModel, 'fetch').callsFake(function () {
        var err = MarketingEmailErrors.toError('UNKNOWN_ERROR');
        err.code = 500;
        return Promise.reject(err);
      });

      return render()
        .then(function () {
          assert.equal(view.$('.error').text().trim(),
            MarketingEmailErrors.toMessage('SERVICE_UNAVAILABLE'));
          assert.isTrue(TestHelpers.isEventLogged(metrics,
            'error.settings.communication-preferences.basket-errors.99.500'));
        });
    });
  });

  describe('submit', function () {
    it('calls optIn', function () {
      sinon.stub(view, '_optIn').callsFake(() => Promise.resolve());

      return view.submit()
        .then(() => {
          assert.isTrue(view._optIn.calledOnce);
        });
    });
  });

  describe('_optIn', function () {
    it('emits a subscribed event, displays a success message when complete', function () {
      sinon.stub(view, 'navigate').callsFake(() => {});
      sinon.stub(view, 'displaySuccess').callsFake(() => {});

      return view._optIn()
        .then(() => {
          assert.equal(view.logFlowEvent.callCount, 1);
          const args = view.logFlowEvent.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0], 'newsletter.subscribed');
        });
    });
  });

  describe('_openManagePage', () => {
    it('logs the expected events, opens the expected page', () => {
      const BASKET_URL = 'https://basket.mozilla.org/manage';
      sinon.spy(windowMock, 'open');
      sinon.stub(view, 'getMarketingEmailPrefs').callsFake(() => {
        return {
          get: () => BASKET_URL
        };
      });

      view._openManagePage();

      assert.isTrue(windowMock.open.called);
      assert.isTrue(windowMock.open.calledWith(BASKET_URL, '_blank'));

      assert.equal(view.logFlowEvent.callCount, 1);
      const args = view.logFlowEvent.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'newsletter.manage');
    });

    it('correctly handles no `preferencesUrl` as service unavailable', () => {
      sinon.stub(view, 'getMarketingEmailPrefs').callsFake(() => {
        return {
          get: () => undefined
        };
      });

      view._openManagePage();

      assert.equal(view.$('.error').text().trim(), MarketingEmailErrors.toMessage('ACCOUNT_PREFS_NOT_FOUND'));
      assert.isTrue(TestHelpers.isEventLogged(metrics, 'error.settings.communication-preferences.basket-errors.13'));
    });
  });
});
