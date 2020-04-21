/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Request, UserCredentials } from 'hapi';
const logger = require('./')('summary');

interface SummaryRequest extends Request {
  app: {
    remoteAddressChain: string;
  };
}

interface SummaryResponse {
  isBoom: boolean;
  output: {
    statusCode: number;
  };
  statusCode: number;
  errno: number;
  stack: object;
}

interface SummaryLine {
  code: number;
  errno: number;
  method: 'get' | 'post' | 'patch' | 'put' | 'delete' | 'options';
  path: string;
  agent: string;
  t: number;
  client_id: string;
  auth: {
    user: UserCredentials | undefined;
    scope: string[] | undefined;
  };
  payload: string[];
  remoteAddressChain: string;
  stack?: object;
}

function parsePayload(payload: object): string[] {
  let payloadKeys = ['INVALID_PAYLOAD_OBJECT'];

  try {
    // given payload object might not be
    // a valid object. See issue #410
    payloadKeys = Object.keys(payload);
  } catch (e) {
    // failed to parse payload keys.
  }

  return payloadKeys;
}

module.exports = function summary(
  request: SummaryRequest,
  response: SummaryResponse
): void {
  if (request.method === 'options') {
    return;
  }

  const payload: {
    [key: string]: any;
  } = (request.payload as object) || {};
  const query = request.query || {};
  const params = request.params || {};

  const auth = request.auth &&
    request.auth.credentials && {
      user: request.auth.credentials.user,
      scope: request.auth.credentials.scope,
    };

  const line: SummaryLine = {
    code: response.isBoom ? response.output.statusCode : response.statusCode,
    errno: response.errno || 0,
    method: request.method,
    path: request.path,
    agent: request.headers['user-agent'],
    t: Date.now() - request.info.received,
    client_id: payload.client_id || query.client_id || params.client_id,
    auth: auth,
    payload: parsePayload(payload),
    remoteAddressChain: request.app.remoteAddressChain,
  };

  if (line.code >= 500) {
    line.stack = response.stack;
    logger.error('summary', line);
  } else {
    logger.info('summary', line);
  }
};
