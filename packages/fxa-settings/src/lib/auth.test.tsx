/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { render, cleanup } from '@testing-library/react';

import { AuthClient, AuthContext, useAuth } from './auth';

describe('useAuth', () => {
  const client = new AuthClient('none');

  afterEach(() => {
    cleanup();
  });

  it('throws when the context is not set', () => {
    function App() {
      expect(() => useAuth()).toThrow(
        'Are you forgetting an AuthContext.Provider?'
      );
      return null;
    }

    render(<App />);
  });

  it('returns the auth-client', () => {
    function App() {
      expect(useAuth()).toEqual(client);
      return null;
    }

    render(
      <AuthContext.Provider value={{ auth: client }}>
        <App />
      </AuthContext.Provider>
    );
  });
});
