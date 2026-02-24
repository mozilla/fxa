/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';

/**
 * Error shape returned by auth server API calls.
 */
export interface AuthServerError extends Error {
  errno: number;
  code: number;
  email?: string;
}

function getFlowIdKey(): string {
  const configPath = require.resolve('../../../config');
  delete require.cache[configPath];
  const config = require('../../../config').default.getProperties();
  return config.metrics.flow_id_key;
}

/**
 * Generates a valid metricsContext with HMAC-signed flowId for use in
 * integration tests. Reads the HMAC key from the auth server config.
 */
export function generateMetricsContext(): { flowBeginTime: number; flowId: string } {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const flowBeginTime = Date.now();
  const flowSignature = crypto
    .createHmac('sha256', getFlowIdKey())
    .update([randomBytes, flowBeginTime.toString(16)].join('\n'))
    .digest('hex')
    .substring(0, 32);
  return { flowBeginTime, flowId: randomBytes + flowSignature };
}
