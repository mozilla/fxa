/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// REST API error (non-2xx HTTP response from apiFetch)
export const REST_API_ERROR = new Error('API error 400: Bad Request');

// Network-level failure (e.g. fetch could not reach the server)
export const NETWORK_ERROR = new Error('Failed to fetch');
