/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getSyncDevices } from './utils';
import { MOCK_SYNC_CLIENTS } from '../DataCollection/mocks';

const [macBook, iPhone] = MOCK_SYNC_CLIENTS;

describe('getSyncDevices', () => {
  it('merges clients that share a name into one row holding all of them', () => {
    const oauthSession = {
      ...macBook,
      deviceId: null,
      isSyncCapable: false,
      isCurrentSession: false,
    };

    expect(getSyncDevices([macBook, oauthSession])).toEqual([
      {
        name: macBook.name,
        deviceType: 'desktop',
        isCurrentSession: true,
        clients: [macBook, oauthSession],
      },
    ]);
  });

  it('marks the row as the current device when any client in it is', () => {
    const olderSession = { ...iPhone, isSyncCapable: false };
    const currentSession = {
      ...iPhone,
      isSyncCapable: false,
      isCurrentSession: true,
    };

    expect(
      getSyncDevices([iPhone, olderSession, currentSession])[0].isCurrentSession
    ).toBe(true);
  });

  it('drops names where no client holds the Sync key', () => {
    expect(getSyncDevices([{ ...iPhone, isSyncCapable: false }])).toEqual([]);
  });
});
