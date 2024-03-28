/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Index from '../../app/page';

describe('Page', () => {
  it('renders Page as expected', async () => {
    render(await Index());

    const header = screen.getByRole('heading', { level: 1 });
    expect(header).toHaveTextContent('Welcome');
  });
});
