/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReachRouterWindow } from '../../window';
import { UrlHashData } from './url-hash-data';
import {
  capturePairingChannelParams,
  getPairingChannelHashParams,
  resetPairingChannelParamsForTest,
} from '../../pairing-channel-params';

describe('url-hash-data', () => {
  const window = new ReachRouterWindow();

  afterEach(() => {
    resetPairingChannelParamsForTest();
  });

  it('creates', () => {
    const data = new UrlHashData(window);
    expect(data).toBeDefined();
  });

  it('sets and gets', () => {
    const data = new UrlHashData(window);
    data.set('foo', 'bar');
    expect(data.get('foo')).toEqual('bar');
  });

  it('does not require sync', () => {
    const data = new UrlHashData(window);
    expect(data.requiresSync()).toBeFalsy();
  });

  // The pairing fragment is taken out of the URL at startup so its channel key
  // cannot reach telemetry, which leaves the capture as the only source for it.
  describe('a captured pairing fragment', () => {
    const CHANNEL_ID = 'c66d1b2e2a0f4f0a8d3e5b7c9a1f3e5d';

    beforeEach(() => {
      resetPairingChannelParamsForTest();
      globalThis.window.history.replaceState(
        null,
        '',
        `/pair#channel_id=${CHANNEL_ID}&channel_key=abc&v=2`
      );
      capturePairingChannelParams();
    });

    it('is read from the capture once the URL no longer has it', () => {
      const data = new UrlHashData(window);

      expect(globalThis.window.location.hash).toBe('');
      expect(data.get('channel_id')).toEqual(CHANNEL_ID);
      expect(data.get('v')).toEqual('2');
    });

    // The capture outlives the pairing flow in this tab, so it must never mask
    // a fragment the URL actually has.
    it('yields to a live fragment that arrives later', () => {
      globalThis.window.history.replaceState(
        null,
        '',
        '/settings#connected-services'
      );
      const data = new UrlHashData(window);

      expect(data.get('channel_id')).toBeUndefined();
      expect(data.getKeys().next().value).toEqual('connected-services');
    });

    it('takes writes back to the capture rather than the URL', () => {
      const data = new UrlHashData(window);

      data.set('v', '3');

      expect(globalThis.window.location.hash).toBe('');
      expect(getPairingChannelHashParams()?.get('v')).toEqual('3');
      expect(data.get('channel_id')).toEqual(CHANNEL_ID);
    });
  });
});
