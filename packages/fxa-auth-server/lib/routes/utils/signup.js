/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const userAgent = require('../../userAgent');
const ScopeSet = require('fxa-shared').oauth.scopes;
const { OAUTH_SCOPE_OLD_SYNC } = require('../../constants');
const NOTIFICATION_SCOPES = ScopeSet.fromArray([OAUTH_SCOPE_OLD_SYNC]);

module.exports = (log, db, mailer, push, verificationReminders) => {
  return {
    /**
     * Verify the account with the specified options. This function takes
     * care of verifying the account, emitting metrics, sending emails and
     * notifying other devices.
     */
    verifyAccount: async (request, account, options) => {
      const { uid } = account;
      const { newsletters, service, reminder, style, scopes } = options;
      await db.verifyEmail(account, account.primaryEmail.emailCode);

      const geoData = request.app.geo;
      const country = geoData.location && geoData.location.country;
      const countryCode = geoData.location && geoData.location.countryCode;
      const {
        deviceId,
        flowId,
        flowBeginTime,
        productId,
        planId,
      } = await request.app.metricsContext;

      await Promise.all([
        log.notifyAttachedServices('verified', request, {
          country,
          countryCode,
          email: account.primaryEmail.email,
          locale: account.locale,
          newsletters,
          service,
          uid,
          userAgent: request.headers['user-agent'],
        }),
        request.emitMetricsEvent('account.verified', {
          deviceId,
          flowId,
          flowBeginTime,
          newsletters,
          productId,
          planId,
          uid,
        }),

        // Verification reminders can *only* be used in email links. We currently don't
        // support them for email codes.
        reminder
          ? request.emitMetricsEvent(`account.reminder.${reminder}`, { uid })
          : null,
        verificationReminders.delete(uid),
      ]);

      // Send a push notification to all devices that the account changed
      request.app.devices.then((devices) =>
        push.notifyAccountUpdated(uid, devices, 'accountVerify')
      );

      // Our post-verification email is very specific to sync,
      // so only send it if we're sure this is for sync or sync scoped client.
      const scopeSet = ScopeSet.fromArray(scopes);
      if (service === 'sync' || scopeSet.intersects(NOTIFICATION_SCOPES)) {
        const onMobileDevice =
          userAgent(request.headers['user-agent']).deviceType === 'mobile';
        const mailOptions = {
          acceptLanguage: request.app.acceptLanguage,
          service: 'sync',
          uid,
          onMobileDevice,
        };

        if (style) {
          mailOptions.style = style;
        }

        return mailer.sendPostVerifyEmail([], account, mailOptions);
      }

      return {};
    },
  };
};
