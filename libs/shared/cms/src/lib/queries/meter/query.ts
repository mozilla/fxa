/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type { MeterBySlugResult, MeterBySlugVariables } from './types';

/**
 * Hand-typed `TypedDocumentNode` for the meter-by-slug query. We parse a plain
 * GraphQL string at module load and annotate the resulting `DocumentNode` with
 * the variables/result types we expect. The Strapi codegen pipeline currently
 * runs against a live Strapi schema (see `libs/shared/cms/codegen.config.ts`)
 * and the `meter` content type hasn't been deployed yet, so we cannot use the
 * generated `graphql()` tag for this query today.
 *
 * `TypedDocumentNode<R, V> extends DocumentNode` with an _optional_ phantom
 * field, so a `DocumentNode` is structurally assignable to it without a cast.
 * Once the Strapi schema is deployed we should switch this over to the codegen
 * `graphql()` tag from `@fxa/shared/cms`.
 */
export const meterBySlugQuery: TypedDocumentNode<
  MeterBySlugResult,
  MeterBySlugVariables
> = parse(`
  query MeterBySlug($slug: String!) {
    meters(filters: { slug: { eq: $slug } }, pagination: { limit: 1 }) {
      slug
      unit
      limit
      window
      notificationThresholds
      webhooks {
        url
        signingClientId
      }
    }
  }
`);
