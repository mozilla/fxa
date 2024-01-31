/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Mix into views that show the "Why do I need this account? Find out here"
 * helper tooltip for Pocket accounts. This was based on the sync-suggestion-mixin.js.
 *
 * Sets the context field `accountSuggestionHTML`
 * which contains the HTML to display.
 */

import Constants from '../../lib/constants';
import FlowEventsMixin from './flow-events-mixin';
import AccountSuggestionTemplate from 'templates/partial/account-suggestion.mustache';
import { POCKET_CLIENTIDS } from '../../views/mixins/pocket-migration-mixin';

export default {
  dependsOn: [FlowEventsMixin],

  events: {
    'click #suggest-account .dismiss': 'onSuggestAccountDismiss',
  },

  afterVisible() {
    if (this.isAccountSuggestionEnabled()) {
      this.logViewEvent('account-suggest.visible');
    }
  },

  setInitialContext(context) {
    const escapedSuggestionUrl = encodeURI(Constants.POCKET_MORE_INFO_LINK);

    const escapedSuggestionAttrs = `href="${escapedSuggestionUrl}"`;

    const accountSuggestionHTML = this.renderTemplate(
      AccountSuggestionTemplate,
      {
        escapedSuggestionAttrs,
        showAccountSuggestion: this.isAccountSuggestionEnabled(),
      }
    );

    context.set({
      accountSuggestionHTML,
    });
  },

  /**
   * Show the account suggestion popover only for Pocket clients.
   *
   * @returns {Boolean}
   */
  isAccountSuggestionEnabled() {
    return POCKET_CLIENTIDS.includes(this.relier.get('clientId'));
  },

  onSuggestAccountDismiss() {
    this.$('#suggest-account').hide();
  },
};
