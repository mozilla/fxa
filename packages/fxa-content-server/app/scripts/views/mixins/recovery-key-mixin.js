/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Mixin to support common methods on a recovery key.
 *
 * @mixin RecoveryKeyMixin
 */
const t = (msg) => msg;

const Mixin = {
  formatRecoveryKey(key) {
    if (key) {
      // Insert spaces every 4 characters and remove trailing space
      return key.replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/, '');
    }
  },

  getFormatedRecoveryKeyFilename() {
    const account = this.getSignedInAccount();
    let formattedFilename =
      account.get('email') + ' ' + t('Firefox Recovery Key');
    if (formattedFilename.length > 200) {
      // 200 bytes (close to filesystem max) - 4 for '.txt' extension
      formattedFilename = formattedFilename.substring(0, 196);
    }
    return `${formattedFilename}.txt`;
  },
};

export default Mixin;
