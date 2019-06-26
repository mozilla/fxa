/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const PaymentServer = {
  navigateToPaymentServer(view, subscriptionsConfig, redirectPath) {
    const {
      managementClientId,
      managementScopes,
      managementTokenTTL,
      managementUrl,
    } = subscriptionsConfig;
    return view.getSignedInAccount()
      .createOAuthToken(managementScopes, {
        client_id: managementClientId, //eslint-disable-line camelcase
        ttl: managementTokenTTL,
      })
      .then((accessToken) => {
        const url = `${managementUrl}/${redirectPath}#accessToken=${encodeURIComponent(accessToken.get('token'))}`;
        view.navigateAway(url);
      });
  }
};

export default PaymentServer;
