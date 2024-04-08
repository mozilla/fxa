/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';

import {
  AccountDatabase,
  AccountDbProvider,
} from '@fxa/shared/db/mysql/account';
import {
  AccountCustomerNotCreatedError,
  AccountCustomerNotDeletedError,
  AccountCustomerNotFoundError,
  AccountCustomerNotUpdatedError,
} from './accountCustomer.error';
import {
  createAccountCustomer,
  deleteAccountCustomer,
  getAccountCustomerByUid,
  updateAccountCustomer,
} from './accountCustomer.repository';
import {
  CreateAccountCustomer,
  ResultAccountCustomer,
  UpdateAccountCustomer,
} from './accountCustomer.types';

@Injectable()
export class AccountCustomerManager {
  constructor(@Inject(AccountDbProvider) private db: AccountDatabase) {}

  public async createAccountCustomer(
    input: CreateAccountCustomer
  ): Promise<ResultAccountCustomer> {
    const now = Date.now();
    try {
      const accountCustomer = await createAccountCustomer(this.db, {
        uid: Buffer.from(input.uid, 'hex'),
        stripeCustomerId: input.stripeCustomerId,
        createdAt: now,
        updatedAt: now,
      });
      return {
        ...accountCustomer,
        uid: accountCustomer.uid.toString('hex'),
      };
    } catch (error) {
      throw new AccountCustomerNotCreatedError(input, error);
    }
  }

  public async getAccountCustomerByUid(
    uid: string
  ): Promise<ResultAccountCustomer> {
    try {
      const accountCustomer = await getAccountCustomerByUid(
        this.db,
        Buffer.from(uid, 'hex')
      );
      return {
        ...accountCustomer,
        uid: accountCustomer.uid.toString('hex'),
      };
    } catch (error) {
      throw new AccountCustomerNotFoundError(uid, error);
    }
  }

  public async updateAccountCustomer(uid: string, data: UpdateAccountCustomer) {
    const accountCustomer = await this.getAccountCustomerByUid(uid);

    try {
      return await updateAccountCustomer(
        this.db,
        Buffer.from(uid, 'hex'),
        data
      );
    } catch (error) {
      const cause =
        error instanceof AccountCustomerNotUpdatedError ? undefined : error;
      throw new AccountCustomerNotUpdatedError(
        accountCustomer.uid,
        accountCustomer,
        cause
      );
    }
  }

  public async deleteAccountCustomer(accountCustomer: ResultAccountCustomer) {
    try {
      const result = await deleteAccountCustomer(
        this.db,
        Buffer.from(accountCustomer.uid, 'hex')
      );
      if (!result) {
        throw new AccountCustomerNotDeletedError(accountCustomer.uid);
      }
      return true;
    } catch (error) {
      const cause =
        error instanceof AccountCustomerNotDeletedError ? undefined : error;
      throw new AccountCustomerNotDeletedError(accountCustomer.uid, cause);
    }
  }
}
