/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import DB from './db/index';
import OAuthDb from './oauth/db';
import { AppleIAP } from './payments/iap/apple-app-store/apple-iap';
import { PlayBilling } from './payments/iap/google-play/play-billing';
import { PayPalHelper } from './payments/paypal/helper';
import { StripeHelper } from './payments/stripe';
import push from './push';
import pushboxApi from './pushbox';
import { AuthLogger } from './types';

type FxaDbDeleteAccount = Pick<
  Awaited<ReturnType<ReturnType<typeof DB>['connect']>>,
  'deleteAccount'
>;
type OAuthDbDeleteAccount = Pick<typeof OAuthDb, 'removeTokensAndCodes'>;
type PushDeleteAccount = Pick<
  ReturnType<typeof push>,
  'notifyAccountDestroyed'
>;
type PushboxDeleteAccount = Pick<
  ReturnType<typeof pushboxApi>,
  'deleteAccount'
>;

export class AccountDeleteManager {
  private fxaDb: FxaDbDeleteAccount;
  private oauthDb: OAuthDbDeleteAccount;
  private push: PushDeleteAccount;
  private pushbox: PushboxDeleteAccount;
  private stripeHelper?: StripeHelper;
  private paypalHelper?: PayPalHelper;
  private appleIap?: AppleIAP;
  private playBilling?: PlayBilling;
  private log: AuthLogger;

  constructor({
    fxaDb,
    oauthDb,
    push,
    pushbox,
  }: {
    fxaDb: FxaDbDeleteAccount;
    oauthDb: OAuthDbDeleteAccount;
    push: PushDeleteAccount;
    pushbox: PushboxDeleteAccount;
  }) {
    this.fxaDb = fxaDb;
    this.oauthDb = oauthDb;
    this.push = push;
    this.pushbox = pushbox;

    if (Container.has(StripeHelper)) {
      this.stripeHelper = Container.get(StripeHelper);
    }
    if (Container.has(PayPalHelper)) {
      this.paypalHelper = Container.get(PayPalHelper);
    }
    if (Container.has(AppleIAP)) {
      this.appleIap = Container.get(AppleIAP);
    }
    if (Container.has(PlayBilling)) {
      this.playBilling = Container.get(PlayBilling);
    }
    this.log = Container.get(AuthLogger);
  }

  async deleteFirestoreCustomer(uid: string) {
    this.log.debug('AccountDeleteManager.deleteFirestoreCustomer', { uid });
    const result = await this.stripeHelper?.removeFirestoreCustomer(uid);
    if (!result?.length) {
      this.log.error('AccountDeleteManager.deleteFirestoreCustomer', { uid });
    }
    return result;
  }
}
