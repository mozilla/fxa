/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NormalizedAccessFactory } from '../factories';
import { projectAccess } from './projectAccess';

describe('projectAccess', () => {
  const NOW = new Date('2026-06-01T12:00:00.000Z');

  it('emits one record per email with merged capabilities and end-of-day expiry', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      internalName: 'VPN beta',
      offeringApiIdentifiers: ['vpn', 'relay'],
      capabilities: [
        {
          slug: 'vpn-beta',
          services: [
            { oauthClientId: 'CLIENT-A' },
            { oauthClientId: 'client-b' },
          ],
        },
        { slug: 'early-access', services: [{ oauthClientId: 'CLIENT-A' }] },
      ],
      emailLists: [
        {
          'Alice@Example.com': ['2026-12-31', 'VIP'],
          'bob@example.com': ['2027-06-15', 'Beta tester'],
        },
      ],
    });

    const result = projectAccess(input, NOW);

    expect(result.skipped).toEqual([]);
    expect(result.records).toHaveLength(2);

    const alice = result.records.find((r) => r.email === 'alice@example.com');
    expect(alice).toBeDefined();
    expect(alice?.entitlementId).toBe('ent-1');
    expect(alice?.internalName).toBe('VPN beta');
    expect(alice?.description).toBe('VIP');
    expect([...(alice?.capabilities['client-a'] ?? [])].sort()).toEqual([
      'early-access',
      'vpn-beta',
    ]);
    expect(alice?.capabilities['client-b']).toEqual(['vpn-beta']);
    // Expiry is start of day _after_ the named day so the named day stays
    // fully valid in every timezone.
    expect(alice?.expiresAt).toBe(
      new Date('2027-01-01T00:00:00.000Z').getTime()
    );
    expect(alice?.createdAt).toBe(NOW.getTime());
    expect([...(alice?.offeringApiIdentifiers ?? [])].sort()).toEqual([
      'relay',
      'vpn',
    ]);
  });

  it('dedupes offering apiIdentifiers and skips empty entries', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      offeringApiIdentifiers: ['vpn', 'vpn', '', 'relay'],
      emailLists: [{ 'user@example.com': ['2027-12-31', ''] }],
    });
    const result = projectAccess(input, NOW);
    expect(result.records[0]?.offeringApiIdentifiers).toEqual([
      'vpn',
      'relay',
    ]);
  });

  it('emits an empty offering list when none are linked', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      offeringApiIdentifiers: [],
      emailLists: [{ 'user@example.com': ['2027-12-31', ''] }],
    });
    const result = projectAccess(input, NOW);
    expect(result.records[0]?.offeringApiIdentifiers).toEqual([]);
  });

  it('skips entitlements missing a documentId', () => {
    const result = projectAccess(
      NormalizedAccessFactory({ documentId: '' }),
      NOW
    );
    expect(result.records).toEqual([]);
    expect(result.skipped).toEqual([{ reason: 'missing-document-id' }]);
  });

  it('skips entitlements with no resolvable capabilities (no services)', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      capabilities: [{ slug: 'orphan', services: [] }],
    });
    const result = projectAccess(input, NOW);
    expect(result.records).toEqual([]);
    expect(result.skipped).toEqual([
      { reason: 'no-capabilities', detail: { documentId: 'ent-1' } },
    ]);
  });

  it('skips the legacy plain-array email shape (no expiry available)', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      emailLists: [['alice@example.com', 'bob@example.com']],
    });
    const result = projectAccess(input, NOW);
    expect(result.records).toEqual([]);
    expect(result.skipped).toEqual([
      { reason: 'array-email-form', detail: { documentId: 'ent-1' } },
    ]);
  });

  it('skips matchers with non-object emails', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      emailLists: [null, 42, 'string'] as unknown as object[],
    });
    const result = projectAccess(input, NOW);
    expect(result.records).toEqual([]);
    expect(result.skipped.map((s) => s.reason)).toEqual([
      'malformed-emails',
      'malformed-emails',
      'malformed-emails',
    ]);
  });

  it('skips an empty email key', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      emailLists: [{ '': ['2026-12-31', 'd'] }],
    });
    const result = projectAccess(input, NOW);
    expect(result.records).toEqual([]);
    expect(result.skipped).toEqual([
      { reason: 'empty-email', detail: { documentId: 'ent-1' } },
    ]);
  });

  it('skips values that are not a [date, description] tuple', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      emailLists: [
        {
          'a@example.com': 'just-a-string',
          'b@example.com': [],
        },
      ],
    });
    const result = projectAccess(input, NOW);
    expect(result.records).toEqual([]);
    expect(result.skipped.map((s) => s.reason)).toEqual([
      'malformed-tuple',
      'malformed-tuple',
    ]);
  });

  it('accepts a missing description (date-only tuple) and writes empty string', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      emailLists: [{ 'a@example.com': ['2026-12-31'] }],
    });
    const result = projectAccess(input, NOW);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]?.description).toBe('');
  });

  it('accepts an explicit empty description and writes empty string', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      emailLists: [{ 'a@example.com': ['2026-12-31', ''] }],
    });
    const result = projectAccess(input, NOW);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]?.description).toBe('');
  });

  it('rejects invalid calendar dates (e.g. 2026-02-30)', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      emailLists: [{ 'a@example.com': ['2026-02-30', 'desc'] }],
    });
    const result = projectAccess(input, NOW);
    expect(result.records).toEqual([]);
    expect(result.skipped).toEqual([
      {
        reason: 'invalid-date',
        detail: { documentId: 'ent-1', email: 'a@example.com', value: '2026-02-30' },
      },
    ]);
  });

  it('rejects dates that do not match YYYY-MM-DD', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      emailLists: [
        { 'a@example.com': ['12/31/2026', 'desc'] },
        { 'b@example.com': ['2026-1-1', 'desc'] },
      ],
    });
    const result = projectAccess(input, NOW);
    expect(result.records).toEqual([]);
    expect(result.skipped.map((s) => s.reason)).toEqual([
      'invalid-date',
      'invalid-date',
    ]);
  });

  it('skips entries whose expiry has already passed', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      emailLists: [{ 'a@example.com': ['2026-05-01', 'desc'] }],
    });
    const result = projectAccess(input, NOW);
    expect(result.records).toEqual([]);
    expect(result.skipped).toEqual([
      { reason: 'past-expiry', detail: { documentId: 'ent-1', email: 'a@example.com' } },
    ]);
  });

  it('drops capabilities whose slug or services are missing', () => {
    const input = NormalizedAccessFactory({
      documentId: 'ent-1',
      capabilities: [
        { slug: 'vpn-beta', services: [{ oauthClientId: 'CLIENT-A' }] },
        { slug: '', services: [{ oauthClientId: 'CLIENT-X' }] },
        { slug: 'orphan-cap', services: [] },
        { slug: 'no-client', services: [{ oauthClientId: '' }] },
      ],
      emailLists: [{ 'a@example.com': ['2026-12-31', ''] }],
    });
    const result = projectAccess(input, NOW);
    expect(Object.keys(result.records[0]?.capabilities ?? {})).toEqual([
      'client-a',
    ]);
    expect(result.records[0]?.capabilities['client-a']).toEqual(['vpn-beta']);
  });
});
