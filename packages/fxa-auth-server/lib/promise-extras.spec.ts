/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { props } from './promise-extras';

describe('props', () => {
  it('resolves an object of promises to an object of values', async () => {
    await expect(
      props({ a: Promise.resolve(1), b: Promise.resolve('x') })
    ).resolves.toEqual({ a: 1, b: 'x' });
  });

  it('rejects when one promise rejects', async () => {
    const error = new Error('boom');
    await expect(
      props({ a: Promise.resolve(1), b: Promise.reject(error) })
    ).rejects.toBe(error);
  });
});
