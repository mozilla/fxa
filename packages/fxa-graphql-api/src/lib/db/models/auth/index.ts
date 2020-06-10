/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account } from './account';
import { AuthBaseModel } from './auth-base';
import { uuidTransformer } from '../../transformers';

export type AccountOptions = {
  include?: 'emails'[];
};

export function accountByUid(uid: string, options?: AccountOptions) {
  let uidBuffer;
  try {
    uidBuffer = uuidTransformer.to(uid);
  } catch (err) {
    return;
  }

  let query = Account.query();
  if (options?.include?.includes('emails')) {
    query = query
      .withGraphJoined('emails')
      .where({ 'accounts.uid': uidBuffer });
  } else {
    query = query.where({ uid: uidBuffer });
  }
  return query.first();
}

// TODO: Find a better home for this.
/**
 * Type machinery to filter an Objection model class down to its direct
 * properties. This is useful for restricting input to object properties
 * of an Objection Model.
 */
type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
type ObjectionModelProperties<T> = Omit<
  NonFunctionProperties<T>,
  'QueryBuilderType'
>;

type Accountish = Partial<ObjectionModelProperties<Account>>;

export function batchAccountUpdate(uids: Buffer[], updateFields: Accountish) {
  return Account.query().whereIn('uid', uids).update(updateFields);
}

export { Account, AuthBaseModel };
