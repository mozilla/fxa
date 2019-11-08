/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import Url from './url';

const PaymentServer = {
  /**
   * Navigate to the payments server after flushing metrics.
   *
   * @param {Object} view
   * @param {Object} subscriptionsConfig
   * @param {String} redirectPath
   * @param {Object} [queryParams={}]
   */
  navigateToPaymentServer(
    view,
    subscriptionsConfig,
    redirectPath,
    queryParams = {}
  ) {
    const {
      managementClientId,
      managementScopes,
      managementTokenTTL,
      managementUrl,
    } = subscriptionsConfig;

    const {
      deviceId,
      flowBeginTime,
      flowId,
    } = view.metrics.getFlowEventMetadata();

    return view
      .getSignedInAccount()
      .createOAuthToken(managementClientId, {
        scope: managementScopes,
        ttl: managementTokenTTL,
      })
      .then(accessToken => {
        const queryString = Url.objToSearchString({
          // device_id, flow_begin_time, and flow_id need to be propagated to
          // the payments server so that the user funnel can be traced from the RP,
          // through the content server, and to the payments server, appearing as
          // the same user throughout.
          device_id: deviceId,
          flow_begin_time: flowBeginTime,
          flow_id: flowId,
          ...queryParams,
        });

        const hashString = Url.objToHashString({
          accessToken: accessToken.get('token'),
        });

        const url = `${managementUrl}/${redirectPath}${queryString}${hashString}`;
        view.navigateAway(url);
      });
  },
};

export default PaymentServer;
