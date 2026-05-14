/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { AccessesQuery } from '../../../__generated__/graphql';
import { AccessUtil } from './util';

const NOW = new Date('2026-06-01T12:00:00.000Z').getTime();

/**
 * Build a minimal `AccessesQuery` with a single email→matcher wiring —
 * keeps each test focused on the specific projection behaviour.
 */
function buildQuery(
  accesses: Array<{
    documentId: string;
    offerings: Array<{
      apiIdentifier?: string;
      capabilities: Array<{
        slug: string;
        oauthClientId: string;
      }>;
    }>;
    emails: Record<string, [string, string]>;
  }>
): AccessesQuery {
  return {
    accesses: accesses.map((a) => ({
      documentId: a.documentId,
      internalName: `internal-${a.documentId}`,
      offerings: a.offerings.map((o) => ({
        apiIdentifier: o.apiIdentifier ?? null,
        capabilities: o.capabilities.map((c) => ({
          slug: c.slug,
          services: [{ oauthClientId: c.oauthClientId }],
        })),
      })),
      matchers: [
        {
          __typename: 'ComponentMatchersEmailList',
          emails: a.emails,
        },
      ],
    })),
  } as unknown as AccessesQuery;
}

describe('AccessUtil.project', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns an empty projection when the query has no accesses', () => {
    const result = new AccessUtil({
      accesses: [],
    } as unknown as AccessesQuery).project();
    expect(result).toEqual({});
  });

  it('returns an empty projection when the query.accesses field is missing', () => {
    const result = new AccessUtil({} as unknown as AccessesQuery).project();
    expect(result).toEqual({});
  });

  it('projects a single email→access into a one-entry map', () => {
    const query = buildQuery([
      {
        documentId: 'ent-1',
        offerings: [
          {
            apiIdentifier: 'vpn',
            capabilities: [{ slug: 'vpn', oauthClientId: 'client-a' }],
          },
        ],
        emails: { 'alice@example.com': ['2099-01-01', ''] },
      },
    ]);

    expect(new AccessUtil(query).project()).toEqual({
      'alice@example.com': {
        capabilities: { 'client-a': ['vpn'] },
        offeringApiIdentifiers: ['vpn'],
      },
    });
  });

  it('lowercases the projection email key', () => {
    const query = buildQuery([
      {
        documentId: 'ent-1',
        offerings: [
          {
            apiIdentifier: 'vpn',
            capabilities: [{ slug: 'vpn', oauthClientId: 'client-a' }],
          },
        ],
        emails: { 'Alice@Example.com': ['2099-01-01', ''] },
      },
    ]);

    expect(Object.keys(new AccessUtil(query).project())).toEqual([
      'alice@example.com',
    ]);
  });

  it('lowercases the oauthClientId key', () => {
    const query = buildQuery([
      {
        documentId: 'ent-1',
        offerings: [
          {
            apiIdentifier: 'vpn',
            capabilities: [{ slug: 'vpn', oauthClientId: 'Client-A' }],
          },
        ],
        emails: { 'alice@example.com': ['2099-01-01', ''] },
      },
    ]);

    expect(
      new AccessUtil(query).project()['alice@example.com']?.capabilities
    ).toEqual({ 'client-a': ['vpn'] });
  });

  it('merges capabilities across two accesses granting the same email', () => {
    const query = buildQuery([
      {
        documentId: 'ent-a',
        offerings: [
          {
            apiIdentifier: 'vpn',
            capabilities: [{ slug: 'cap-1', oauthClientId: 'client-1' }],
          },
        ],
        emails: { 'user@example.com': ['2099-01-01', ''] },
      },
      {
        documentId: 'ent-b',
        offerings: [
          {
            apiIdentifier: 'relay',
            capabilities: [{ slug: 'cap-2', oauthClientId: 'client-1' }],
          },
        ],
        emails: { 'user@example.com': ['2099-01-01', ''] },
      },
    ]);

    const entry = new AccessUtil(query).project()['user@example.com'];
    expect([...entry.capabilities['client-1']].sort()).toEqual([
      'cap-1',
      'cap-2',
    ]);
    expect([...entry.offeringApiIdentifiers].sort()).toEqual(['relay', 'vpn']);
  });

  it('dedupes duplicate slugs across accesses for the same clientId', () => {
    const query = buildQuery([
      {
        documentId: 'ent-a',
        offerings: [
          {
            apiIdentifier: 'vpn',
            capabilities: [{ slug: 'vpn', oauthClientId: 'client-1' }],
          },
        ],
        emails: { 'user@example.com': ['2099-01-01', ''] },
      },
      {
        documentId: 'ent-b',
        offerings: [
          {
            apiIdentifier: 'vpn',
            capabilities: [{ slug: 'vpn', oauthClientId: 'client-1' }],
          },
        ],
        emails: { 'user@example.com': ['2099-01-01', ''] },
      },
    ]);

    const entry = new AccessUtil(query).project()['user@example.com'];
    expect(entry.capabilities['client-1']).toEqual(['vpn']);
    expect(entry.offeringApiIdentifiers).toEqual(['vpn']);
  });

  it('dedupes duplicate offering apiIdentifiers across accesses', () => {
    const query = buildQuery([
      {
        documentId: 'ent-a',
        offerings: [
          {
            apiIdentifier: 'vpn',
            capabilities: [{ slug: 'cap-1', oauthClientId: 'client-1' }],
          },
        ],
        emails: { 'user@example.com': ['2099-01-01', ''] },
      },
      {
        documentId: 'ent-b',
        offerings: [
          {
            apiIdentifier: 'vpn', // duplicate — must dedupe
            capabilities: [{ slug: 'cap-2', oauthClientId: 'client-1' }],
          },
        ],
        emails: { 'user@example.com': ['2099-01-01', ''] },
      },
    ]);

    const entry = new AccessUtil(query).project()['user@example.com'];
    expect(entry.offeringApiIdentifiers).toEqual(['vpn']);
  });

  it('emits one projection entry per email regardless of how many matchers reference it', () => {
    const query = buildQuery([
      {
        documentId: 'ent-1',
        offerings: [
          {
            apiIdentifier: 'vpn',
            capabilities: [{ slug: 'vpn', oauthClientId: 'client-a' }],
          },
        ],
        emails: {
          'alice@example.com': ['2099-01-01', ''],
          'bob@example.com': ['2099-01-01', ''],
        },
      },
    ]);

    expect(Object.keys(new AccessUtil(query).project()).sort()).toEqual([
      'alice@example.com',
      'bob@example.com',
    ]);
  });

  it('skips accesses with no capabilities (projector rejects them)', () => {
    const query = buildQuery([
      {
        documentId: 'ent-empty',
        offerings: [{ apiIdentifier: 'vpn', capabilities: [] }],
        emails: { 'user@example.com': ['2099-01-01', ''] },
      },
    ]);

    expect(new AccessUtil(query).project()).toEqual({});
  });

  it('skips access entries whose grant has already expired', () => {
    const query = buildQuery([
      {
        documentId: 'ent-stale',
        offerings: [
          {
            apiIdentifier: 'vpn',
            capabilities: [{ slug: 'vpn', oauthClientId: 'client-a' }],
          },
        ],
        emails: { 'user@example.com': ['2024-01-01', ''] },
      },
    ]);

    expect(new AccessUtil(query).project()).toEqual({});
  });

  it('excludes offerings with no apiIdentifier from the deduped list', () => {
    const query = buildQuery([
      {
        documentId: 'ent-1',
        offerings: [
          {
            // no apiIdentifier
            capabilities: [{ slug: 'vpn', oauthClientId: 'client-a' }],
          },
        ],
        emails: { 'user@example.com': ['2099-01-01', ''] },
      },
    ]);

    const entry = new AccessUtil(query).project()['user@example.com'];
    expect(entry.capabilities).toEqual({ 'client-a': ['vpn'] });
    expect(entry.offeringApiIdentifiers).toEqual([]);
  });
});
