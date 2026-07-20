/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {
  FreeAccessProjection,
  FreeAccessProjectionEntry,
} from '@fxa/shared/cms';

import { diffByEmail } from './diffByEmail';

const entry = (
  caps: Record<string, string[]>,
  offerings: string[] = ['vpn']
): FreeAccessProjectionEntry => ({
  capabilities: caps,
  offeringApiIdentifiers: offerings,
});

const projection = (
  pairs: Array<[string, FreeAccessProjectionEntry]>
): FreeAccessProjection => Object.fromEntries(pairs);

describe('diffByEmail', () => {
  it('returns an empty list when both projections are empty', () => {
    expect(diffByEmail({}, {})).toEqual([]);
  });

  it('returns an empty list when both projections are identical', () => {
    const same = projection([
      ['alice@example.com', entry({ 'client-a': ['vpn'] })],
    ]);
    expect(diffByEmail(same, same)).toEqual([]);
  });

  it('flags an email that appears only in after as changed (new)', () => {
    const result = diffByEmail(
      {},
      projection([['alice@example.com', entry({ 'client-a': ['vpn'] })]])
    );
    expect(result).toEqual(['alice@example.com']);
  });

  it('flags an email that appears only in before as changed (removed)', () => {
    const result = diffByEmail(
      projection([['stale@example.com', entry({ 'client-a': ['vpn'] })]]),
      {}
    );
    expect(result).toEqual(['stale@example.com']);
  });

  it('flags an email whose capability slugs differ between before and after', () => {
    const result = diffByEmail(
      projection([['alice@example.com', entry({ 'client-a': ['vpn-old'] })]]),
      projection([['alice@example.com', entry({ 'client-a': ['vpn-new'] })]])
    );
    expect(result).toEqual(['alice@example.com']);
  });

  it('flags an email when a clientId key is added or removed', () => {
    const result = diffByEmail(
      projection([['alice@example.com', entry({ 'client-a': ['vpn'] })]]),
      projection([
        [
          'alice@example.com',
          entry({ 'client-a': ['vpn'], 'client-b': ['relay'] }),
        ],
      ])
    );
    expect(result).toEqual(['alice@example.com']);
  });

  it('does not flag an email when only slug ordering changes', () => {
    const result = diffByEmail(
      projection([
        [
          'alice@example.com',
          entry({ 'client-a': ['vpn', 'relay'] }),
        ],
      ]),
      projection([
        [
          'alice@example.com',
          entry({ 'client-a': ['relay', 'vpn'] }),
        ],
      ])
    );
    expect(result).toEqual([]);
  });

  it('does not flag an email when only offeringApiIdentifiers change', () => {
    // The diff is intentionally capability-only: offering rename should
    // not wake every RP via profileDataChange.
    const result = diffByEmail(
      projection([
        ['alice@example.com', entry({ 'client-a': ['vpn'] }, ['vpn'])],
      ]),
      projection([
        ['alice@example.com', entry({ 'client-a': ['vpn'] }, ['vpn-2'])],
      ])
    );
    expect(result).toEqual([]);
  });

  it('returns every changed email when multiple emails change at once', () => {
    const before = projection([
      ['unchanged@example.com', entry({ 'client-a': ['vpn'] })],
      ['stale@example.com', entry({ 'client-a': ['vpn'] })],
      ['shifted@example.com', entry({ 'client-a': ['vpn-old'] })],
    ]);
    const after = projection([
      ['unchanged@example.com', entry({ 'client-a': ['vpn'] })],
      ['shifted@example.com', entry({ 'client-a': ['vpn-new'] })],
      ['fresh@example.com', entry({ 'client-a': ['vpn'] })],
    ]);
    expect(diffByEmail(before, after).sort()).toEqual([
      'fresh@example.com',
      'shifted@example.com',
      'stale@example.com',
    ]);
  });
});
