/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { uuidTransformer } from '../../transformers';

/** Session Token
 *
 * Note that this class does not currently implement all the functionality of the
 * `session_token.js` version from `fxa-auth-server`.
 */
export class SessionToken {
  uid!: string;
  createdAt!: number;
  email!: string;
  emailCode!: string;
  emailVerified!: boolean;
  verifierSetAt!: number;
  keysChangedAt!: number;
  accountCreatedAt!: number;
  tokenVerified!: boolean;
  [key: string]: any;

  constructor(options: SessionToken) {
    Object.assign(this, options);
    // Tokens are considered verified if no tokenVerificationId exists
    this.tokenVerificationId = options.tokenVerificationId || null;
    this.tokenVerified = this.tokenVerificationId ? false : true;
  }

  get state(): 'verified' | 'unverified' {
    return this.tokenVerified ? 'verified' : 'unverified';
  }

  static fromDatabaseRow(row: any): SessionToken {
    row.uid = uuidTransformer.from(row.uid);
    row.emailCode = uuidTransformer.from(row.emailCode);
    return new SessionToken(row);
  }
}
