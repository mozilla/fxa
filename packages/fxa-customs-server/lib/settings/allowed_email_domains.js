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
      if (! Array.isArray(domains)) {
        log.error({
          op: 'allowedEmailDomains.validate.invalid',
          data: domains,
        });
        throw new Settings.Missing('invalid allowedEmailDomains from memcache');
      }
      return domains;
    }

    toJSON() {
      return Object.keys(this.domains);
    }
  }

  return new AllowedEmailDomains(config.allowedEmailDomains || []);
};
