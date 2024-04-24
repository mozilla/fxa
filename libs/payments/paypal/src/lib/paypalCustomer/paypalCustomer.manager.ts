/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import type { AccountDatabase } from '@fxa/shared/db/mysql/account';
import { AccountDbProvider } from '@fxa/shared/db/mysql/account';
import {
  createPaypalCustomer,
  deletePaypalCustomer,
  deletePaypalCustomersByUid,
  fetchPaypalCustomer,
  fetchPaypalCustomersByBillingAgreementId,
  fetchPaypalCustomersByUid,
  updatePaypalCustomer,
} from './paypalCustomer.repository';
import { ResultPaypalCustomer } from './paypalCustomer.types';
import {
  PaypalCustomerNotCreatedError,
  PaypalCustomerNotDeletedError,
  PaypalCustomerNotFoundError,
  PaypalCustomerNotUpdatedError,
} from './paypalCustomer.error';
import {
  CreatePaypalCustomer,
  UpdatePaypalCustomer,
} from './paypalCustomer.types';

@Injectable()
export class PaypalCustomerManager {
  constructor(@Inject(AccountDbProvider) private db: AccountDatabase) {}

  public async createPaypalCustomer(
    input: CreatePaypalCustomer
  ): Promise<ResultPaypalCustomer> {
    const now = Date.now();
    try {
      const paypalCustomer = await createPaypalCustomer(this.db, {
        uid: Buffer.from(input.uid, 'hex'),
        billingAgreementId: input.billingAgreementId,
        status: input.status,
        createdAt: now,
      });
      return {
        ...paypalCustomer,
        uid: paypalCustomer.uid.toString('hex'),
      };
    } catch (error) {
      throw new PaypalCustomerNotCreatedError(input, error);
    }
  }

  public async fetchPaypalCustomer(
    uid: string,
    billingAgreementId: string
  ): Promise<ResultPaypalCustomer> {
    try {
      const paypalCustomer = await fetchPaypalCustomer(
        this.db,
        Buffer.from(uid, 'hex'),
        billingAgreementId
      );
      return {
        ...paypalCustomer,
        uid: paypalCustomer.uid.toString('hex'),
      };
    } catch (error) {
      throw new PaypalCustomerNotFoundError(uid, error);
    }
  }

  public async fetchPaypalCustomersByUid(
    uid: string
  ): Promise<ResultPaypalCustomer[]> {
    try {
      const paypalCustomers = await fetchPaypalCustomersByUid(
        this.db,
        Buffer.from(uid, 'hex')
      );
      return paypalCustomers.map((paypalCustomer) => ({
        ...paypalCustomer,
        uid: paypalCustomer.uid.toString('hex'),
      }));
    } catch (error) {
      throw new PaypalCustomerNotFoundError(uid, error);
    }
  }

  public async fetchPaypalCustomersByBillingAgreementId(
    billingAgreementId: string
  ): Promise<ResultPaypalCustomer[]> {
    try {
      const paypalCustomers = await fetchPaypalCustomersByBillingAgreementId(
        this.db,
        billingAgreementId
      );
      return paypalCustomers.map((paypalCustomer) => ({
        ...paypalCustomer,
        uid: paypalCustomer.uid.toString('hex'),
      }));
    } catch (error) {
      throw new PaypalCustomerNotFoundError(billingAgreementId, error);
    }
  }

  public async updatePaypalCustomer(
    uid: string,
    billingAgreementId: string,
    data: UpdatePaypalCustomer
  ) {
    const paypalCustomer = await this.fetchPaypalCustomer(
      uid,
      billingAgreementId
    );

    try {
      return await updatePaypalCustomer(
        this.db,
        Buffer.from(uid, 'hex'),
        billingAgreementId,
        data
      );
    } catch (error) {
      const cause =
        error instanceof PaypalCustomerNotUpdatedError ? undefined : error;
      throw new PaypalCustomerNotUpdatedError(
        paypalCustomer.uid,
        paypalCustomer.billingAgreementId,
        paypalCustomer,
        cause
      );
    }
  }

  public async deletePaypalCustomer(paypalCustomer: ResultPaypalCustomer) {
    try {
      const result = await deletePaypalCustomer(
        this.db,
        Buffer.from(paypalCustomer.uid, 'hex'),
        paypalCustomer.billingAgreementId
      );
      if (!result) {
        throw new PaypalCustomerNotDeletedError(
          paypalCustomer.uid,
          paypalCustomer.billingAgreementId
        );
      }
      return true;
    } catch (error) {
      const cause =
        error instanceof PaypalCustomerNotDeletedError ? undefined : error;
      throw new PaypalCustomerNotDeletedError(
        paypalCustomer.uid,
        paypalCustomer.billingAgreementId,
        cause
      );
    }
  }

  public async deletePaypalCustomersByUid(uid: string) {
    try {
      const result = await deletePaypalCustomersByUid(
        this.db,
        Buffer.from(uid, 'hex')
      );
      return result;
    } catch (error) {
      throw new PaypalCustomerNotDeletedError(uid, '', error);
    }
  }
}
