/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as Sentry from '@sentry/node';

import { StrapiClient } from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import type { StatsD } from 'hot-shots';

import { AuthServerEmailCapabilityClient } from './auth-server-email-capability.client';
import { EmailCapabilityWebhookService } from './email-capability-webhook.service';
import type { StrapiEmailCapabilityListWebhookPayload } from './cms-webhooks.types';

jest.mock('@sentry/node', () => {
  const actual = jest.requireActual('@sentry/node');
  return {
    ...actual,
    captureException: jest.fn(),
  };
});

const buildPayload = (
  overrides: Partial<StrapiEmailCapabilityListWebhookPayload> = {}
): StrapiEmailCapabilityListWebhookPayload => ({
  event: 'entry.update',
  model: 'business-entitlement',
  uid: 'api::business-entitlement.business-entitlement',
  createdAt: new Date().toISOString(),
  entry: {
    id: 1,
    documentId: 'doc-abc',
    internalName: 'mozilla-vpn-email-list',
    capabilities: [{ id: 1, slug: 'cap-vpn' }],
    matchers: [
      {
        __component: 'matchers.email-list',
        id: 1,
        emails: ['one@example.com'],
      },
    ],
    ...overrides.entry,
  },
  ...overrides,
});

describe('EmailCapabilityWebhookService', () => {
  let service: EmailCapabilityWebhookService;
  let mockStrapiClient: { verifyWebhookSignature: jest.Mock };
  let mockAuthServerClient: { notifyChange: jest.Mock };
  let statsd: { increment: jest.Mock; timing: jest.Mock };
  let logger: { error: jest.Mock; log: jest.Mock };

  beforeEach(async () => {
    logger = { error: jest.fn(), log: jest.fn() };
    statsd = { increment: jest.fn(), timing: jest.fn() };
    mockStrapiClient = {
      verifyWebhookSignature: jest.fn().mockReturnValue(true),
    };
    mockAuthServerClient = {
      notifyChange: jest
        .fn()
        .mockResolvedValue({ applied: 1, unknownAccount: 0 }),
    };

    const module = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: logger },
        EmailCapabilityWebhookService,
        { provide: StrapiClient, useValue: mockStrapiClient },
        {
          provide: AuthServerEmailCapabilityClient,
          useValue: mockAuthServerClient,
        },
        { provide: StatsDService, useValue: statsd as unknown as StatsD },
      ],
    }).compile();

    service = module.get(EmailCapabilityWebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid Strapi signature', async () => {
    mockStrapiClient.verifyWebhookSignature.mockReturnValue(false);

    await service.handleEmailCapabilityListWebhook(
      'Bearer wrong',
      buildPayload()
    );

    expect(statsd.increment).toHaveBeenCalledWith(
      'email_capability_list.auth.error'
    );
    expect(mockAuthServerClient.notifyChange).not.toHaveBeenCalled();
  });

  it('skips events outside the allowed set', async () => {
    await service.handleEmailCapabilityListWebhook(
      'Bearer valid',
      buildPayload({ event: 'entry.delete' })
    );

    expect(mockAuthServerClient.notifyChange).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith(
      'email_capability_list.skipped',
      { reason: 'event' }
    );
  });

  it('skips webhooks for other models', async () => {
    await service.handleEmailCapabilityListWebhook(
      'Bearer valid',
      buildPayload({ model: 'business' })
    );

    expect(mockAuthServerClient.notifyChange).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith(
      'email_capability_list.skipped',
      { reason: 'model' }
    );
  });

  it('expands an email-list matcher into one change per email', async () => {
    await service.handleEmailCapabilityListWebhook(
      'Bearer valid',
      buildPayload({
        entry: {
          documentId: 'doc-list',
          capabilities: [{ id: 1, slug: 'cap-list' }],
          matchers: [
            {
              __component: 'matchers.email-list',
              id: 2,
              emails: ['Alice@Example.com', 'bob@example.com'],
            },
          ],
        },
      })
    );

    expect(mockAuthServerClient.notifyChange).toHaveBeenCalledWith({
      changes: [
        { email: 'alice@example.com', added: ['cap-list'] },
        { email: 'bob@example.com', added: ['cap-list'] },
      ],
    });
  });

  it('dedupes emails across multiple email-list matchers', async () => {
    await service.handleEmailCapabilityListWebhook(
      'Bearer valid',
      buildPayload({
        entry: {
          documentId: 'doc-mixed',
          capabilities: [
            { id: 1, slug: 'cap-A' },
            { id: 2, slug: 'cap-B' },
          ],
          matchers: [
            {
              __component: 'matchers.email-list',
              emails: ['one@example.com'],
            },
            {
              __component: 'matchers.email-list',
              emails: ['one@example.com', 'two@example.com'],
            },
          ],
        },
      })
    );

    expect(mockAuthServerClient.notifyChange).toHaveBeenCalledWith({
      changes: [
        { email: 'one@example.com', added: ['cap-A', 'cap-B'] },
        { email: 'two@example.com', added: ['cap-A', 'cap-B'] },
      ],
    });
  });

  it('skips when capabilities are empty', async () => {
    await service.handleEmailCapabilityListWebhook(
      'Bearer valid',
      buildPayload({
        entry: {
          documentId: 'doc-no-caps',
          capabilities: [],
          matchers: [
            {
              __component: 'matchers.email-list',
              emails: ['one@example.com'],
            },
          ],
        },
      })
    );

    expect(mockAuthServerClient.notifyChange).not.toHaveBeenCalled();
  });

  it('records a metric on successful forward', async () => {
    mockAuthServerClient.notifyChange.mockResolvedValue({
      applied: 2,
      unknownAccount: 1,
    });

    await service.handleEmailCapabilityListWebhook(
      'Bearer valid',
      buildPayload()
    );

    expect(statsd.increment).toHaveBeenCalledWith(
      'email_capability_list.forwarded',
      { applied: '2', unknown: '1' }
    );
  });

  it('captures auth-server failures without throwing', async () => {
    const boom = new Error('auth-server down');
    mockAuthServerClient.notifyChange.mockRejectedValue(boom);

    await service.handleEmailCapabilityListWebhook(
      'Bearer valid',
      buildPayload()
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(boom);
    expect(statsd.increment).toHaveBeenCalledWith(
      'email_capability_list.forward.error'
    );
  });
});
