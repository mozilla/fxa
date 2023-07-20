/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from 'joi';
import { DecodedNotificationPayload } from 'app-store-server-api';
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

  constructor() {
    this.iapConfig = Container.get(IAPConfig);
    this.log = Container.get(AuthLogger);
    this.appStore = Container.get(AppleIAP);
    this.capabilityService = Container.get(CapabilityService);
  }

  public async processNotification(request: AuthRequest) {
    this.log.begin('appleIap.processNotification', request);
    let bundleId: string;
    let originalTransactionId: string;
    let decodedPayload: DecodedNotificationPayload;
    try {
      ({ bundleId, originalTransactionId, decodedPayload } =
        await this.appStore.purchaseManager.decodeNotificationPayload(
          (request.payload as any).signedPayload
        ));
    } catch (err) {
      // app-store-server-api compiles CertificateValidationError to a function,
      // so can't use instanceof to check.
      if (err.message === 'Certificate validation failed') {
        throw error.unauthorized();
      }
      throw err;
    }
    this.log.debug('appleIap.processNotification.decodedPayload', {
      bundleId,
      originalTransactionId,
      notificationType: decodedPayload.notificationType,
      ...(decodedPayload.subtype && {
        notificationSubtype: decodedPayload.subtype,
      }),
    });
    const purchase =
      await this.appStore.purchaseManager.getSubscriptionPurchase(
        originalTransactionId
      );

    if (!purchase) {
      // Store the purchase by processing it, even though we don't know who it
      // belongs to.
      await this.appStore.purchaseManager.processNotification(
        bundleId,
        originalTransactionId,
        decodedPayload
      );
      return {};
    }

    const userId = purchase?.userId;

    const updatedPurchase =
      await this.appStore.purchaseManager.processNotification(
        bundleId,
        originalTransactionId,
        decodedPayload
      );

    if (!updatedPurchase || !userId) {
      // If no userId, purchase is not associated with a user, nothing else can be done.
      return {};
    }

    await this.capabilityService.iapUpdate(userId, updatedPurchase);
    return {};
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
          throw error.iapPurchaseConflict(err);
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

export const appleIapRoutes = (): ServerRoute[] => {
  const appleIapHandler = new AppleIapHandler();
  return [
    {
      method: 'POST',
      path: '/oauth/subscriptions/iap/app-store-transaction/{appName}',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_IAP_APP_STORE_TRANSACTION_POST,
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
    {
      method: 'POST',
      path: '/oauth/subscriptions/iap/app-store-notification',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_IAP_APP_STORE_NOTIFICATION_POST,
        validate: {
          // https://developer.apple.com/documentation/appstoreservernotifications/responsebodyv2
          payload: isA
            .object({
              signedPayload: isA.string().required(),
            })
            .required() as any,
        },
        payload: {
          maxBytes: 37000, // twice the expected size
        },
      },
      handler: (request: AuthRequest) =>
        appleIapHandler.processNotification(request),
    },
  ];
};
