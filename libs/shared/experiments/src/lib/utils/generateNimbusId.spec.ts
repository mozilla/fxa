/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { generateNimbusId } from './generateNimbusId';

describe('generateNimbusId', () => {
  const namespace = '2b94b5a8-407f-5ff4-8d6a-e53ada958c9d';

  it('returns a uuid v5', () => {
    const id = 'test-id';
    const expected = 'a9e87f95-efa5-575e-bac2-e297abb1e597';

    expect(generateNimbusId(namespace, id)).toEqual(expected);
  });

  it('returns a guest id with random uuid', () => {
    const result = generateNimbusId(namespace);
    expect(result.startsWith('guest-')).toBeTruthy();
  });
});
