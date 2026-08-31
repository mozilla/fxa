/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  capturePairingChannelParams,
  getPairingChannelHashParams,
  getPairingChannelId,
  getPairingChannelParams,
  hasPairingChannelParams,
  resetPairingChannelParamsForTest,
  updatePairingChannelHashParams,
} from './pairing-channel-params';

const MOCK_CHANNEL_ID = 'c66d1b2e2a0f4f0a8d3e5b7c9a1f3e5d';
const MOCK_CHANNEL_KEY = 'RGVhZEJlZWZEZWFkQmVlZkRlYWRCZWVmRGVhZEJlZWY';
const MOCK_PAIRING_HASH = `#channel_id=${MOCK_CHANNEL_ID}&channel_key=${MOCK_CHANNEL_KEY}&v=2`;

/** Put the page at a URL with the given fragment, without navigating. */
function setHash(hash: string) {
  window.history.replaceState(null, '', `/pair${hash}`);
}

beforeEach(() => {
  resetPairingChannelParamsForTest();
  setHash('');
});

afterEach(() => {
  resetPairingChannelParamsForTest();
});

describe('capturePairingChannelParams', () => {
  it('removes the fragment from the URL', () => {
    setHash(MOCK_PAIRING_HASH);

    capturePairingChannelParams();

    expect(window.location.hash).toBe('');
  });

  it('keeps the path and query intact', () => {
    window.history.replaceState(
      null,
      '',
      `/pair?client_id=abc&scope=profile${MOCK_PAIRING_HASH}`
    );

    capturePairingChannelParams();

    expect(window.location.pathname).toBe('/pair');
    expect(window.location.search).toBe('?client_id=abc&scope=profile');
  });

  it('keeps the channel values readable after stripping them', () => {
    setHash(MOCK_PAIRING_HASH);

    capturePairingChannelParams();

    expect(getPairingChannelParams()).toEqual({
      channelId: MOCK_CHANNEL_ID,
      channelKey: MOCK_CHANNEL_KEY,
    });
  });

  // The fragment carries more than the two channel values, so capturing only
  // those would silently drop whatever else the flow depends on.
  it('preserves every fragment param, not just the channel ones', () => {
    setHash(MOCK_PAIRING_HASH);

    capturePairingChannelParams();

    expect(getPairingChannelHashParams()?.get('v')).toBe('2');
  });

  // Anchors elsewhere in the app live in the fragment too and must survive.
  it.each(['#connected-services', '#secondary-email', ''])(
    'leaves the non-pairing fragment %p alone',
    (hash) => {
      setHash(hash);

      capturePairingChannelParams();

      expect(window.location.hash).toBe(hash);
      expect(hasPairingChannelParams()).toBe(false);
    }
  );

  it('treats a fragment with no channel_key as not a pairing URL', () => {
    setHash(`#channel_id=${MOCK_CHANNEL_ID}`);

    capturePairingChannelParams();

    expect(hasPairingChannelParams()).toBe(false);
    expect(window.location.hash).toBe(`#channel_id=${MOCK_CHANNEL_ID}`);
  });

  it('is safe to call twice', () => {
    setHash(MOCK_PAIRING_HASH);

    capturePairingChannelParams();
    capturePairingChannelParams();

    expect(getPairingChannelParams()).toEqual({
      channelId: MOCK_CHANNEL_ID,
      channelKey: MOCK_CHANNEL_KEY,
    });
  });

  // The post-OAuth webview reload (FXA-13616) re-runs startup against a URL that
  // no longer has the fragment, because the first run took it out.
  it('recovers the channel after a reload has lost the fragment', () => {
    setHash(MOCK_PAIRING_HASH);
    capturePairingChannelParams();

    // A reload clears module state but not sessionStorage.
    resetModuleStateOnly();
    capturePairingChannelParams();

    expect(getPairingChannelParams()).toEqual({
      channelId: MOCK_CHANNEL_ID,
      channelKey: MOCK_CHANNEL_KEY,
    });
  });
});

