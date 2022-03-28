/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ServerRoute } from '@hapi/hapi';
import isA from '@hapi/joi';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';
import { Container } from 'typedi';
import { ConfigType } from '../../config';
import { PlaySubscriptions } from '../../lib/payments/iap/google-play/subscriptions';
import { StripeHelper } from '../payments/stripe';
import { AuthLogger, AuthRequest } from '../types';
import validators from './validators';

const SUBSCRIPTIONS_DOCS =
  require('../../docs/swagger/subscriptions-api').default;

export const supportPanelRoutes = ({
  log,
  config,
  stripeHelper,
  playSubscriptions,
}: {
  log: AuthLogger;
  config: ConfigType;
  stripeHelper: StripeHelper;
  playSubscriptions?: PlaySubscriptions;
}): ServerRoute[] => {
  if (!config.subscriptions.enabled) {
    return [];
  }

  if (!playSubscriptions) {
    playSubscriptions = Container.get(PlaySubscriptions);
  }

  const supportPanelHandler = new SupportPanelHandler(
    log,
    stripeHelper,
    playSubscriptions
  );
  return [
    {
      method: 'GET',
      path: '/oauth/support-panel/subscriptions',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUPPORTPANEL_SUBSCRIPTIONS_GET,
        auth: {
          payload: false,
          strategy: 'supportPanelSecret',
        },
        response: {
          schema: validators.subscriptionsSubscriptionSupportValidator as any,
        },
        validate: {
          query: {
            uid: isA.string().required(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        supportPanelHandler.getSubscriptions(request),
    },
  ];
};

export class SupportPanelHandler {
  constructor(
    protected log: AuthLogger,
    protected stripeHelper: StripeHelper,
    protected playSubscriptions: PlaySubscriptions
  ) {}

  async getSubscriptions(request: AuthRequest) {
    this.log.begin('supportPanelGetSubscriptions', request);
    const { uid } = request.query as Record<string, string>;
    const iapPlaySubscriptions = await this.playSubscriptions.getSubscriptions(
      uid
    );
    const customer = await this.stripeHelper.fetchCustomer(uid);
    const webSubscriptions = customer?.subscriptions;
    const formattedWebSubscriptions = webSubscriptions
      ? await this.stripeHelper.formatSubscriptionsForSupport(webSubscriptions)
      : [];

    return {
      [MozillaSubscriptionTypes.WEB]: formattedWebSubscriptions,
      [MozillaSubscriptionTypes.IAP_GOOGLE]: iapPlaySubscriptions,
    };
  }
}

module.exports = supportPanelRoutes;
module.exports.supportPanelRoutes = supportPanelRoutes;
