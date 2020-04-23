/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const _ = require('lodash');
const validationTypes = require('../validation').TYPES;
const userAgent = require('../../../../fxa-shared/metrics/user-agent');

const ADJUST_CHANNEL_APP_ID = validationTypes.ADJUST_CHANNEL_APP_ID;
const SIGNIN_CODE = validationTypes.SIGNIN_CODE;

module.exports = function(config) {
  const channels = config.get('sms.redirect.channels');
  const targetURITemplate = _.template(
    config.get('sms.redirect.targetURITemplate')
  );
  const targetURITemplateiOS = _.template(
    config.get('sms.redirect.targetURITemplateiOS')
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
      // channel and signinCode are already URL safe if they have validated correctly,
      // so encodeURIComponent is not called.
      const channel = channels[channelName];
      const signinCode = req.params.signinCode;
      let targetUrl;

      // Attempt to parse the useragent if it exists, for iOS user agents
      // the deeplink url uses the JSR link format.
      // Ref: https://www.adjust.com/blog/dive-into-deeplinking/
      //
      // Android devices don't always seem to load the link using JSR format.
      // Ref: https://github.com/mozilla/fxa/issues/5069
      let isiOS = false;
      if (req.headers && req.headers['user-agent']) {
        const parsedUA = userAgent.parse(req.headers['user-agent']);
        isiOS = parsedUA.os.family === 'iOS';
      }

      if (isiOS) {
        targetUrl = targetURITemplateiOS({
          channel,
          signinCode,
        });
      } else {
        targetUrl = targetURITemplate({
          channel,
          signinCode,
        });
      }

      res.redirect(302, targetUrl);
    },
  };
};
