/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { buildPairUrl, parsePairingHash, PairingChannelInfo } from './pair-url';

const MOCK_ORIGIN = 'https://accounts.firefox.com';
const MOCK_CHANNEL: PairingChannelInfo = {
  channelId: 'c0ffee0000000000000000000000beef',
  channelKey: 'Zm9vYmFyLWJheg_qux-123',
  version: '2',
};

describe('parsePairingHash', () => {
  it('reads the channel out of an authority QR hash', () => {
    expect(
      parsePairingHash('#channel_id=chan-1&channel_key=key-1&v=2')
    ).toEqual({ channelId: 'chan-1', channelKey: 'key-1', version: '2' });
  });

  it('accepts a hash without the leading #', () => {
    expect(parsePairingHash('channel_id=chan-1&channel_key=key-1&v=2')).toEqual(
      { channelId: 'chan-1', channelKey: 'key-1', version: '2' }
    );
  });

  it.each([
    ['an empty hash', ''],
    ['an absent hash', undefined],
    ['no version', '#channel_id=chan-1&channel_key=key-1'],
    ['version 1', '#channel_id=chan-1&channel_key=key-1&v=1'],
    // Half a channel cannot be opened, so it is no hand-off rather than a
    // broken one.
    ['no channel_key', '#channel_id=chan-1&v=2'],
    ['no channel_id', '#channel_key=key-1&v=2'],
    ['an empty channel_key', '#channel_id=chan-1&channel_key=&v=2'],
  ])('returns undefined for %s', (_label, hash) => {
    expect(parsePairingHash(hash)).toBeUndefined();
  });

  // Each of these characters is load-bearing somewhere downstream — `;` and `#`
  // in the Android intent grammar, `/` and the space in the URL the deep link
  // wraps — so they get named cases rather than a loop.
  describe('rejects a channel carrying a character the deep link cannot survive', () => {
    it.each([
      { name: 'a semicolon, which separates Android intent extras', char: ';' },
      { name: 'a hash, which opens the intent extras block', char: '#' },
      { name: 'a slash', char: '/' },
      { name: 'a space', char: ' ' },
      { name: 'an ampersand', char: '&' },
    ])('$name in the channel key', ({ char }) => {
      const hash = `#channel_id=chan-1&channel_key=${encodeURIComponent(
        `key-1${char}end`
      )}&v=2`;
      expect(parsePairingHash(hash)).toBeUndefined();
    });

    it('a semicolon in the channel id', () => {
      expect(
        parsePairingHash('#channel_id=chan-1%3Bend&channel_key=key-1&v=2')
      ).toBeUndefined();
    });
  });

  it('rejects a channel key longer than 128 characters', () => {
    const key = 'a'.repeat(129);
    expect(
      parsePairingHash(`#channel_id=chan-1&channel_key=${key}&v=2`)
    ).toBeUndefined();
  });

  it('accepts a channel key of exactly 128 characters', () => {
    const key = 'a'.repeat(128);
    expect(
      parsePairingHash(`#channel_id=chan-1&channel_key=${key}&v=2`)
    ).toEqual({ channelId: 'chan-1', channelKey: key, version: '2' });
  });
});

describe('buildPairUrl', () => {
  it('builds the URL the authority encodes into its QR code', () => {
    expect(buildPairUrl(MOCK_CHANNEL, MOCK_ORIGIN)).toBe(
      `${MOCK_ORIGIN}/pair` +
        `#channel_id=${MOCK_CHANNEL.channelId}` +
        `&channel_key=${MOCK_CHANNEL.channelKey}` +
        `&v=2`
    );
  });

  it('defaults to the current origin', () => {
    expect(buildPairUrl(MOCK_CHANNEL)).toBe(
      buildPairUrl(MOCK_CHANNEL, window.location.origin)
    );
  });

  // The QR the authority shows and the deep link the supplicant hands to
  // Firefox are the same string. If these two ever disagree, pairing breaks
  // only on a real device, with a real scan.
  it('round-trips through parsePairingHash', () => {
    const url = new URL(buildPairUrl(MOCK_CHANNEL, MOCK_ORIGIN));
    expect(parsePairingHash(url.hash)).toEqual(MOCK_CHANNEL);
  });
});
