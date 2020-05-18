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
    query = query.withGraphJoined('emails').where({ 'accounts.uid': uidBuffer });
  } else {
    query = query.where({ uid: uidBuffer });
  }
  return query.first();
}

export { Account, AuthBaseModel };
