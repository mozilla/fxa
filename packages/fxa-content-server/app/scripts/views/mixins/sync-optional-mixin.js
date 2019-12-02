/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * View mixin to handle the Do Not Sync button in views.
 *
 * @mixin DoNotSync mixin
 */
import FlowEventsMixin from './flow-events-mixin';
import preventDefaultThen from '../decorators/prevent_default_then';

export default {
  dependsOn: [FlowEventsMixin],

  events: {
    'click #do-not-sync-device': preventDefaultThen('doNotSync'),
  },

  doNotSync() {
    this.disableSync();
    return Promise.resolve().then(() => {
      const account = this.getAccount();
      return this.onSubmitComplete(account);
    });
  },

  /**
   * Mark that the user opted to disable Sync. Used
   * to prevent sending the list of displayed/disabled
   * Sync buckets to the browser with the login message.
   */
  disableSync() {
    this.relier.set('syncPreference', false);
    this.logFlowEvent('cwts_do_not_sync', this.viewName);
  },

  /**
   * Mark that the user opted to enable Sync. Used
   * to send the list of displayed/disabled
   * Sync buckets to the browser with the login message.
   */
  enableSync() {
    this.relier.set('syncPreference', true);
  },
};
