/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from '@hapi/joi';
import { OAUTH_SCOPE_SUBSCRIPTIONS_IAP } from 'fxa-shared/oauth/constants';
import { Container } from 'typedi';

import SUBSCRIPTIONS_DOCS from '../../../docs/swagger/subscriptions-api';
import error from '../../error';
import { CapabilityService } from '../../payments/capability';
import { AppleIAP } from '../../payments/iap/apple-app-store/apple-iap';
import { PurchaseUpdateError } from '../../payments/iap/apple-app-store/types/errors';
import { IAPConfig } from '../../payments/iap/iap-config';
import { AuthLogger, AuthRequest } from '../../types';
import { handleAuthScoped } from './utils';

export class AppleIapHandler {
  private log: AuthLogger;
  private iapConfig: IAPConfig;
  private appStore: AppleIAP;
  private capabilityService: CapabilityService;
  private db: any;

  constructor(db: any) {
    this.db = db;
    this.iapConfig = Container.get(IAPConfig);
    this.log = Container.get(AuthLogger);
    this.appStore = Container.get(AppleIAP);
    this.capabilityService = Container.get(CapabilityService);
  }

  /**
   * Validate and register an Apple original transaction ID.
   */
  public async registerOriginalTransactionId(request: AuthRequest) {
    this.log.begin('appleIap.registerOriginalTransactionId', request);
    const { uid } = handleAuthScoped(request.auth, [
      OAUTH_SCOPE_SUBSCRIPTIONS_IAP,
    ]);

    const { appName } = request.params;
    const { originalTransactionId } = request.payload as any;
    const bundleId = await this.iapConfig.getBundleId(appName);
    if (!bundleId) {
      throw error.unknownAppName(appName);
    }

    let purchase;
    try {
      purchase = await this.appStore.purchaseManager.registerToUserAccount(
        bundleId,
        originalTransactionId,
        uid
      );
    } catch (err) {
      switch (err.name) {
        case PurchaseUpdateError.INVALID_ORIGINAL_TRANSACTION_ID:
          throw error.iapInvalidToken(err);
        case PurchaseUpdateError.CONFLICT:
        case PurchaseUpdateError.OTHER_ERROR:
          throw error.iapInternalError(err);
        default:
          throw error.backendServiceFailure(
            'appstore',
            'registerOriginalTransactionId',
            { bundleId, originalTransactionId },
            err
          );
      }
    }
    await this.capabilityService.iapUpdate(uid, purchase);
    return { transactionIdValid: true };
  }
}

export const appleIapRoutes = (db: any): ServerRoute[] => {
  const appleIapHandler = new AppleIapHandler(db);
  return [
    {
      method: 'POST',
      path: '/oauth/subscriptions/iap/app-store-transaction/{appName}',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_IAP_PLAYTOKEN_APPNAME_POST,
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
              originalTransactionId: isA.string().required(),
            })
            .required() as any,
        },
      },
      handler: (request: AuthRequest) =>
        appleIapHandler.registerOriginalTransactionId(request),
    },
  ];
};
