/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TargetName } from '.';
import { RemoteTarget } from './remote';

const ACCOUNTS_DOMAIN = process.env.ACCOUNTS_DOMAIN || 'accounts.firefox.com';
const ACCOUNTS_API_DOMAIN =
  process.env.ACCOUNTS_API_DOMAIN || 'api.accounts.firefox.com';
const PAYMENTS_DOMAIN =
  process.env.PAYMENTS_DOMAIN || 'subscriptions.firefox.com';
const RELIER_DOMAIN =
  process.env.RELIER_DOMAIN || 'production-123done.herokuapp.com';
const RELIER_CLIENT_ID = '3c32bf6654542211';

export class ProductionTarget extends RemoteTarget {
  static readonly target = 'production';
  readonly name: TargetName = ProductionTarget.target;

  readonly contentServerUrl = `https://${ACCOUNTS_DOMAIN}`;
  readonly paymentsServerUrl = `https://${PAYMENTS_DOMAIN}`;
  readonly relierUrl = `https://${RELIER_DOMAIN}`;
  readonly relierClientID = RELIER_CLIENT_ID;
  readonly subscriptionConfig = {
    product: '',
    name: '',
    plan: '',
  };

  constructor() {
    super(`https://${ACCOUNTS_API_DOMAIN}`);
  }
}
