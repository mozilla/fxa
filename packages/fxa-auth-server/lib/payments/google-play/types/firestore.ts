/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Represents the plan blob that is returned to the client as-is.
 *
 * Document ID: appName
 *
 * These documents are named with the app name that should be used to
 * retrieve the document by the client.
 *
 * They store all plans available for this app, whether for Google or
 * Apple and are intended for consumption by the relying party that
 * services the subscription.
 */
export interface IapConfig {
  packageName: string;
  plans: any;
}
