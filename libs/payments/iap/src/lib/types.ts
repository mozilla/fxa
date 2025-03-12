/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface FirestorePurchaseRecord {
  id: string;
  userId: string;
  formOfPayment: string;
  skuType: string;
  sku: string;
  isMutable: boolean;
  productId: string;
  packageName: string;
  bundleId: string;
}
