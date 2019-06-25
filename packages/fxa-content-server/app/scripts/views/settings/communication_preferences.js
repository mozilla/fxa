/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import FlowEventsMixin from '../mixins/flow-events-mixin';
import FormView from '../form';
import Template from 'templates/settings/communication_preferences.mustache';
import Url from '../../lib/url';

export default class CommunicationPreferencesView extends FormView {
  template = Template;
  className = 'communication-preferences';
  viewName = 'settings.communication-preferences';

  initialize(options = {}) {
    this.marketingEmailPreferencesUrl =
      options.config && options.config.marketingEmailPreferencesUrl;
  }

  _getEscapedEmailPreferencesLink() {
    const account = this.getSignedInAccount();
    // Url.updateSearchString escapes the query parameters
    return Url.updateSearchString(
      this.marketingEmailPreferencesUrl,
      account.pick('email')
    );
  }

  setInitialContext(context) {
    const escapedEmailPreferencesLink = this._getEscapedEmailPreferencesLink();
    context.set({
      escapedEmailPreferencesLink,
    });
  }
}

Cocktail.mixin(CommunicationPreferencesView, FlowEventsMixin);
