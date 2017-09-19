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

define((require, exports, module) => {
  'use strict';

  const Constants = require('../../lib/constants');
  const FlowEventsMixin = require('./flow-events-mixin');
  const SyncAuthMixin = require('./sync-auth-mixin');
  const SyncSuggestionTemplate = require('stache!templates/partial/sync-suggestion');

  function required (name, opts) {
    if (! (name in opts)) {
      throw new Error(`${name} is required`);
    }
  }

  /**
   * Create the mixin
   *
   * @param {Object} config
   *   @param {String} config.entrypoint
   *   @param {String} config.flowEvent
   *   @param {String} config.pathname
   * @returns {Function}
   */
  module.exports = function (config) {
    required('entrypoint', config);
    required('flowEvent', config);
    required('pathname', config);

    return {
      dependsOn: [ FlowEventsMixin, SyncAuthMixin ],

      events: {
        'click #suggest-sync .dismiss': 'onSuggestSyncDismiss'
      },


      afterVisible () {
        if (this.isSyncSuggestionEnabled()) {
          this.logViewEvent('sync-suggest.visible');
        }
      },

      setInitialContext (context) {
        let escapedSyncSuggestionUrl;
        if (this.isSyncAuthSupported()) {
          escapedSyncSuggestionUrl = this.getEscapedSyncUrl(config.pathname, config.entrypoint);
        } else {
          escapedSyncSuggestionUrl = encodeURI(Constants.MOZ_ORG_SYNC_GET_STARTED_LINK);
        }

        const escapedSyncSuggestionAttrs = `data-flow-event="${config.flowEvent}" href="${escapedSyncSuggestionUrl}"`;

        const syncSuggestionHTML = this.renderTemplate(SyncSuggestionTemplate, {
          escapedSyncSuggestionAttrs,
          showSyncSuggestion: this.isSyncSuggestionEnabled()
        });

        context.set({
          syncSuggestionHTML
        });
      },

      /**
       * Is the Sync suggestion enabled for this integration?
       *
       * @returns {Boolean}
       */
      isSyncSuggestionEnabled () {
        return ! this.relier.get('service');
      },

      onSuggestSyncDismiss () {
        this.$('#suggest-sync').hide();
      },
    };
  };
});
