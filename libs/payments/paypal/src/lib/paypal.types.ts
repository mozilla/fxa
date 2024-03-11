/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum BillingAgreementStatus {
  Active = 'active',
  Cancelled = 'cancelled',
}

export interface BillingAgreement {
  city: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  state: string;
  status: BillingAgreementStatus;
  street: string;
  street2: string;
  zip: string;
}
