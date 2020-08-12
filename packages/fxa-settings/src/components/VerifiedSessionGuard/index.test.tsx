/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, wait, screen } from '@testing-library/react';
import { MockedCache } from '../../models/_mocks';
import { VerifiedSessionGuard } from '.';

it('renders the content when verified', async () => {
  render(
    <MockedCache>
      <VerifiedSessionGuard guard={<div data-testid="guard">oops</div>}>
        <div data-testid="children">Content</div>
      </VerifiedSessionGuard>
    </MockedCache>
  );

  await wait();

  expect(screen.getByTestId('children')).toBeInTheDocument();
});

it('renders the guard when unverified', async () => {
  render(
    <MockedCache verified={false}>
      <VerifiedSessionGuard guard={<div data-testid="guard">oops</div>}>
        <div>Content</div>
      </VerifiedSessionGuard>
    </MockedCache>
  );

  await wait();

  expect(screen.getByTestId('guard')).toBeInTheDocument();
});
