/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

module.exports = (config, Settings, log) => {

  class AllowedPhoneNumbers extends Settings {
    constructor(phoneNumbers) {
      super('allowedPhoneNumbers')
      this.setAll(phoneNumbers)
    }

    isAllowed(phoneNumber) {
      return phoneNumber in this.phoneNumbers
    }

    setAll(phoneNumbers) {
      this.phoneNumbers = {}
      phoneNumbers.forEach((phoneNumber) => {
        this.phoneNumbers[phoneNumber] = true
      })
      return Object.keys(this.phoneNumbers)
    }

    validate(phoneNumbers) {
      if (!Array.isArray(phoneNumbers)) {
        log.error({ op: 'allowedPhoneNumbers.validate.invalid', data: phoneNumbers })
        throw new Settings.Missing('invalid allowedPhoneNumbers from memcache')
      }
      return phoneNumbers
    }

    toJSON() {
      return Object.keys(this.phoneNumbers)
    }
  }

  return new AllowedPhoneNumbers(config.allowedPhoneNumbers || [])
}
