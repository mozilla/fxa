/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = (config, Settings, log) => {
  class AllowedEmailDomains extends Settings {
    constructor(domains) {
      super('allowedEmailDomains');
      this.setAll(domains);
    }

    isAllowed(email) {
      // Edge case to allow tests to break out of 'isAllowed' mode
      // and temporarily activate customs
      if (email && email.startsWith('enable_customs_')) {
        return false;
      }

      // Allow customs to not block certain email domains. This is
      // useful for testing when customs counts might interfere with
      // tests.
      var match = /^.+@(.+)$/.exec(email);
      return match ? this.domains[match[1]] : false;
    }

    setAll(domains) {
      this.domains = {};
      for (var i = 0; i < domains.length; i++) {
        this.domains[domains[i]] = true;
      }
      return Object.keys(this.domains);
    }

    validate(domains) {
      if (!Array.isArray(domains)) {
        log.error({
          op: 'allowedEmailDomains.validate.invalid',
          data: domains,
        });
        throw new Settings.Missing('invalid allowedEmailDomains from cache');
      }
      return domains;
    }

    toJSON() {
      return Object.keys(this.domains);
    }
  }

  return new AllowedEmailDomains(config.allowedEmailDomains || []);
};
