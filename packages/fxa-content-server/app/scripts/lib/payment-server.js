/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import Url from './url';

const allowedUnauthenticatedRoutes = ['checkout'];
const isAllowedUnauthenticatedRoute = (redirectPath) =>
  allowedUnauthenticatedRoutes.some((route) => redirectPath.startsWith(route));

const PaymentServer = {
  /**
   * Navigate to the payments server after flushing metrics.
   *
   * @param {Object} view
   * @param {Object} subscriptionsConfig
   * @param {String} redirectPath
   * @param {Object} [rpQueryParams={}]
   * @param {String} [paymentsNextUrl]
   * @param {Boolean} [usePaymentsNext]
   */
  async navigateToPaymentServer(
    view,
    subscriptionsConfig,
    redirectPath,
    rpQueryParams = {},
    paymentsNextUrl,
    usePaymentsNext,
  ) {
    const {
      managementClientId,
      managementScopes,
      managementTokenTTL,
      managementUrl,
    } = subscriptionsConfig;

    const { deviceId, flowBeginTime, flowId } =
      view.metrics.getFlowEventMetadata();

    const account = view.getSignedInAccount();
    const metricsEnabled = account
      ? account.pick('metricsEnabled').metricsEnabled
      : true;

    if (metricsEnabled === false) {
      // Strip out the flow params from the query params. We don't want to propagate them.
      delete rpQueryParams.device_id;
      delete rpQueryParams.flow_begin_time;
      delete rpQueryParams.flow_id;
    }

    // explicitly check for `false` because `undefined` means the user isn't logged in
    const queryString =
      metricsEnabled === false
        ? Url.objToSearchString(rpQueryParams)
        : Url.objToSearchString({
            // device_id, flow_begin_time, and flow_id need to be propagated to
            // the payments server so that the user funnel can be traced from the RP,
            // through the content server, and to the payments server, appearing as
            // the same user throughout. We do _not_ include these for logged in users
            // that have opted out of metrics collection.
            device_id: deviceId,
            flow_begin_time: flowBeginTime,
            flow_id: flowId,
            ...rpQueryParams,
          });
    const baseUrl = usePaymentsNext ? paymentsNextUrl : managementUrl;
    const url = `${baseUrl}/${redirectPath}${queryString}`;

    const unauthenticatedRedirect = () => {
      if (isAllowedUnauthenticatedRoute(redirectPath)) {
        return view.navigateAway(url);
      }

      view.navigate('/');
    };

    if (account) {
      try {
        const isSignedIn = await account.isSignedIn();

        if (isSignedIn) {
          const accessToken = await account.createOAuthToken(
            managementClientId,
            {
              scope: managementScopes,
              ttl: managementTokenTTL,
            }
          );
          const hashString = Url.objToHashString({
            accessToken: accessToken.get('token'),
          });

          return view.navigateAway(`${url}${hashString}`);
        }
      } catch (_) {
        unauthenticatedRedirect();
      }
    }

    unauthenticatedRedirect();
  },
};

export default PaymentServer;
