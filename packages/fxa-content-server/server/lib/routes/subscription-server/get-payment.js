/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const flowMetrics = require('../../flow-metrics');
const logger = require('../../logging/log')('routes.index');

module.exports = function (config) {
  let featureFlags;
  const featureFlagConfig = config.get('featureFlags');
  if (featureFlagConfig.enabled) {
    featureFlags = require('fxa-shared/feature-flags')(featureFlagConfig, logger);
  } else {
    featureFlags = { get: () => ({}) };
  }

  const ENV = config.get('env');
  const FLOW_ID_KEY = config.get('flow_id_key');
  const PROFILE_SERVER_URL = config.get('profile_url');
  const STATIC_RESOURCE_URL = config.get('static_resource_url');
  // add version from package.json to config
  const RELEASE = require('../../../../package.json').version;
  const WEBPACK_PUBLIC_PATH = `${STATIC_RESOURCE_URL}/${config.get('jsResourcePath')}/`;

  const serializedConfig = encodeURIComponent(JSON.stringify({
    env: ENV,
    profileUrl: PROFILE_SERVER_URL,
    release: RELEASE,
    staticResourceUrl: STATIC_RESOURCE_URL,
    webpackPublicPath: WEBPACK_PUBLIC_PATH,
  }));

  return {
    method: 'get',
    path: '/payment',
    process: async function (req, res) {
      // TODO the flowBeginTime and flowId should come from query params
      const flowEventData = flowMetrics.create(FLOW_ID_KEY, req.headers['user-agent']);

      let flags;
      try {
        flags = await featureFlags.get();
      } catch (err) {
        logger.error('featureFlags.error', err);
        flags = {};
      }
      res.render('payment', {
        // Note that bundlePath is added to templates as a build step
        bundlePath: '/bundle',
        config: serializedConfig,
        featureFlags: encodeURIComponent(JSON.stringify(flags)),
        flowBeginTime: flowEventData.flowBeginTime,
        flowId: flowEventData.flowId,
        // Note that staticResourceUrl is added to templates as a build step
        staticResourceUrl: STATIC_RESOURCE_URL
      });

      if (req.headers.dnt === '1') {
        logger.info('request.headers.dnt');
      }
    },
    terminate: featureFlags.terminate
  };
};
