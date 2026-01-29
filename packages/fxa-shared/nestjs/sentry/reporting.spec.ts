/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isAuthServerError } from './reporting';

describe('detects auth server error', () => {
  it('flags when code and errno are present', () => {
    const result = isAuthServerError({
      name: 'foo',
      message: 'bar',
      extensions: {
        code: 401,
        errno: 101,
      },
    });

    expect(result).toBeTruthy();
  });

  it('does not flag when code is missing', () => {
    const result = isAuthServerError({
      name: 'foo',
      message: 'bar',
      extensions: {
        errno: 101,
      },
    });

    expect(result).toBeFalsy();
  });

  it('does not flag when errno is missing', () => {
    const result = isAuthServerError({
      name: 'foo',
      message: 'bar',
      extensions: {
        code: 500,
      },
    });

    expect(result).toBeFalsy();
  });

  it('does not flag general errors', () => {
    const result = isAuthServerError({
      name: 'foo',
      message: 'bar',
    });

    expect(result).toBeFalsy();
  });
});
