/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Escape a value for safe embedding inside a single-quoted Stripe search
 * query string (e.g. `metadata['playSkuIds']:'<value>'`).
 *
 * Stripe's search query language treats backslash as the escape character
 * within quoted string values, so any literal backslash or single quote in
 * the value must be escaped to prevent it from breaking out of, or altering,
 * the search expression.
 *
 * @see https://docs.stripe.com/search#search-query-language
 */
export function escapeStripeSearchValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
