/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Mix into views that show the "Looking for Firefox Sync? Get started here"
 * helper tooltip.
 *
 * Sets the context field `syncSuggestionHTML`
 * which contains the HTML to display.
 */

import Constants from '../../lib/constants';
import FlowEventsMixin from './flow-events-mixin';
import required from '../../lib/required';
import SyncAuthMixin from './sync-auth-mixin';
import SyncSuggestionTemplate from 'templates/partial/sync-suggestion.mustache';

/**
 * Create the mixin
 *
 * @param {Object} config
 *   @param {String} config.entrypoint
 *   @param {String} config.flowEvent
 * @returns {Function}
 */
export default function (config) {
  required(config.entrypoint, 'entrypoint');
  required(config.flowEvent, 'flowEvent');

  return {
    dependsOn: [FlowEventsMixin, SyncAuthMixin],

    events: {
      'click #suggest-sync .dismiss': 'onSuggestSyncDismiss',
    },

    afterVisible() {
      if (this.isSyncSuggestionEnabled()) {
        this.logViewEvent('sync-suggest.visible');
      }
    },

    setInitialContext(context) {
      let escapedSyncSuggestionUrl;
      if (this.isSyncAuthSupported()) {
        escapedSyncSuggestionUrl = this.getEscapedSyncUrl(
          '',
          config.entrypoint,
          { action: 'email' }
        );
      } else {
        escapedSyncSuggestionUrl = encodeURI(
          Constants.MOZ_ORG_SYNC_GET_STARTED_LINK
        );
      }

      const escapedSyncSuggestionAttrs = `data-flow-event="${config.flowEvent}" href="${escapedSyncSuggestionUrl}"`;

      const syncSuggestionHTML = this.renderTemplate(SyncSuggestionTemplate, {
        escapedSyncSuggestionAttrs,
        showSyncSuggestion: this.isSyncSuggestionEnabled(),
      });

      context.set({
        syncSuggestionHTML,
      });
    },

    /**
     * Is the Sync suggestion enabled for this integration?
     *
     * @returns {Boolean}
     */
    isSyncSuggestionEnabled() {
      return (
        !this.relier.get('service') &&
        this.relier.get('context') === 'web' &&
        // issue #6121 - skip sync suggestion if headed to subscription product page
        !this.relier.get('subscriptionProductId')
      );
    },

    onSuggestSyncDismiss() {
      this.$('#suggest-sync').hide();
    },
  };
}
