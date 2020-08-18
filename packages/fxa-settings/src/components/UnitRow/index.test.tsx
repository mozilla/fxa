/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import UnitRow from '.';
import { renderWithRouter } from '../../models/_mocks';

describe('UnitRow', () => {
  it('renders as expected with minimal required attributes', () => {
    renderWithRouter(<UnitRow header="Foxy" headerValue={null} />);

    expect(screen.getByTestId('unit-row-header').textContent).toContain('Foxy');
    expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
      'None'
    );
    expect(screen.queryByTestId('unit-row-route')).toBeNull();
    expect(screen.queryByTestId('unit-row-modal')).toBeNull();
  });

  it('renders the children', () => {
    renderWithRouter(
      <UnitRow header="Display name" headerValue={null}>
        <p data-testid="children">The children!</p>
      </UnitRow>
    );

    expect(screen.getByTestId('children')).toBeInTheDocument();
  });

  it('renders as expected with `route` prop and non-null `headerValue`', () => {
    renderWithRouter(
      <UnitRow
        header="Display name"
        headerValue="Fred Flinstone"
        route="/display_name"
      />
    );

    expect(screen.getByTestId('unit-row-header').textContent).toContain(
      'Display name'
    );
    expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
      'Fred Flinstone'
    );
    expect(screen.getByTestId('unit-row-route')).toHaveAttribute(
      'href',
      '/display_name'
    );
    expect(screen.getByTestId('unit-row-route').textContent).toContain(
      'Change'
    );
  });

  it('renders as expected with `revealModal` prop', () => {
    renderWithRouter(
      <UnitRow
        header="Display name"
        headerValue={null}
        revealModal={() => {}}
      />
    );

    expect(screen.getByTestId('unit-row-modal').textContent).toContain('Add');
  });

  it('renders non-default `noHeaderValueText` and `ctaText`', () => {
    renderWithRouter(
      <UnitRow
        header="Display name"
        headerValue={null}
        noHeaderValueText="Not set"
        ctaText="Create"
        route="/display_name"
      />
    );

    expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
      'Not set'
    );
    expect(screen.getByTestId('unit-row-route').textContent).toContain(
      'Create'
    );
  });
});
