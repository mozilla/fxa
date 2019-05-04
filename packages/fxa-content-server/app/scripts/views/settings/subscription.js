/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import Cocktail from 'cocktail';
import FormView from '../form';
import PostMessageReceiver from '../../lib/channels/receivers/postmessage';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import Template from 'templates/settings/subscription.mustache';
import Xss from '../../lib/xss';

class SubscriptionView extends FormView {
  template = Template;
  className = 'subscription';
  viewName = 'settings.subscription';

  initialize (options = {}) {
    this._config = {};
    if (options.config && options.config.subscriptions) {
      this._config = options.config.subscriptions;
    }

    this._postMessageReceiver = new PostMessageReceiver();
    this._postMessageReceiver.initialize({
      origins: [this._config.managementUrl],
      window: this.window
    });

    this.listenTo(this._postMessageReceiver, 'message', this.dispatchMessage);
  }

  beforeDestroy () {
    this._postMessageReceiver.teardown();
  }

  dispatchMessage(eventData) {
    switch (eventData.message) {
    case 'hello':
      return this.sendAccessToken();
    default:
      console.log('unexpected message', eventData.message);
    }
  }

  sendAccessToken () {
    const {
      managementClientId,
      managementScopes,
      managementUrl,
      managementTokenTTL,
    } = this._config;

    return this.getSignedInAccount()
      .createOAuthToken(managementScopes, {
        client_id: managementClientId, //eslint-disable-line camelcase
        ttl: managementTokenTTL,
      })
      .then((accessToken) => {
        this.subscriptionWindow.postMessage({
          accessToken: accessToken.get('token'),
          message: 'accessToken',
        }, managementUrl);
      });
  }

  openPanel () {
    this.render();
  }

  setInitialContext (context) {
    super.setInitialContext(context);

    context.set({
      escapedManagementUrl: Xss.href(this._config.managementUrl),
      isPanelOpen: this.isPanelOpen(),
    });
  }

  get subscriptionWindow () {
    return this.$('#payments-frame').get('0').contentWindow;
  }
}

Cocktail.mixin(SubscriptionView, SettingsPanelMixin);

export default SubscriptionView;
