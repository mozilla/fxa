/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import Container from './container';

// The supplicant dead-end card has no actions, so the container's only job is to
// read `?reason` and render the matching variant (FXA-13869).
const TIMEOUT_HEADING = 'Looks like we timed out';
const CANCELED_HEADING = 'Canceled';

const renderAt = (search: string) =>
  renderWithLocalizationProvider(
    <MemoryRouter
      initialEntries={[`/pair/supplicant/timeout_and_cancel${search}`]}
    >
      <Container />
    </MemoryRouter>
  );

describe('Pair2/Supplicant/TimeoutAndCancel container', () => {
  it('renders the canceled variant when reason=canceled', () => {
    renderAt('?reason=canceled');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      CANCELED_HEADING
    );
  });

  it('renders the timeout variant when reason=timeout', () => {
    renderAt('?reason=timeout');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      TIMEOUT_HEADING
    );
  });

  it('falls back to timeout when reason is missing', () => {
    renderAt('');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      TIMEOUT_HEADING
    );
  });

  it('falls back to timeout when reason is unknown', () => {
    renderAt('?reason=bogus');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      TIMEOUT_HEADING
    );
  });
});
