/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { AuthServerEmailCapabilityConfig } from './auth-server-email-capability.config';

export interface EmailCapabilityChangeRequest {
  eventCreatedAt?: number;
  changes: Array<{
    email: string;
    added?: string[];
    removed?: string[];
  }>;
}

export interface EmailCapabilityChangeResponse {
  applied: number;
  unknownAccount: number;
}

export class AuthServerEmailCapabilityClientError extends Error {
  constructor(
    public readonly status: number,
    body: string
  ) {
    super(
      `Auth-server email-capability call failed: status=${status} body=${body}`
    );
    this.name = 'AuthServerEmailCapabilityClientError';
  }
}

/**
 * Posts an email-capability list change to auth-server.
 *
 * TODO(FXA-XXXXX): Temporary indirection — payments-api should emit an
 * event that auth-server consumes once that infra is in place.
 */
@Injectable()
export class AuthServerEmailCapabilityClient {
  constructor(private config: AuthServerEmailCapabilityConfig) {}

  async notifyChange(
    payload: EmailCapabilityChangeRequest
  ): Promise<EmailCapabilityChangeResponse> {
    const url = `${this.config.baseUrl.replace(
      /\/$/,
      ''
    )}/oauth/subscriptions/email-capability-changed`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `${this.config.subscriptionsSecret}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new AuthServerEmailCapabilityClientError(response.status, body);
    }

    return (await response.json()) as EmailCapabilityChangeResponse;
  }
}
