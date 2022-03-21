/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel } from './base-auth';
import { uuidTransformer } from '../../transformers';

export const PROVIDER = {
  __fxa__unmapped: 0,
  google: 1,
  apple: 2,
} as const;
export type Provider = keyof typeof PROVIDER;

export class LinkedAccount extends BaseAuthModel {
  static tableName = 'linkedAccounts';
  static idColumn = 'id';

  protected $uuidFields = ['uid'];
  protected $intBoolFields = ['enabled'];

  uid!: string;
  id!: string;
  providerId!: number;
  enabled!: boolean;
  authAt!: number;

  static async findByUid(uid: string) {
    return LinkedAccount.query().where('uid', uuidTransformer.to(uid));
  }

  static async findByLinkedAccount(id: string, provider: Provider) {
    return LinkedAccount.query()
      .where({
        id: id,
        providerId: PROVIDER[provider],
      })
      .first();
  }

  static async createLinkedAccount(
    uid: string,
    id: string,
    provider: Provider
  ) {
    return LinkedAccount.query().insert({
      uid: uuidTransformer.to(uid),
      id,
      authAt: Date.now(),
      enabled: true,
      providerId: PROVIDER[provider],
    });
  }

  static async deleteLinkedAccount(uid: string, provider: Provider) {
    return LinkedAccount.query()
      .delete()
      .where({
        uid: uuidTransformer.to(uid),
        providerId: PROVIDER[provider],
      });

    // TODO: In a follow up we can consider automatically revoking sessions
    // that were created from a Google auth flow. Currently, a user
    // can manually disconnect a connection in the `Connected services`
    // section in settings
  }
}
