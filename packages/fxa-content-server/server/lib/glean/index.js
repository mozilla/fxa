/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const serverGleanEvents = require('./server_events');

let appConfig;
let gleanEventLogger;
let gleanServerEventLogger;

module.exports = function (config) {
  appConfig = config;

  gleanEventLogger = serverGleanEvents.createAccountsEventsEvent({
    applicationId: config.serverGleanMetrics.applicationId,
    appDisplayVersion: config.version,
    channel: config.serverGleanMetrics.channel,
    logger_options: { app: config.serverGleanMetrics.loggerAppName },
  });
  gleanServerEventLogger = serverGleanEvents.createEventsServerEventLogger({
    applicationId: config.serverGleanMetrics.applicationId,
    appDisplayVersion: config.version,
    channel: config.serverGleanMetrics.channel,
    logger_options: { app: config.serverGleanMetrics.loggerAppName },
  });

  return {
    rp: {
      formView: async (metrics, rpFormType) => {
        if (!appConfig.serverGleanMetrics.enabled) {
          return;
        }
        gleanEventLogger.record({
          ...metrics,
          event_name: 'relying_party_button_view',
          event_reason: rpFormType,
        });
        gleanServerEventLogger.recordRelyingPartyFormView({
          ...metrics,
          type: rpFormType,
        });
      },
    },
  };
};
