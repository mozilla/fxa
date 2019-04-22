/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import Cocktail from 'cocktail';
import FormView from '../form';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import Template from 'templates/settings/subscription.mustache';

// FIXME: should be from configuration:
const allowedLanguages = ['en-US'];
const SUBSCRIPTION_SCOPE = 'profile:email profile:subscriptions https://identity.mozilla.com/account/subscriptions';

const View = FormView.extend({
  template: Template,
  className: 'subscription',
  viewName: 'settings.subscription',

  events: {
    'click button': 'submit',
  },

  initialize (options = {}) {
    this._subscriptionUrl = options.config.subscriptionUrl;
  },

  beforeRender () {
    if (! this.supportSubscription()) {
      this.remove();
    }
  },

  submit () {
    const account = this.user.getSignedInAccount();
    account.createOAuthToken(SUBSCRIPTION_SCOPE).then((accessToken) => {
      const url = `${this._subscriptionUrl}/#accessToken=${encodeURIComponent(accessToken.get('token'))}`;
      this.navigateAway(url);
    });
  },

  supportSubscription () {
    // FIXME: if the user is a paying user, then this should always return true
    // FIXME: this should also be enabled or disabled via some feature flag
    // FIXME: this should also be enabled or disabled via some config flag
    const browserLanguages = navigator.languages || [];
    for (const lang of browserLanguages) {
      if (allowedLanguages.includes(lang)) {
        return true;
      }
    }
    return false;
  },

});

Cocktail.mixin(View, SettingsPanelMixin);

export default View;
