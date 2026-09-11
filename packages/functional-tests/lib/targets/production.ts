/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TargetName } from '.';
import { RemoteTarget } from './remote';

const ACCOUNTS_DOMAIN = process.env.ACCOUNTS_DOMAIN || 'accounts.firefox.com';
const ACCOUNTS_API_DOMAIN =
  process.env.ACCOUNTS_API_DOMAIN || 'api.accounts.firefox.com';
const PAYMENTS_NEXT_DOMAIN =
  process.env.PAYMENTS_NEXT_DOMAIN || 'payments.firefox.com';
const RELIER_DOMAIN =
  process.env.RELIER_DOMAIN || 'production-123done.herokuapp.com';
const RELIER_CLIENT_ID = '3c32bf6654542211';
const UNTRUSTED_RELIER_DOMAIN =
  process.env.UNTRUSTED_RELIER_DOMAIN ||
  'production-123done-untrusted.herokuapp.com';
// Set UNTRUSTED_RELIER_CLIENT_ID to run an untrusted spec against production.
// The untrusted specs are gated to local, so nothing reads this by default.
const UNTRUSTED_RELIER_CLIENT_ID = process.env.UNTRUSTED_RELIER_CLIENT_ID || '';

export class ProductionTarget extends RemoteTarget {
  static readonly target = 'production';
  readonly name: TargetName = ProductionTarget.target;
  readonly contentServerUrl = `https://${ACCOUNTS_DOMAIN}`;
  readonly paymentsNextUrl = `https://${PAYMENTS_NEXT_DOMAIN}`;
  readonly paymentsTestOfferingId = 'vpn';
  readonly paymentsTestPriceId = '';
  readonly relierUrl = `https://${RELIER_DOMAIN}`;
  readonly relierClientID = RELIER_CLIENT_ID;
  readonly untrustedRelierUrl = `https://${UNTRUSTED_RELIER_DOMAIN}`;
  readonly untrustedRelierClientID = UNTRUSTED_RELIER_CLIENT_ID;

  constructor() {
    super(`https://${ACCOUNTS_API_DOMAIN}`);
  }
}
