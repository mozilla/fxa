/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const _ = require('lodash');
const validationTypes = require('../validation').TYPES;

const ADJUST_CHANNEL_APP_ID = validationTypes.ADJUST_CHANNEL_APP_ID;
const SIGNIN_CODE = validationTypes.SIGNIN_CODE;

module.exports = function(config) {
  const channels = config.get('sms.redirect.channels');
  const targetURITemplate = _.template(
    config.get('sms.redirect.targetURITemplate')
  );

  return {
    method: 'get',
    path: '/m/:signinCode',
    validate: {
      params: {
        signinCode: SIGNIN_CODE,
      },
      query: {
        // Allows the caller to specify which Firefox release
        // channel should be installed.
        channel: ADJUST_CHANNEL_APP_ID,
      },
    },
    process: function(req, res) {
      const channelName = req.query.channel || 'release';
      const channel = channels[channelName];
      const signinCode = req.params.signinCode;
      // channel and signinCode are already URL safe if they have validated correctly,
      // so encodeURIComponent is not called.
      const targetUrl = targetURITemplate({
        channel,
        signinCode,
      });
      res.redirect(302, targetUrl);
    },
  };
};
