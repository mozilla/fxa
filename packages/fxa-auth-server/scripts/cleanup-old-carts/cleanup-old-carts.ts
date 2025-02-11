/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AccountDatabase } from '@fxa/shared/db/mysql/account';

export class CartCleanup {
  constructor(
    private deleteBefore: Date,
    private anonymizeBefore: Date | null,
    private anonymizeFields: Set<'email' | 'taxAddress'> | null,
    private database: AccountDatabase
  ) {}

  async run(): Promise<void> {
    await this.database
      .deleteFrom('carts')
      .where('updatedAt', '<', this.deleteBefore.getTime())
      .execute();

    if (this.anonymizeBefore && this.anonymizeFields?.size) {
      let anonymizePendingQuery = this.database
        .updateTable('carts')
        .where('updatedAt', '<', this.anonymizeBefore.getTime());

      if (this.anonymizeFields.has('email')) {
        anonymizePendingQuery = anonymizePendingQuery.set('email', null);
      }
      if (this.anonymizeFields.has('taxAddress')) {
        anonymizePendingQuery = anonymizePendingQuery.set('taxAddress', null);
      }

      await anonymizePendingQuery.execute();
    }
  }
}
