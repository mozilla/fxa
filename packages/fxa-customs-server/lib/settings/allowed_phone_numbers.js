/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = (config, Settings, log) => {
  class AllowedPhoneNumbers extends Settings {
    constructor(phoneNumbers) {
      super('allowedPhoneNumbers');
      this.setAll(phoneNumbers);
    }

    isAllowed(phoneNumber) {
      return this.phoneNumbers.has(phoneNumber);
    }

    setAll(phoneNumbers) {
      this.phoneNumbers = new Set(phoneNumbers);
      return this.toJSON();
    }

    validate(phoneNumbers) {
      if (!Array.isArray(phoneNumbers)) {
        log.error({
          op: 'allowedPhoneNumbers.validate.invalid',
          data: phoneNumbers,
        });
        throw new Settings.Missing('invalid allowedPhoneNumbers from memcache');
      }
      return phoneNumbers;
    }

    toJSON() {
      return Array.from(this.phoneNumbers);
    }
  }

  return new AllowedPhoneNumbers(config.allowedPhoneNumbers || []);
};
