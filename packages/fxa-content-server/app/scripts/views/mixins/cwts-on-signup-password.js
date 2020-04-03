/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Adds CWTS functionality to the signup_password page. Much
 * of this is extracted from views/choose_what_to_sync.js.
 *
 * This was created as a mixin rather than added directly to the
 * view so that if the experiment is unsuccessful, it can easily
 * be removed. Or, if the experiment is successful, then the
 * mixin can be converted to general functionality to share
 * with choose_what_to_sync.js which won't go away.
 */
import SyncOptionalMixin from './sync-optional-mixin';

export default {
  dependsOn: [SyncOptionalMixin],

  setInitialContext(context) {
    if (this.isCWTSOnSignupPasswordEnabled()) {
      context.set({
        engines: this._getOfferedEngines(),
        isCWTSOnSignupPasswordEnabled: true,
      });
    }
  },

  isCWTSOnSignupPasswordEnabled() {
    if (!this.relier.isSync() || !this.relier.get('multiService')) {
      // if not sync or not multi service, no possibility of enabling
      // Sync, get outta here.
      return false;
    }
    return true;
  },

  /**
   * Get a list of displayed Sync engine configs that can be used
   * for display.
   *
   * @returns {Object[]}
   */
  _getOfferedEngines() {
    return this.broker
      .get('chooseWhatToSyncWebV1Engines')
      .toJSON()
      .map((syncEngine, index) => {
        const engineWithTabIndex = Object.create(syncEngine);
        engineWithTabIndex.tabindex = (index + 1) * 5;
        engineWithTabIndex.text = this.translate(engineWithTabIndex.text, {});
        return engineWithTabIndex;
      });
  },

  /**
   * Get a list of engineIds that are displayed to the user.
   *
   * @returns {String[]}
   */
  _getOfferedEngineIds() {
    return this._getOfferedEngines().map(syncEngine => syncEngine.id);
  },

  /**
   * Get sync engines that were declined.
   *
   * @returns {String[]}
   */
  _getDeclinedEngineIds() {
    var uncheckedEngineEls = this.$el
      .find('input[name=sync-content]')
      .not(':checked');

    return uncheckedEngineEls
      .map(function() {
        return this.value;
      })
      .get();
  },

  /**
   * Keep track of what sync engines the user declines
   *
   * @param {String[]} declinedEngineIds
   */
  _trackDeclinedEngineIds(declinedEngineIds) {
    if (Array.isArray(declinedEngineIds)) {
      declinedEngineIds.forEach(engineId => {
        this.logViewEvent(`engine-unchecked.${engineId}`);
      });
    }
  },

  beforeSubmit() {
    if (!this.isCWTSOnSignupPasswordEnabled()) {
      return;
    }

    const offeredSyncEngines = this._getOfferedEngineIds();
    const declinedSyncEngines = this._getDeclinedEngineIds();
    const enabledSyncEngines = offeredSyncEngines.filter(
      e => declinedSyncEngines.indexOf(e) === -1
    );

    // Tell multi-service browser integrations whether to send
    // the offered and declined sync engines.
    if (declinedSyncEngines.length === offeredSyncEngines.length) {
      this.disableSync();
    } else {
      this.enableSync();
    }

    this.getAccount().set({
      declinedSyncEngines,
      offeredSyncEngines,
    });

    this._trackDeclinedEngineIds(declinedSyncEngines);

    this.notifier.trigger('set-sync-engines', enabledSyncEngines);
  },
};
