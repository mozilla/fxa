/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TargetName } from '.';
import { RemoteTarget } from './remote';

const ACCOUNTS_DOMAIN =
  process.env.ACCOUNTS_DOMAIN || 'accounts.stage.mozaws.net';
const ACCOUNTS_API_DOMAIN =
  process.env.ACCOUNTS_API_DOMAIN || 'api-accounts.stage.mozaws.net';
const RELIER_DOMAIN =
  process.env.RELIER_DOMAIN || 'stage-123done.herokuapp.com';
const RELIER_CLIENT_ID = 'dcdb5ae7add825d2';

export class StageTarget extends RemoteTarget {
  static readonly target = 'stage';
  readonly name: TargetName = StageTarget.target;
  readonly contentServerUrl = `https://${ACCOUNTS_DOMAIN}`;
  readonly relierUrl = `https://${RELIER_DOMAIN}`;
  readonly relierClientID = RELIER_CLIENT_ID;

  constructor() {
    super(`https://${ACCOUNTS_API_DOMAIN}`);
  }
}
