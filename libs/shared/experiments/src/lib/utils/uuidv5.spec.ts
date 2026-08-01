/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { uuidv5 } from './uuidv5';

// Nimbus IDs are re-derived from a uid to delete a user's telemetry, so this
// output is a stored-data contract: if it changes, deletion silently misses
// rows. These expectations are fixed constants, captured from the `uuid`
// package before it was removed, and must not be regenerated to match a new
// implementation. NS_DNS/'www.example.com' is the widely published RFC 4122
// vector, so it also cross-checks against a source outside this repo.
const NS_SUBPLAT = '2b94b5a8-407f-5ff4-8d6a-e53ada958c9d';
const NS_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const NS_NIL = '00000000-0000-0000-0000-000000000000';

describe('uuidv5', () => {
  it.each([
    {
      about: 'an ascii name',
      namespace: NS_SUBPLAT,
      name: 'test-id',
      expected: 'a9e87f95-efa5-575e-bac2-e297abb1e597',
    },
    {
      about: 'an fxa uid',
      namespace: NS_SUBPLAT,
      name: '0539bd755a638fc7a2fa4dd4fb04576c',
      expected: 'd7de930e-fa1d-59ba-8c12-5542414d434d',
    },
    {
      about: 'an empty name',
      namespace: NS_SUBPLAT,
      name: '',
      expected: '2ab449b5-af52-5157-a22c-42cfbbddb354',
    },
    {
      about: 'a multi-byte utf-8 name',
      namespace: NS_SUBPLAT,
      name: 'ünïcødé-ñäme',
      expected: '72a3269e-177a-528a-be3f-2b0d3ed06ee9',
    },
    {
      about: 'a cjk name',
      namespace: NS_SUBPLAT,
      name: '日本語のテキスト',
      expected: '69064371-a2b4-524a-9306-79966537003f',
    },
    {
      about: 'a name with surrogate pairs',
      namespace: NS_SUBPLAT,
      name: '🔥💧🌍',
      expected: '72d044d5-2be1-58ec-ac1e-20aeb68761f4',
    },
    {
      about: 'the rfc 4122 dns namespace',
      namespace: NS_DNS,
      name: 'www.example.com',
      expected: '2ed6657d-e927-568b-95e1-2665a8aea6a2',
    },
    {
      about: 'the nil namespace',
      namespace: NS_NIL,
      name: 'test-id',
      expected: '0a3ed06e-5daf-5efc-8552-ed40c62d6111',
    },
  ])('derives a stable uuid for $about', ({ namespace, name, expected }) => {
    expect(uuidv5(name, namespace)).toBe(expected);
  });

  it('derives a stable uuid for a name longer than the sha-1 block size', () => {
    expect(uuidv5('x'.repeat(1000), NS_SUBPLAT)).toBe(
      '2a352643-b72f-5e11-a0c7-39f99984afb2'
    );
  });

  it('returns the same uuid when called repeatedly', () => {
    const first = uuidv5('test-id', NS_SUBPLAT);
    expect(uuidv5('test-id', NS_SUBPLAT)).toBe(first);
  });

  it('sets the version to 5 and the rfc 4122 variant', () => {
    const [, , third, fourth] = uuidv5('test-id', NS_SUBPLAT).split('-');
    expect(third[0]).toBe('5');
    expect(['8', '9', 'a', 'b']).toContain(fourth[0]);
  });

  it('derives different uuids for the same name in different namespaces', () => {
    expect(uuidv5('test-id', NS_SUBPLAT)).not.toBe(uuidv5('test-id', NS_DNS));
  });

  it.each([
    {
      about: 'a truncated uuid',
      namespace: '2b94b5a8-407f-5ff4-8d6a-e53ada958c9',
    },
    {
      about: 'a uuid without dashes',
      namespace: '2b94b5a8407f5ff48d6ae53ada958c9d',
    },
    {
      about: 'non-hex characters',
      namespace: 'zzzzzzzz-407f-5ff4-8d6a-e53ada958c9d',
    },
    {
      about: 'an invalid version nibble',
      namespace: '2b94b5a8-407f-0ff4-8d6a-e53ada958c9d',
    },
    {
      about: 'an invalid variant nibble',
      namespace: '2b94b5a8-407f-5ff4-cd6a-e53ada958c9d',
    },
    { about: 'an empty string', namespace: '' },
  ])('throws TypeError given $about as the namespace', ({ namespace }) => {
    expect(() => uuidv5('test-id', namespace)).toThrow(
      new TypeError(`Invalid namespace UUID: ${namespace}`)
    );
  });
});