describe('getPairingChannelParams', () => {
  it('returns null when nothing was captured', () => {
    expect(getPairingChannelParams()).toBeNull();
    expect(getPairingChannelHashParams()).toBeNull();
    expect(hasPairingChannelParams()).toBe(false);
  });

  // A half-present fragment is not something the flow can act on, so it reads
  // the same as no fragment rather than handing back a partial channel.
  it('returns null when the fragment has no channel_id', () => {
    setHash(`#channel_key=${MOCK_CHANNEL_KEY}`);
    capturePairingChannelParams();

    expect(hasPairingChannelParams()).toBe(true);
    expect(getPairingChannelParams()).toBeNull();
  });
});

describe('getPairingChannelId', () => {
  it('returns null outside a pairing flow', () => {
    capturePairingChannelParams();

    expect(getPairingChannelId()).toBeNull();
  });

  it('reads the supplicant copy out of the fragment', () => {
    setHash(MOCK_PAIRING_HASH);

    capturePairingChannelParams();

    expect(getPairingChannelId()).toBe(MOCK_CHANNEL_ID);
  });

  it('reads the authority copy out of the query string', () => {
    window.history.replaceState(
      null,
      '',
      `/connect_another_device?channel_id=${MOCK_CHANNEL_ID}&v=2`
    );

    capturePairingChannelParams();

    expect(getPairingChannelId()).toBe(MOCK_CHANNEL_ID);
  });

  // Reading the URL live would repeat FXA-14093: the SPA can drop query params
  // after load, and events later in the flow would then stop carrying the join
  // key that earlier ones had.
  it('keeps the id after the URL has lost it', () => {
    window.history.replaceState(
      null,
      '',
      `/connect_another_device?channel_id=${MOCK_CHANNEL_ID}`
    );
    capturePairingChannelParams();

    window.history.replaceState(null, '', '/pair/authority/sync_success');

    expect(getPairingChannelId()).toBe(MOCK_CHANNEL_ID);
  });
});

describe('updatePairingChannelHashParams', () => {
  it('replaces the captured params without touching the URL', () => {
    setHash(MOCK_PAIRING_HASH);
    capturePairingChannelParams();

    updatePairingChannelHashParams(new URLSearchParams({ v: '3' }));

    expect(getPairingChannelHashParams()?.get('v')).toBe('3');
    expect(window.location.hash).toBe('');
  });
});

describe('unavailable sessionStorage', () => {
  let getItem: jest.SpyInstance;
  let setItem: jest.SpyInstance;

  beforeEach(() => {
    // Some sandboxed WebViews throw on access rather than returning null.
    getItem = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('denied');
      });
    setItem = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('denied');
      });
  });

  afterEach(() => {
    getItem.mockRestore();
    setItem.mockRestore();
  });

  it('still captures and strips, holding the values in memory', () => {
    setHash(MOCK_PAIRING_HASH);

    capturePairingChannelParams();

    expect(window.location.hash).toBe('');
    expect(getPairingChannelParams()).toEqual({
      channelId: MOCK_CHANNEL_ID,
      channelKey: MOCK_CHANNEL_KEY,
    });
  });

  it('reports no params when there is nothing to read', () => {
    capturePairingChannelParams();

    expect(hasPairingChannelParams()).toBe(false);
  });
});

/**
 * Clear the module's in-memory copies while leaving sessionStorage as it is,
 * which is the state a page reload starts from.
 * `resetPairingChannelParamsForTest` clears both, so it cannot stand in for this.
 */
function resetModuleStateOnly() {
  const keys = ['fxa.pairing.channel.hash', 'fxa.pairing.channel.id'];
  const stored = keys.map((key) => [key, window.sessionStorage.getItem(key)]);
  resetPairingChannelParamsForTest();
  for (const [key, value] of stored) {
    if (value !== null) {
      window.sessionStorage.setItem(key as string, value as string);
    }
  }
}
