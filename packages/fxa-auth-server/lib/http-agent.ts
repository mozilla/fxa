/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Agent from 'agentkeepalive';

/**
 * Creates an HTTP agent using the `agentkeepalive` library.
 *
 * @param {number} [maxSockets=100] - The maximum number of sockets to be opened per host.
 * @param {number} [maxFreeSockets=10] - The maximum number of free sockets to keep open for a host.
 * @param {number} [timeoutMs=60000] - The timeout in milliseconds for the sockets.
 * @param {number} [freeSocketTimeoutMs=30000] - The time in milliseconds for which a socket should remain open while unused.
 * @returns {Agent} An instance of Agent, configured with the specified settings.
 */
export function createHttpAgent(
  maxSockets = 1000,
  maxFreeSockets = 10,
  timeoutMs = 30000,
  freeSocketTimeoutMs = 15000
) {
  return new Agent({
    maxSockets,
    maxFreeSockets,
    timeout: timeoutMs,
    freeSocketTimeout: freeSocketTimeoutMs,
  });
}

/**
 * Creates an HTTPS agent using the `agentkeepalive` library.
 *
 * @param {number} [maxSockets=100] - The maximum number of sockets to be opened per host for HTTPS requests.
 * @param {number} [maxFreeSockets=10] - The maximum number of free sockets to keep open for a host for HTTPS requests.
 * @param {number} [timeoutMs=60000] - The timeout in milliseconds for the sockets for HTTPS requests.
 * @param {number} [freeSocketTimeoutMs=30000] - The time in milliseconds for which a socket should remain open while unused for HTTPS requests.
 * @returns {Agent.HttpsAgent} An instance of Agent.HttpsAgent, configured with the specified settings.
 */
export function createHttpsAgent(
  maxSockets = 1000,
  maxFreeSockets = 10,
  timeoutMs = 30000,
  freeSocketTimeoutMs = 15000
) {
  return new Agent.HttpsAgent({
    maxSockets,
    maxFreeSockets,
    timeout: timeoutMs,
    freeSocketTimeout: freeSocketTimeoutMs,
  });
}
