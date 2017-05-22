/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const SIGNIN_CODE = require('../validation').TYPES.SIGNIN_CODE;

module.exports = function (config) {
  const targetUrl = config.get('sms.redirect.targetLink');

  return {
    method: 'get',
    path: '/m/:signinCode',
    validate: {
      params: {
        signinCode: SIGNIN_CODE
      }
    },
    process: function (req, res) {
      // The signinCode is already URL safe if it has validated correctly,
      // so encodeURIComponent is not called.
      res.redirect(302, `${targetUrl}&signin=${req.params.signinCode}`);
    }
  };
};
