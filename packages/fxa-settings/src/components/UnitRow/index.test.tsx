/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UnitRow from '.';

afterEach(cleanup);

describe('UnitRow', () => {
  it('renders as expected with minimal required attributes', () => {
    const { getByTestId, queryByTestId } = render(
      <UnitRow header="Foxy" headerValue={null} />
    );

    expect(getByTestId('unit-row-header').textContent).toContain('Foxy');
    expect(getByTestId('unit-row-header-value').textContent).toContain('None');
    expect(queryByTestId('unit-row-route')).toBeNull();
    expect(queryByTestId('unit-row-modal')).toBeNull();
  });

  it('renders the children', () => {
    const { getByTestId } = render(
      <UnitRow header="Display name" headerValue={null}>
        <p data-testid="children">The children!</p>
      </UnitRow>
    );

    expect(getByTestId('children')).toBeInTheDocument();
  });

  it('renders as expected with `route` prop and non-null `headerValue`', () => {
    const { getByTestId } = render(
      <UnitRow
        header="Display name"
        headerValue="Fred Flinstone"
        route="/display_name"
      />
    );

    expect(getByTestId('unit-row-header').textContent).toContain(
      'Display name'
    );
    expect(getByTestId('unit-row-header-value').textContent).toContain(
      'Fred Flinstone'
    );
    expect(getByTestId('unit-row-route')).toHaveAttribute(
      'href',
      '/display_name'
    );
    expect(getByTestId('unit-row-route').textContent).toContain('Change');
  });

  it('renders as expected with `revealModal` prop', () => {
    const { getByTestId } = render(
      <UnitRow
        header="Display name"
        headerValue={null}
        revealModal={() => {}}
      />
    );

    expect(getByTestId('unit-row-modal').textContent).toContain('Add');
  });

  it('renders non-default `noHeaderValueText` and `noHeaderValueCtaText`', () => {
    const { getByTestId } = render(
      <UnitRow
        header="Display name"
        headerValue={null}
        noHeaderValueText="Not set"
        noHeaderValueCtaText="Create"
        route="/display_name"
      />
    );

    expect(getByTestId('unit-row-header-value').textContent).toContain(
      'Not set'
    );
    expect(getByTestId('unit-row-route').textContent).toContain('Create');
  });
});
