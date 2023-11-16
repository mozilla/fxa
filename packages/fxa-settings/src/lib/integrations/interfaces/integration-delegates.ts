/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Delegates interface that acts as a set of callbacks to fetch external state for the relier factory.
 */
export interface IntegrationDelegates {
  getClientInfo: (clientId: any) => Promise<Record<string, unknown>>;
  getProductInfo: (subscriptionId: string) => Promise<{ productName?: string }>;
  getProductIdFromRoute: () => string;
}
