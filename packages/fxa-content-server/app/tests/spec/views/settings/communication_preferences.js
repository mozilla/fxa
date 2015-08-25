/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'jquery',
  'sinon',
  'views/settings/communication_preferences',
  'models/user',
  'models/account',
  'models/marketing-email-prefs',
  'models/reliers/relier',
  'lib/promise',
  'lib/constants',
  'lib/marketing-email-errors',
  'lib/metrics',
  '../../../lib/helpers'
],
function (chai, $, sinon, View, User, Account, MarketingEmailPrefs, Relier,
  p, Constants, MarketingEmailErrors, Metrics, TestHelpers) {
  'use strict';

  var assert = chai.assert;
  var NEWSLETTER_ID = Constants.MARKETING_EMAIL_NEWSLETTER_ID;

  describe('views/settings/communication_preferences', function () {
    var account;
    var emailPrefsModel;
    var metrics;
    var preferencesUrl = 'https://marketing.preferences.com/user/user-token';
    var relier;
    var user;
    var view;

    function render() {
      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    }

    beforeEach(function () {
      user = new User();
      relier = new Relier();
      account = new Account();
      metrics = new Metrics();

      emailPrefsModel = new MarketingEmailPrefs({
        newsletters: [ NEWSLETTER_ID ],
        preferencesUrl: preferencesUrl
      }, {
        account: account
      });

      sinon.stub(user, 'getAccountByUid', function () {
        return new Account();
      });

      sinon.stub(emailPrefsModel, 'fetch', function () {
        return p();
      });

      sinon.stub(emailPrefsModel, 'destroy', function () {
        return p();
      });

      sinon.stub(account, 'getMarketingEmailPrefs', function () {
        return emailPrefsModel;
      });

      view = new View({
        metrics: metrics,
        relier: relier,
        screenName: 'settings.communication-preferences',
        user: user
      });

      sinon.stub(view, 'getSignedInAccount', function () {
        return account;
      });

      sinon.stub(view, '_checkUserAuthorization', function () {
        return p(true);
      });

      return render();
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
    });

    describe('render', function () {
      it('renders opted-in user corrected', function () {
        sinon.stub(emailPrefsModel, 'isOptedIn', function () {
          return true;
        });

        return render()
          .then(function () {
            assert.include(view.$('#marketing-email-optin').text(), 'Unsubscribe');
            assert.equal(view.$('#preferences-url').attr('href'), preferencesUrl);
          });
      });

      it('renders not opted-in user correctly', function () {
        sinon.stub(emailPrefsModel, 'isOptedIn', function () {
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

        sinon.stub(emailPrefsModel, 'fetch', function () {
          return p.reject(MarketingEmailErrors.toError('UNKNOWN_EMAIL'));
        });

        return render()
          .then(function () {
            assert.equal(view.$('#preferences-url').length, 0);
          });
      });

      it('shows any other fetch errors', function () {
        emailPrefsModel.fetch.restore();
        sinon.stub(emailPrefsModel, 'fetch', function () {
          return p.reject(MarketingEmailErrors.toError('USAGE_ERROR'));
        });

        return render()
          .then(function () {
            assert.ok(view.$('.error').text().length);
          });
      });

      it('correctly handles http 4xx errors as service unavailable', function () {
        emailPrefsModel.fetch.restore();
        sinon.stub(emailPrefsModel, 'fetch', function () {
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
        sinon.stub(emailPrefsModel, 'fetch', function () {
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
        sinon.stub(view, 'setOptInStatus', function () {
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
        sinon.stub(emailPrefsModel, 'optOut', function () {
          return p();
        });
        sinon.stub(view, 'navigate', function () { });
        sinon.stub(view, 'displaySuccess', function () { });

        return view.setOptInStatus(NEWSLETTER_ID, false)
          .then(function () {
            assert.isTrue(view.navigate.calledWith('settings'));
            assert.isTrue(view.displaySuccess.called);
          });
      });

      it('errors are displayed', function () {
        sinon.stub(emailPrefsModel, 'optOut', function () {
          return p.reject(MarketingEmailErrors.toError('USAGE_ERROR'));
        });

        return view.setOptInStatus(NEWSLETTER_ID, false)
          .then(function () {
            assert.isTrue(view.isErrorVisible());
          });
      });
    });
  });
});

