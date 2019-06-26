/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const crypto = require('crypto');

module.exports = {
  randomEmail: function() {
    return Math.floor(Math.random() * 10000) + '@email.com';
  },

  randomIp: function() {
    function getSubnet() {
      return Math.floor(Math.random() * 255);
    }

    return [getSubnet(), getSubnet(), getSubnet(), getSubnet()].join('.');
  },

  randomHexString: function(length) {
    if (length === 0) {
      return '';
    }

    return crypto
      .randomBytes(length)
      .toString('hex')
      .slice(0, length);
  },
};
