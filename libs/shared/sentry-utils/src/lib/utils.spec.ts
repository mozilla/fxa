/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Event } from '@sentry/core';
import { tagCriticalEvent } from './utils';

describe('tagCriticalEvent', () => {
  it('adds critical tag to applicable event', () => {
    const data: Event = {
      request: {
        url: 'https://example.com/a/123',
      },
    };

    tagCriticalEvent(data);

    expect(data.tags?.['fxa.endpoint.type']).toBe('critical');
  });

  it('tags any parsable url, because CRITICAL_ENDPOINTS includes "/"', () => {
    const data: Event = {
      request: {
        url: 'https://example.com/a-non-critical-endpoint',
      },
    };

    tagCriticalEvent(data);

    expect(data.tags?.['fxa.endpoint.type']).toBe('critical');
  });

  it('handles unparsable url', () => {
    const data: Event = {
      request: {
        url: '/v1/account/login',
      },
    };

    tagCriticalEvent(data);

    expect(data.tags?.['fxa.endpoint.type']).toBeUndefined();
  });

  it('handles empty event', () => {
    const data: Event = {};

    tagCriticalEvent(data);

    expect(data.tags).toBeUndefined();
  });

  it('handles empty url', () => {
    const data: Event = {
      request: {
        url: undefined,
      },
    };

    tagCriticalEvent(data);

    expect(data.tags).toBeUndefined();
  });
});
