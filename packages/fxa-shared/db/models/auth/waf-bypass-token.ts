/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel } from './base-auth';

export class WafBypassToken extends BaseAuthModel {
  static tableName = 'wafBypassTokens';

  id!: string;
  name!: string;
  token!: string;
  clientId!: Buffer | null;
  createdAt!: number;
}
