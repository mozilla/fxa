/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface StrapiValidationWebhookPayload {
  event: string;
  createdAt: string;
  model: string;
  entry: {
    id: number;
    documentId: string;
    [key: string]: unknown;
  };
}

/**
 * Webhook payload Strapi sends when a `business-entitlement` entry (or
 * any other model) is created / updated / unpublished. We only care
 * about `business-entitlement` events; the matchers and capabilities
 * are nested in `entry`.
 *
 * Component shapes inside the dynamic-zone `matchers` field use
 * `__component: '<category>.<name>'` (REST serialization) — different
 * from the GraphQL `__typename` form. We dispatch by field presence
 * (`email`, `emails`, `domain`) to stay resilient to component name
 * changes.
 */
export interface StrapiEmailCapabilityListWebhookPayload {
  event: string;
  model?: string;
  uid?: string;
  createdAt?: string;
  entry?: {
    id?: number;
    documentId?: string;
    internalName?: string;
    description?: string | null;
    publishedAt?: string | null;
    capabilities?: Array<{
      id?: number;
      slug?: string;
      [k: string]: unknown;
    }>;
    matchers?: Array<{
      __component?: string;
      id?: number;
      emails?: unknown;
      [k: string]: unknown;
    }>;
    [k: string]: unknown;
  };
}
