/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const net = require('net');

module.exports = (config, Settings, log) => {
  class AllowedIPs extends Settings {
    constructor(ips) {
      super('allowedIPs');
      this.setAll(ips);
    }

    isAllowed(ip) {
      return ip in this.ips;
    }

    setAll(ips) {
      this.ips = {};
      for (var i = 0; i < ips.length; i++) {
        this.ips[ips[i]] = true;
      }
      return Object.keys(this.ips);
    }

    validate(ips) {
      if (! Array.isArray(ips)) {
        log.error({ op: 'allowedIPs.validate.invalid', data: ips });
        throw new Settings.Missing('invalid allowedIPs from memcache');
      }
      return ips.filter(function(ip) {
        var is = net.isIPv4(ip);
        if (! is) {
          log.error({ op: 'allowedIPs.validate.err', ip: ip });
        }
        return is;
      });
    }

    toJSON() {
      return Object.keys(this.ips);
    }
  }

  return new AllowedIPs(config.allowedIPs || []);
};
