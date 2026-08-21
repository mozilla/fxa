/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SentryConfigOpts } from '../models/SentryConfigOpts';
import { beforeSend } from './beforeSend.client';
import { applyCommonTags, SentryTags } from './tags';
import * as Sentry from '@sentry/nextjs';

const config: SentryConfigOpts = {
  release: 'v0.0.0',
  sentry: {
    dsn: 'https://public:private@host:8080/1',
    env: 'test',
    clientName: 'fxa-shared-testing',
    sampleRate: 0,
  },
};

describe('beforeSend', () => {
  it('works without request url', () => {
    const data = {
      key: 'value',
    } as unknown as Sentry.ErrorEvent;

    const resultData = beforeSend(config, data);

    expect(data).toEqual(resultData);
  });

  it('fingerprints errno', () => {
    const data = {
      request: {
        url: 'https://example.com',
      },
      tags: {
        errno: '100',
      },
      type: undefined,
    } as Sentry.ErrorEvent;

    const resultData = beforeSend(config, data);
    expect(resultData?.fingerprint?.[0]).toEqual('errno100');
    expect(resultData?.level).toEqual('info');
  });

  it('doesn\t send data if metricsOptOut tag is set and true', () => {
    const data = {
      key: 'value',
      tags: {
        metricsOptedOut: true,
      },
    } as unknown as Sentry.ErrorEvent;
    const resultData = beforeSend(config, data);
    expect(resultData).toBeNull();
  });

  it('sends data if metricsOptOut tag is set and false', () => {
    const data = {
      key: 'value',
      tags: {
        metricsOptedOut: false,
      },
    } as unknown as Sentry.ErrorEvent;
    const resultData = beforeSend(config, data);
    expect(data).toEqual(resultData);
  });

  it('tags the client name', () => {
    const data = { key: 'value' } as unknown as Sentry.ErrorEvent;

    const resultData = beforeSend(config, data);

    expect(resultData?.tags?.[SentryTags.NAME]).toEqual('fxa-shared-testing');
  });

  it('tags the runtime as browser', () => {
    const data = { key: 'value' } as unknown as Sentry.ErrorEvent;

    const resultData = beforeSend(config, data);

    expect(resultData?.tags?.[SentryTags.RUNTIME]).toEqual('browser');
  });

  it('tags an event with an errno as a known error', () => {
    const data = { tags: { errno: '100' } } as unknown as Sentry.ErrorEvent;

    const resultData = beforeSend(config, data);

    expect(resultData?.tags?.[SentryTags.KNOWN_ERROR]).toBe(true);
  });

  it('tags an event without an errno as not a known error', () => {
    const data = { key: 'value' } as unknown as Sentry.ErrorEvent;

    const resultData = beforeSend(config, data);

    expect(resultData?.tags?.[SentryTags.KNOWN_ERROR]).toBe(false);
  });
});

describe('applyCommonTags', () => {
  it('tags the runtime as server', () => {
    const event = applyCommonTags(
      {},
      { name: 'fxa-auth-server', runtime: 'server' }
    );

    expect(event.tags[SentryTags.RUNTIME]).toEqual('server');
  });

  it('tags the given name', () => {
    const event = applyCommonTags(
      {},
      { name: 'fxa-auth-server', runtime: 'server' }
    );

    expect(event.tags[SentryTags.NAME]).toEqual('fxa-auth-server');
  });

  it('tags the name as unknown when no name is given', () => {
    const event = applyCommonTags({}, { runtime: 'server' });

    expect(event.tags[SentryTags.NAME]).toEqual('unknown');
  });

  it('keeps tags that are already set', () => {
    const event = applyCommonTags(
      { tags: { errno: 100 } },
      { name: 'fxa-settings', runtime: 'browser' }
    );

    expect(event.tags.errno).toEqual(100);
  });
});
