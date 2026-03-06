/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { firefox, FirefoxCommand } from './firefox';

describe('Firefox pairing WebChannel methods', () => {
  let sendSpy: jest.SpyInstance;

  beforeEach(() => {
    sendSpy = jest.spyOn(firefox, 'send').mockImplementation(() => {});
  });

  afterEach(() => {
    sendSpy.mockRestore();
  });

  it('pairAuthorize sends PairAuthorize command', () => {
    firefox.pairAuthorize('chan-123');
    expect(sendSpy).toHaveBeenCalledWith(FirefoxCommand.PairAuthorize, {
      channel_id: 'chan-123',
    });
  });

  it('pairDecline sends PairDecline command', () => {
    firefox.pairDecline('chan-123');
    expect(sendSpy).toHaveBeenCalledWith(FirefoxCommand.PairDecline, {
      channel_id: 'chan-123',
    });
  });

  it('pairComplete sends PairComplete command', () => {
    firefox.pairComplete('chan-123');
    expect(sendSpy).toHaveBeenCalledWith(FirefoxCommand.PairComplete, {
      channel_id: 'chan-123',
    });
  });

  it('pairHeartbeat resolves when response event fires', async () => {
    const promise = firefox.pairHeartbeat('chan-123');
    firefox.dispatchEvent(
      new CustomEvent(FirefoxCommand.PairHeartbeat, {
        detail: { suppAuthorized: true },
      })
    );
    const result = await promise;
    expect(result).toEqual({ suppAuthorized: true });
  });

  it('pairSupplicantMetadata resolves when response event fires', async () => {
    const promise = firefox.pairSupplicantMetadata('chan-123');
    firefox.dispatchEvent(
      new CustomEvent(FirefoxCommand.PairSupplicantMetadata, {
        detail: { ua: 'Mozilla/5.0', city: 'Portland' },
      })
    );
    const result = await promise;
    expect(result).toEqual({ ua: 'Mozilla/5.0', city: 'Portland' });
  });
});
