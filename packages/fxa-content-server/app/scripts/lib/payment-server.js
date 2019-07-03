/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const PaymentServer = {
  navigateToPaymentServer(
    view,
    subscriptionsConfig,
    redirectPath,
    queryParams
  ) {
    const {
      managementClientId,
      managementScopes,
      managementTokenTTL,
      managementUrl,
    } = subscriptionsConfig;
    const queryString =
      typeof queryParams === 'object' &&
      Object.keys(queryParams)
        .filter(k => queryParams[k] !== null && queryParams[k] !== '')
        .map(
          k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`
        )
        .join('&');
    const qs = queryString.length ? `?${queryString}` : '';
    return view
      .getSignedInAccount()
      .createOAuthToken(managementClientId, {
        scope: managementScopes,
        ttl: managementTokenTTL,
      })
      .then(accessToken => {
        const url = `${managementUrl}/${redirectPath}${qs}#accessToken=${encodeURIComponent(
          accessToken.get('token')
        )}`;
        view.navigateAway(url);
      });
  },
};

export default PaymentServer;
