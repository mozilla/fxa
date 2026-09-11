/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  displayablePermissions,
  hasSeenPermissions,
  needsPermissions,
  recordSeenPermissions,
} from './permissions';
import { getAccountByUid } from '../cache';
import { persistAccount } from '../storage-utils';

jest.mock('../cache', () => ({ getAccountByUid: jest.fn() }));
jest.mock('../storage-utils', () => ({ persistAccount: jest.fn() }));

const mockGetAccountByUid = getAccountByUid as jest.Mock;
const mockPersistAccount = persistAccount as jest.Mock;

const UID = 'a'.repeat(32);
const CLIENT_ID = '325b4083e32fe8e7';
const UNTRUSTED_SCOPES = [
  'openid',
  'profile:display_name',
  'profile:email',
  'profile:uid',
];

beforeEach(() => {
  jest.resetAllMocks();
  mockGetAccountByUid.mockReturnValue({ uid: UID });
});

describe('displayablePermissions', () => {
  it('drops scopes that name no profile information', () => {
    expect(displayablePermissions(UNTRUSTED_SCOPES)).toEqual([
      'profile:email',
      'profile:display_name',
    ]);
  });

  it('returns display order, not the order the relying party sent', () => {
    expect(
      displayablePermissions(['profile:display_name', 'profile:email'])
    ).toEqual(['profile:email', 'profile:display_name']);
  });

  it('drops profile:avatar, which an untrusted client can never hold', () => {
    expect(displayablePermissions(['profile:email', 'profile:avatar'])).toEqual(
      ['profile:email']
    );
  });

  it('returns an empty list when no scope can be described', () => {
    expect(displayablePermissions(['openid', 'profile:uid'])).toEqual([]);
  });
});

describe('hasSeenPermissions', () => {
  it('is false when the account has seen nothing for the client', () => {
    expect(hasSeenPermissions(UID, CLIENT_ID, ['profile:email'])).toBe(false);
  });

  it('is true when every scope was seen', () => {
    mockGetAccountByUid.mockReturnValue({
      uid: UID,
      grantedPermissions: {
        [CLIENT_ID]: ['profile:email', 'profile:display_name'],
      },
    });
    expect(
      hasSeenPermissions(UID, CLIENT_ID, [
        'profile:email',
        'profile:display_name',
      ])
    ).toBe(true);
  });

  it('is false when one scope is new', () => {
    mockGetAccountByUid.mockReturnValue({
      uid: UID,
      grantedPermissions: { [CLIENT_ID]: ['profile:email'] },
    });
    expect(
      hasSeenPermissions(UID, CLIENT_ID, [
        'profile:email',
        'profile:display_name',
      ])
    ).toBe(false);
  });

  it('is scoped per client', () => {
    mockGetAccountByUid.mockReturnValue({
      uid: UID,
      grantedPermissions: { dcdb5ae7add825d2: ['profile:email'] },
    });
    expect(hasSeenPermissions(UID, CLIENT_ID, ['profile:email'])).toBe(false);
  });

  it('is false for a client id that is not hex, so __proto__ cannot match', () => {
    expect(hasSeenPermissions(UID, '__proto__', ['profile:email'])).toBe(false);
  });
});

describe('recordSeenPermissions', () => {
  it('unions the new scopes with what was already seen', () => {
    mockGetAccountByUid.mockReturnValue({
      uid: UID,
      grantedPermissions: { [CLIENT_ID]: ['profile:email'] },
    });
    recordSeenPermissions(UID, CLIENT_ID, [
      'profile:email',
      'profile:display_name',
    ]);
    expect(mockPersistAccount).toHaveBeenCalledWith({
      uid: UID,
      grantedPermissions: {
        [CLIENT_ID]: ['profile:email', 'profile:display_name'],
      },
    });
  });

  it('leaves other clients untouched', () => {
    mockGetAccountByUid.mockReturnValue({
      uid: UID,
      grantedPermissions: { dcdb5ae7add825d2: ['profile:email'] },
    });
    recordSeenPermissions(UID, CLIENT_ID, ['profile:email']);
    expect(mockPersistAccount).toHaveBeenCalledWith({
      uid: UID,
      grantedPermissions: {
        dcdb5ae7add825d2: ['profile:email'],
        [CLIENT_ID]: ['profile:email'],
      },
    });
  });

  it('does not write for a client id that is not hex', () => {
    recordSeenPermissions(UID, '__proto__', ['profile:email']);
    expect(mockPersistAccount).not.toHaveBeenCalled();
  });

  it('does not write when the account is not in storage', () => {
    mockGetAccountByUid.mockReturnValue(undefined);
    recordSeenPermissions(UID, CLIENT_ID, ['profile:email']);
    expect(mockPersistAccount).not.toHaveBeenCalled();
  });
});

describe('needsPermissions', () => {
  const args = {
    untrusted: true,
    scopes: UNTRUSTED_SCOPES,
    uid: UID,
    clientId: CLIENT_ID,
  };

  // A trusted client and an unresolved client are both `untrusted: false`.
  // `isUntrusted()` draws that distinction, and oauth-web-integration.test.ts
  // covers it.
  it('is false for a client that is not known to be untrusted', () => {
    expect(needsPermissions({ ...args, untrusted: false })).toBe(false);
  });

  it('is true for an untrusted client the user has not seen', () => {
    expect(needsPermissions(args)).toBe(true);
  });

  it('is false when no requested scope can be described', () => {
    expect(
      needsPermissions({ ...args, scopes: ['openid', 'profile:uid'] })
    ).toBe(false);
  });

  it('is false once the user has seen every displayable scope', () => {
    mockGetAccountByUid.mockReturnValue({
      uid: UID,
      grantedPermissions: {
        [CLIENT_ID]: ['profile:email', 'profile:display_name'],
      },
    });
    expect(needsPermissions(args)).toBe(false);
  });

  it('is true again when the relying party adds a displayable scope', () => {
    mockGetAccountByUid.mockReturnValue({
      uid: UID,
      grantedPermissions: { [CLIENT_ID]: ['profile:email'] },
    });
    expect(needsPermissions(args)).toBe(true);
  });
});
