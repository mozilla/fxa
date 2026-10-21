/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseAuthModel } from './base-auth';

/**
 * Tracks current and prior PayPal Billing Agreements for a user.
 */
export class PayPalBillingAgreements extends BaseAuthModel {
  public static tableName = 'paypalCustomers';
  public static idColumn = 'uid';

  protected $uuidFields = ['uid'];

  public uid!: string;
  public billingAgreementId!: string;
  public status!: string;

  public createdAt!: number | null;
  public endedAt?: number;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['uid', 'billingAgreementId'],
      properties: {
        uid: {
          type: 'string',
          pattern: '^(?:[a-fA-F0-9]{2})+$',
        },
        billingAgreementId: {
          type: 'string',
          pattern: '^[A-Z]+-[A-Za-z0-9]+$',
        },
        status: {
          type: 'string',
          pattern: '^[A-Za-z]+$',
        },
      },
    };
  }

  $beforeInsert() {
    this.createdAt = Date.now();
  }
}
