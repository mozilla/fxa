/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const serverGleanEvents = require('./server_events');
const ua = require('fxa-shared/lib/user-agent').default;
const remoteAddress =
  require('fxa-shared/express/remote-address').remoteAddress;

let appConfig;
let gleanEventLogger;
let gleanServerEventLogger;
let getRemoteAddress;
let oauthIdToServiceMap;

const getMetricMethod = (eventName) => {
  const uppercaseWords = eventName
    .split('_')
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join('');
  const methodName = `record${uppercaseWords}`;

  if (!gleanServerEventLogger[methodName]) {
    process.stderr.write(
      `Method ${methodName} not found in gleanServerEventLogger`
    );
    process.exit(1);
  }

  return gleanServerEventLogger[methodName];
};

const createEventFn = (eventName, options) => {
  // Glean event metric method based on string event name
  const method = getMetricMethod(eventName);
  const eventOptions = options || {};

  return (req, metricsData = {}) => {
    if (!appConfig.serverGleanMetrics.enabled) {
      return;
    }

    const userAgent = ua.parseToScalars(
      req.headers && req.headers['user-agent']
    );
    const maybeMetrics = { ...(req.query || {}) };
    const commonMetrics = {
      user_agent: req.headers['user-agent'],
      ip_address: getRemoteAddress(req).clientAddress,
      account_user_id_sha256: '',
      relying_party_oauth_client_id: maybeMetrics.service || '',
      relying_party_service: oauthIdToServiceMap[maybeMetrics.service] || '',
      session_device_type: userAgent.deviceType || '',
      session_entrypoint: maybeMetrics.entrypoint || '',
      session_entrypoint_experiment: maybeMetrics.entrypoint_experiment || '',
      session_entrypoint_variation: maybeMetrics.entrypoint_variation || '',
      session_flow_id: metricsData.flowId || maybeMetrics.flowId || '',
      utm_campaign: maybeMetrics.utm_campaign || '',
      utm_content: maybeMetrics.utm_content || '',
      utm_medium: maybeMetrics.utm_medium || '',
      utm_source: maybeMetrics.utm_source || '',
      utm_term: maybeMetrics.utm_term || '',
    };
    const eventReason = metricsData.reason || '';

    // Glean events with event metric type
    const moreMetrics = eventOptions.additionalMetrics
      ? eventOptions.additionalMetrics({
          ...commonMetrics,
          ...metricsData,
        })
      : {};
    method.call(gleanServerEventLogger, { ...commonMetrics, ...moreMetrics });

    gleanEventLogger.record({
      ...commonMetrics,
      event_name: eventName,
      event_reason: eventReason,
    });
  };
};

module.exports = function (config) {
  appConfig = config;
  getRemoteAddress = remoteAddress(config.clientAddressDepth);
  oauthIdToServiceMap = config.oauth_client_id_map;

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
      formView: createEventFn('relying_party_form_view', {
        additionalMetrics: (metrics) => ({ type: metrics.reason }),
      }),
    },
  };
};
