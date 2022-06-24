/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from 'joi';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';
import { Container } from 'typedi';

import { ConfigType } from '../../config';
import SUBSCRIPTIONS_DOCS from '../../docs/swagger/subscriptions-api';
import { PlaySubscriptions } from '../../lib/payments/iap/google-play/subscriptions';
import { AppStoreSubscriptions } from '../../lib/payments/iap/apple-app-store/subscriptions';
import {
  playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO,
  appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO,
} from '../payments/iap/iap-formatter';
import { StripeHelper } from '../payments/stripe';
import { AuthLogger, AuthRequest } from '../types';
import validators from './validators';

export const supportPanelRoutes = ({
  log,
  config,
  stripeHelper,
  playSubscriptions,
  appStoreSubscriptions,
}: {
  log: AuthLogger;
  config: ConfigType;
  stripeHelper: StripeHelper;
  playSubscriptions?: PlaySubscriptions;
  appStoreSubscriptions?: AppStoreSubscriptions;
}): ServerRoute[] => {
  if (!config.subscriptions.enabled || !stripeHelper) {
    return [];
  }

  if (!playSubscriptions) {
    playSubscriptions = Container.get(PlaySubscriptions);
  }

  if (!appStoreSubscriptions) {
    appStoreSubscriptions = Container.get(AppStoreSubscriptions);
  }

  const supportPanelHandler = new SupportPanelHandler(
    log,
    stripeHelper,
    playSubscriptions,
    appStoreSubscriptions
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
    protected playSubscriptions: PlaySubscriptions,
    protected appStoreSubscriptions: AppStoreSubscriptions
  ) {}

  async getSubscriptions(request: AuthRequest) {
    this.log.begin('supportPanelGetSubscriptions', request);
    const { uid } = request.query as Record<string, string>;
    const iapPlaySubscriptions = (
      await this.playSubscriptions.getSubscriptions(uid)
    ).map(playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO);
    const iapAppStoreSubscriptions = (
      await this.appStoreSubscriptions.getSubscriptions(uid)
    ).map(appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO);
    const customer = await this.stripeHelper.fetchCustomer(uid);
    const webSubscriptions = customer?.subscriptions;
    const formattedWebSubscriptions = webSubscriptions
      ? await this.stripeHelper.formatSubscriptionsForSupport(webSubscriptions)
      : [];

    return {
      [MozillaSubscriptionTypes.WEB]: formattedWebSubscriptions,
      [MozillaSubscriptionTypes.IAP_GOOGLE]: iapPlaySubscriptions,
      [MozillaSubscriptionTypes.IAP_APPLE]: iapAppStoreSubscriptions,
    };
  }
}

module.exports = supportPanelRoutes;
module.exports.supportPanelRoutes = supportPanelRoutes;
