/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MockedResponse } from '@apollo/client/testing';
import { BlockStatus } from 'fxa-admin-server/src/graphql';
import { GET_RATE_LIMITS } from './index.gql';

export const mockBlockStatusData1: BlockStatus = {
  retryAfter: 1800000, // 30 minutes in milliseconds
  reason: 'Too many requests',
  action: 'login',
  blockingOn: 'ip_email',
  startTime: 1760454159000,
  duration: 3600, // 1 hour in seconds
  attempt: 5,
  policy: 'block',
};

export const mockBlockStatusData2: BlockStatus = {
  retryAfter: 600000, // 10 minutes in milliseconds
  reason: 'Suspicious activity detected',
  action: 'passwordChange',
  blockingOn: 'uid',
  startTime: 1760457759000,
  duration: 7200, // 2 hours in seconds
  attempt: 3,
  policy: 'block',
};

export const mockBanStatusData: BlockStatus = {
  retryAfter: 86400000, // 24 hours in milliseconds
  reason: 'Ban reason',
  action: 'accountLoginFailed',
  blockingOn: 'email',
  startTime: 1760450000000,
  duration: 86400, // 24 hours in seconds
  attempt: 10,
  policy: 'ban',
};

// Apollo mocks
export class GetRateLimits {
  static request(ip?: string, email?: string, uid?: string) {
    return {
      query: GET_RATE_LIMITS,
      variables: {
        ip: ip || undefined,
        email: email || undefined,
        uid: uid || undefined,
      },
    };
  }

  static result(rateLimits: BlockStatus[]) {
    return {
      data: {
        rateLimits: rateLimits,
      },
    };
  }

  static mock(
    rateLimits: BlockStatus[],
    ip?: string,
    email?: string,
    uid?: string,
    error?: Error
  ): MockedResponse {
    const mockResponse: MockedResponse = {
      request: this.request(ip, email, uid),
      result: this.result(rateLimits),
    };

    if (error) {
      mockResponse.error = error;
      delete mockResponse.result;
    }

    return mockResponse;
  }

  static emptyMock(ip?: string, email?: string, uid?: string): MockedResponse {
    return this.mock([], ip, email, uid);
  }

  static nonEmptyMock(
    ip?: string,
    email?: string,
    uid?: string
  ): MockedResponse {
    return this.mock(
      [mockBlockStatusData1, mockBlockStatusData2, mockBanStatusData],
      ip,
      email,
      uid
    );
  }

  static errorMock(ip?: string, email?: string, uid?: string): MockedResponse {
    return this.mock(
      [],
      ip,
      email,
      uid,
      new Error('Failed to fetch rate limits')
    );
  }
}
