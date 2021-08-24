/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from '@hapi/joi';
import { OAUTH_SCOPE_SUBSCRIPTIONS_IAP } from 'fxa-shared/oauth/constants';
import { Container } from 'typedi';

import error from '../../error';
import { CapabilityService } from '../../payments/capability';
import { PlayBilling } from '../../payments/google-play/play-billing';
import { PurchaseUpdateError } from '../../payments/google-play/types/errors';
import { SkuType } from '../../payments/google-play/types/purchases';
import { AuthLogger, AuthRequest, ProfileClient } from '../../types';
import { handleAuthScoped } from './utils';

export class GoogleIapHandler {
  private log: AuthLogger;
  private playBilling: PlayBilling;
  private capabilityService: CapabilityService;
  private db: any;
  private profileClient: ProfileClient;

  constructor(db: any) {
    this.db = db;
    this.log = Container.get(AuthLogger);
    this.playBilling = Container.get(PlayBilling);
    this.capabilityService = Container.get(CapabilityService);
    this.profileClient = Container.get(ProfileClient);
  }

  /**
   * Retrieve all the Android plans for the client.
   */
  public async plans(request: AuthRequest) {
    const { appName } = request.params;
    this.log.begin('googleIap.plans', request);
    return this.playBilling.plans(appName);
  }

  /**
   * Validate and register a Play purchase token for a user.
   */
  public async registerToken(request: AuthRequest) {
    this.log.begin('googleIap.registerToken', request);
    const { uid } = handleAuthScoped(request.auth, [
      OAUTH_SCOPE_SUBSCRIPTIONS_IAP,
    ]);

    const { appName } = request.params;
    const { sku, token } = request.payload as any;
    const packageName = await this.playBilling.packageName(appName);
    if (!packageName) {
      throw error.unknownAppName(appName);
    }

    // Lookup the email for the user as we need it for capability checks
    const { email } = (await this.db.account(uid)).primaryEmail;

    const priorProductIds = await this.capabilityService.subscribedProductIds(
      uid,
      email
    );

    try {
      await this.playBilling.purchaseManager.registerToUserAccount(
        packageName,
        sku,
        token,
        SkuType.SUBS,
        uid
      );
    } catch (err) {
      switch (err.name) {
        case PurchaseUpdateError.INVALID_TOKEN:
          throw error.iapInvalidToken(err);
        case PurchaseUpdateError.CONFLICT:
        case PurchaseUpdateError.OTHER_ERROR:
          throw error.iapInternalError(err);
        default:
          throw error.backendServiceFailure(
            'play',
            'registerToken',
            { packageName, token },
            err
          );
      }
    }
    const currentProductIds = await this.capabilityService.subscribedProductIds(
      uid,
      email
    );

    // If our products have changed, process them and update the profile cache
    if (priorProductIds != currentProductIds) {
      // Update cache first in case RPs are quick to update.
      await this.profileClient.deleteCache(uid);

      await this.capabilityService.processProductDiff({
        uid,
        priorProductIds,
        currentProductIds,
      });
    }
    return { tokenValid: true };
  }
}

export const googleIapRoutes = (db: any): ServerRoute[] => {
  const googleIapHandler = new GoogleIapHandler(db);
  return [
    {
      method: 'GET',
      path: '/oauth/subscriptions/iap/plans/{appName}',
      options: {
        // No auth needed to fetch the plan blob.
        auth: false,
        validate: {
          params: {
            appName: isA.string().required(),
          },
        },
      },
      handler: (request: AuthRequest) => googleIapHandler.plans(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/iap/play-token/{appName}',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        validate: {
          params: {
            appName: isA.string().required(),
          },
          payload: isA
            .object({
              sku: isA.string().required(),
              token: isA.string().required(),
            })
            .required(),
        },
      },
      handler: (request: AuthRequest) =>
        googleIapHandler.registerToken(request),
    },
  ];
};
