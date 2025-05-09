/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Index from '../../app/page';

jest.mock('next/headers', () => ({
  headers: () => ({
    get: (key: string) => {
      if (key === 'accept-language') return 'en-US,en;q=0.5';
      return null;
    },
  }),
}))

describe('Page', () => {
  it('renders Page as expected', async () => {
    render(Index());

    const header = screen.getByRole('heading', { level: 1 });
    expect(header).toHaveTextContent('Welcome');
  });
});
