/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const Constants = require('lib/constants');
  const FlowEventsMixin = require('views/mixins/flow-events-mixin');
  const FormView = require('views/form');
  const MarketingEmailErrors = require('lib/marketing-email-errors');
  const Metrics = require('lib/metrics');
  const SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  const Template = require('stache!templates/settings/communication_preferences');
  const Xss = require('lib/xss');

  var NEWSLETTER_ID = Constants.MARKETING_EMAIL_NEWSLETTER_ID;
  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'communication-preferences',
    viewName: 'settings.communication-preferences',

    getMarketingEmailPrefs () {
      if (! this._marketingEmailPrefs) {
        this._marketingEmailPrefs =
            this.getSignedInAccount().getMarketingEmailPrefs();
      }

      return this._marketingEmailPrefs;
    },

    // The view is rendered twice to avoid delaying the settings page load.
    // The first render is done without querying Basket for the user's email
    // opt-in status. The second is after Basket is queried. Selenium tests
    // should do their business after the second render. _isBasketReady is
    // used to add a class to the #communication-preferences element that
    // Selenium can proceed. See #3357 and #3061
    _isBasketReady: false,

    afterVisible () {
      var emailPrefs = this.getMarketingEmailPrefs();

      // the email prefs fetch is done in afterVisible instead of a render
      // function so that the settings page render is not blocked while waiting
      // for Basket to respond.  See #3061
      return emailPrefs.fetch()
        .fail((err) => {
          if (MarketingEmailErrors.is(err, 'UNKNOWN_EMAIL')) {
            // user has not yet opted in to Basket yet. Ignore
            return;
          }
          if (MarketingEmailErrors.is(err, 'UNKNOWN_ERROR')) {
            this._error = this.translateError(MarketingEmailErrors.toError('SERVICE_UNAVAILABLE'));
          } else {
            this._error = this.translateError(err);
          }
          err = this._normalizeError(err);
          var errorString = Metrics.prototype.errorToId(err);
          err.code = err.code || 'unknown';
          // Add status code to metrics data, to differentiate between
          // 400 and 500
          errorString = errorString + '.' + err.code;
          this.logEvent(errorString);
        })
        .then(() => {
          this._isBasketReady = true;
          return this.render();
        });
    },

    setInitialContext (context) {
      var emailPrefs = this.getMarketingEmailPrefs();
      var isOptedIn = emailPrefs.isOptedIn(NEWSLETTER_ID);
      this.logViewEvent('newsletter.optin.' + String(isOptedIn));

      context.set({
        error: this._error,
        isBasketReady: !! this._isBasketReady,
        isOptedIn: isOptedIn,
        isPanelOpen: this.isPanelOpen(),
        // preferencesURL is only available if the user is already
        // registered with basket.
        preferencesUrl: Xss.href(emailPrefs.get('preferencesUrl'))
      });
    },

    submit () {
      var emailPrefs = this.getMarketingEmailPrefs();
      return this.setOptInStatus(NEWSLETTER_ID, ! emailPrefs.isOptedIn(NEWSLETTER_ID));
    },

    setOptInStatus (newsletterId, isOptedIn) {
      let eventPrefix;
      let method;

      if (isOptedIn) {
        eventPrefix = '';
        method = 'optIn';
      } else {
        eventPrefix = 'un';
        method = 'optOut';
      }

      this.logViewEvent(method);

      return this.getMarketingEmailPrefs()[method](newsletterId)
        .then(() => {
          this.logViewEvent(method + '.success');
          // Emit an additional flow event for consistency with
          // the call to optIn in the account model
          this.logFlowEvent(`newsletter.${eventPrefix}subscribed`);

          var successMessage = isOptedIn ?
                                  t('Subscribed successfully') :
                                  t('Unsubscribed successfully');

          this.displaySuccess(successMessage);
          this.navigate('settings');
          return this.render();
        }, (err) => this.displayError(err));
    }
  });

  Cocktail.mixin(
    View,
    SettingsPanelMixin,
    FlowEventsMixin
  );

  module.exports = View;
});

