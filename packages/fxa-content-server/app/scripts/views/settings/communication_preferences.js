/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'lib/xss',
  'lib/constants',
  'lib/marketing-email-errors',
  'lib/metrics',
  'views/base',
  'views/form',
  'views/mixins/back-mixin',
  'views/mixins/settings-mixin',
  'views/mixins/settings-panel-mixin',
  'views/mixins/checkbox-mixin',
  'stache!templates/settings/communication_preferences'
],
function (Cocktail, Xss, Constants, MarketingEmailErrors, Metrics, BaseView, FormView,
  BackMixin, SettingsMixin, SettingsPanelMixin, CheckboxMixin, Template) {
  'use strict';

  var NEWSLETTER_ID = Constants.MARKETING_EMAIL_NEWSLETTER_ID;
  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'communication-preferences',

    getMarketingEmailPrefs: function () {
      var self = this;
      if (! self._marketingEmailPrefs) {
        self._marketingEmailPrefs =
            self.getSignedInAccount().getMarketingEmailPrefs();
      }

      return self._marketingEmailPrefs;
    },

    beforeRender: function () {
      var self = this;
      var emailPrefs = self.getMarketingEmailPrefs();
      return emailPrefs.fetch()
        .fail(function (err) {
          if (MarketingEmailErrors.is(err, 'UNKNOWN_EMAIL')) {
            // user has not yet opted in to Basket yet. Ignore.
            return;
          }
          if (MarketingEmailErrors.is(err, 'UNKNOWN_ERROR')) {
            self._error = self.translateError(MarketingEmailErrors.toError('SERVICE_UNAVAILABLE'));
          } else {
            self._error = self.translateError(err);
          }
          err = self._normalizeError(err);
          var errorString = Metrics.prototype.errorToId(err);
          err.code = err.code || 'unknown';
          // Add status code to metrics data, to differentiate between
          // 400 and 500
          errorString = errorString + '.' + err.code;
          self.logEvent(errorString);
        });
    },

    context: function () {
      var self = this;
      var emailPrefs = this.getMarketingEmailPrefs();
      var isOptedIn = emailPrefs.isOptedIn(NEWSLETTER_ID);
      self.logScreenEvent('newsletter.optin.' + String(isOptedIn));

      return {
        isOptedIn: isOptedIn,
        // preferencesURL is only available if the user is already
        // registered with basket.
        preferencesUrl: Xss.href(emailPrefs.get('preferencesUrl')),
        error: self._error
      };
    },

    submit: function () {
      var self = this;
      var emailPrefs = self.getMarketingEmailPrefs();
      return self.setOptInStatus(NEWSLETTER_ID, ! emailPrefs.isOptedIn(NEWSLETTER_ID));
    },

    setOptInStatus: function (newsletterId, isOptedIn) {
      var self = this;

      var method = isOptedIn ? 'optIn' : 'optOut';
      self.logScreenEvent(method);

      return self.getMarketingEmailPrefs()[method](newsletterId)
        .then(function () {
          self.logScreenEvent(method + '.success');

          var successMessage = isOptedIn ?
                                  t('Subscribed successfully') :
                                  t('Unsubscribed successfully');

          self.displaySuccess(successMessage);
          self.navigate('settings');
          return self.render();
        }, function (err) {
          self.displayError(err);
        });
    }
  });

  Cocktail.mixin(
    View,
    BackMixin,
    CheckboxMixin,
    SettingsMixin,
    SettingsPanelMixin
  );

  return View;
});

