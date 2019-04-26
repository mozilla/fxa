/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import Cocktail from 'cocktail';
import FormView from '../form';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import Template from 'templates/settings/subscription.mustache';

const View = FormView.extend({
  template: Template,
  className: 'subscription',
  viewName: 'settings.subscription',

  events: {
    'click button': 'submit',
  },

  initialize (options = {}) {
    this._subscriptionUrl = options.config.subscriptionUrl;

    this._featureFlags = Object.assign({}, {
      enableManageButton: false
    }, options.config.featureFlags.subscriptions || {});

    this._config = Object.assign({}, {
      allowedLanguages: ['en-US'],
      enabled: false,
      managementClientId: '98e6508e88680e1a',
      managementScopes: 'profile https://identity.mozilla.com/account/subscriptions',
      managementTokenTTL: 900,
      managementUrl: 'http://127.0.0.1:3031',
    }, options.config.subscriptions || {});
  },

  beforeRender () {
    if (! this.supportSubscription()) {
      this.remove();
    }
  },

  submit () {
    const {
      managementClientId,
      managementScopes,
      managementTokenTTL,
      managementUrl,
    } = this._config;
    const account = this.user.getSignedInAccount();
    account
      .createOAuthToken(managementScopes, {
        client_id: managementClientId, //eslint-disable-line camelcase
        ttl: managementTokenTTL,
      })
      .then((accessToken) => {
        const url = `${managementUrl}/#accessToken=${encodeURIComponent(accessToken.get('token'))}`;
        this.navigateAway(url);
      });
  },

  supportSubscription () {
    const { enabled, allowedLanguages } = this._config;
    const { enableManageButton } = this._featureFlags;
    if (! enabled || ! enableManageButton) {
      return false;
    }
    const acceptedLanguages = (navigator.languages || [])
      .filter(lang => allowedLanguages.includes(lang));
    if (acceptedLanguages.length === 0) {
      return false;
    }
    return true;
  },

});

Cocktail.mixin(View, SettingsPanelMixin);

export default View;
