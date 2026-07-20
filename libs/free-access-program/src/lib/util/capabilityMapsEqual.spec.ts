/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { capabilityMapsEqual } from './capabilityMapsEqual';

describe('capabilityMapsEqual', () => {
  it('returns true for two empty maps', () => {
    expect(capabilityMapsEqual({}, {})).toBe(true);
  });

  it('returns true for identical single-clientId maps', () => {
    expect(
      capabilityMapsEqual(
        { 'client-a': ['vpn'] },
        { 'client-a': ['vpn'] }
      )
    ).toBe(true);
  });

  it('returns true regardless of slug ordering inside a clientId', () => {
    expect(
      capabilityMapsEqual(
        { 'client-a': ['vpn', 'relay'] },
        { 'client-a': ['relay', 'vpn'] }
      )
    ).toBe(true);
  });

  it('returns true regardless of clientId key insertion order', () => {
    expect(
      capabilityMapsEqual(
        { 'client-a': ['vpn'], 'client-b': ['relay'] },
        { 'client-b': ['relay'], 'client-a': ['vpn'] }
      )
    ).toBe(true);
  });

  it('returns false when the two maps have different clientId keys', () => {
    expect(
      capabilityMapsEqual(
        { 'client-a': ['vpn'] },
        { 'client-b': ['vpn'] }
      )
    ).toBe(false);
  });

  it('returns false when one map has more clientId keys than the other', () => {
    expect(
      capabilityMapsEqual(
        { 'client-a': ['vpn'] },
        { 'client-a': ['vpn'], 'client-b': ['relay'] }
      )
    ).toBe(false);
  });

  it('returns false when slug counts differ for the same clientId', () => {
    expect(
      capabilityMapsEqual(
        { 'client-a': ['vpn'] },
        { 'client-a': ['vpn', 'relay'] }
      )
    ).toBe(false);
  });

  it('returns false when slug values differ for the same clientId', () => {
    expect(
      capabilityMapsEqual(
        { 'client-a': ['vpn'] },
        { 'client-a': ['relay'] }
      )
    ).toBe(false);
  });

  it('returns false comparing an empty map against a non-empty map', () => {
    expect(capabilityMapsEqual({}, { 'client-a': ['vpn'] })).toBe(false);
    expect(capabilityMapsEqual({ 'client-a': ['vpn'] }, {})).toBe(false);
  });
});
