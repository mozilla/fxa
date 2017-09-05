/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const Account = require('models/account');
  const chai = require('chai');
  const Constants = require('lib/constants');
  const MarketingEmailErrors = require('lib/marketing-email-errors');
  const MarketingEmailPrefs = require('models/marketing-email-prefs');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const SentryMetrics = require('lib/sentry');
  const sinon = require('sinon');
  const Translator = require('lib/translator');
  const TestHelpers = require('../../../lib/helpers');
  const User = require('models/user');
  const View = require('views/settings/communication_preferences');

  var assert = chai.assert;
  var NEWSLETTER_ID = Constants.MARKETING_EMAIL_NEWSLETTER_ID;

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

    function render() {
      return view.render()
        .then(function () {
          $('#container').html(view.el);
          return view.afterVisible();
        });
    }

    beforeEach(function () {
      user = new User();
      relier = new Relier();
      account = new Account();
      notifier = new Notifier();
      metrics = new Metrics({ notifier, sentryMetrics: new SentryMetrics() });
      translator = new Translator({forceEnglish: true});

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
        return p();
      });

      sinon.stub(emailPrefsModel, 'destroy').callsFake(function () {
        return p();
      });

      sinon.stub(account, 'getMarketingEmailPrefs').callsFake(function () {
        return emailPrefsModel;
      });

      view = new View({
        metrics,
        notifier,
        relier,
        translator,
        user
      });

      sinon.stub(view, 'getSignedInAccount').callsFake(function () {
        return account;
      });

      sinon.stub(view, 'checkAuthorization').callsFake(function () {
        return p(true);
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
            assert.include(view.$('#marketing-email-optin').text(), 'Unsubscribe');
            assert.equal(view.$('#preferences-url').attr('href'), preferencesUrl);
          });
      });

      it('renders not opted-in user correctly', function () {
        sinon.stub(emailPrefsModel, 'isOptedIn').callsFake(function () {
          return false;
        });

        return render()
          .then(function () {
            assert.isTrue(emailPrefsModel.isOptedIn.calledWith(NEWSLETTER_ID));
            assert.include(view.$('#marketing-email-optin').text(), 'Subscribe');
          });
      });

      it('does not render the preferencesUrl if the user is not registered with Basket', function () {
        emailPrefsModel.fetch.restore();

        emailPrefsModel.unset('preferencesUrl');
        emailPrefsModel.set('newsletters', []);

        sinon.stub(emailPrefsModel, 'fetch').callsFake(function () {
          return p.reject(MarketingEmailErrors.toError('UNKNOWN_EMAIL'));
        });

        return render()
          .then(function () {
            assert.equal(view.$('#preferences-url').length, 0);
          });
      });

      it('shows any other fetch errors', function () {
        emailPrefsModel.fetch.restore();
        sinon.stub(emailPrefsModel, 'fetch').callsFake(function () {
          return p.reject(MarketingEmailErrors.toError('USAGE_ERROR'));
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
          return p.reject(err);
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
          return p.reject(err);
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
      it('calls setOptInStatus', function () {
        sinon.stub(view, 'setOptInStatus').callsFake(function () {
          return p();
        });

        return view.submit()
          .then(function () {
            assert.isTrue(view.setOptInStatus.calledWith(NEWSLETTER_ID, false));
          });
      });
    });

    describe('setOptInStatus', function () {
      it('displays a success message when complete', function () {
        sinon.stub(emailPrefsModel, 'optOut').callsFake(function () {
          return p();
        });
        sinon.stub(view, 'navigate').callsFake(function () { });
        sinon.stub(view, 'displaySuccess').callsFake(function () { });

        return view.setOptInStatus(NEWSLETTER_ID, false)
          .then(function () {
            assert.isTrue(view.navigate.calledWith('settings'));
            assert.isTrue(view.displaySuccess.called);

            assert.equal(view.logFlowEvent.callCount, 1);
            const args = view.logFlowEvent.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'newsletter.unsubscribed');
          });
      });

      it('emits the subscribed event', () => {
        sinon.stub(emailPrefsModel, 'optOut').callsFake(() => {
          return p();
        });
        sinon.stub(view, 'navigate').callsFake(() => {});
        sinon.stub(view, 'displaySuccess').callsFake(() => {});

        return view.setOptInStatus(NEWSLETTER_ID, true)
          .then(() => {
            assert.equal(view.logFlowEvent.callCount, 1);
            const args = view.logFlowEvent.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], 'newsletter.subscribed');
          });
      });

      it('shows `Please try again later` for 429 (rate-limited) error', function () {
        sinon.stub(emailPrefsModel, 'optOut').callsFake(function () {
          return p.reject(MarketingEmailErrors.toError('USAGE_ERROR'));
        });

        return view.setOptInStatus(NEWSLETTER_ID, false)
          .then(function () {
            assert.isTrue(view.isErrorVisible());
            assert.equal($('.error').text(), 'Please try again later');
          });
      });

      it('other errors are displayed', function () {
        sinon.stub(emailPrefsModel, 'optOut').callsFake(function () {
          return p.reject(MarketingEmailErrors.toError('UNEXPECTED_ERROR'));
        });

        return view.setOptInStatus(NEWSLETTER_ID, false)
          .then(function () {
            assert.isTrue(view.isErrorVisible());
          });
      });
    });
  });
});
