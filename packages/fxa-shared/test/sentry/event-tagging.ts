import { assert } from 'chai';
import { Event } from '@sentry/types';
import { tagCriticalEvent } from '../../tags/sentry';

describe('critical-endpoints', () => {
  it('adds critical tag to applicable event', () => {
    let data: any = {
      request: {
        url: 'https://example.com/a/123',
      },
    };

    data = tagCriticalEvent(data);

    assert.exists(data.tags?.['fxa.endpoint.type']);
    assert.equal(data.tags?.['fxa.endpoint.type'], 'critical');
  });

  it('does not add critical tag to no applicable event', () => {
    const data: Event = {
      request: {
        url: 'https://example.com/a-non-critical-endpoint',
      },
    };

    tagCriticalEvent(data);

    assert.notExists(data.tags?.['fxa.endpoint.importance']);
  });

  it('handles empty event', () => {
    const data: Event = {};

    tagCriticalEvent(data);

    assert.notExists(data.tags?.['fxa.endpoint.importance']);
  });

  it('handles empty url', () => {
    const data: Event = {
      request: {
        url: undefined,
      },
    };

    tagCriticalEvent(data);

    assert.notExists(data.tags?.['fxa.endpoint.importance']);
  });
});
