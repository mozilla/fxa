/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Clear from '.';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
describe('Clear', () => {
  it('clears localStorage, sessionStorage, and sets cookie', () => {
    localStorage.setItem('hey', 'ho');
    sessionStorage.setItem("let's", 'go');
    expect(localStorage.length).toBe(1);
    expect(sessionStorage.length).toBe(1);

    let cookieJar = '';
    jest.spyOn(document, 'cookie', 'set').mockImplementation((cookie) => {
      cookieJar = cookie;
    });
    jest.spyOn(document, 'cookie', 'get').mockImplementation(() => cookieJar);
    expect(document.cookie).toBe('');

    renderWithLocalizationProvider(<Clear />);
    screen.getByRole('heading', { name: 'Browser storage is cleared' });
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).toBe(
      'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT'
    );
  });
});
