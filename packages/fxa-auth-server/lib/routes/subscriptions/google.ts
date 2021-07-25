/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import { Container } from 'typedi';

import { AuthLogger, AuthRequest } from '../../types';
import { GoogleIAP } from '../../payments/google-iap';

export class GoogleIapHandler {
  private log: AuthLogger;
  private googleIap: GoogleIAP;

  constructor() {
    this.log = Container.get(AuthLogger);
    this.googleIap = Container.get(GoogleIAP);
  }

  /**
   * Retrieve all the Android plans for the client.
   */
  public plans(request: AuthRequest) {
    this.log.begin('googleIap.plans', request);
    return this.googleIap.plans();
  }
}

export const googleIapRoutes = (): ServerRoute[] => {
  const googleIapHandler = new GoogleIapHandler();
  return [
    {
      method: 'GET',
      path: '/oauth/subscriptions/google/plans',
      options: {
        // No auth needed to fetch the plan blob.
        auth: false,
      },
      handler: (request: AuthRequest) => googleIapHandler.plans(request),
    },
  ];
};
