/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import UnitRow from '.';
import { renderWithRouter } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { SETTINGS_PATH } from '../../../constants';

describe('UnitRow', () => {
  it('renders as expected with minimal required attributes', () => {
    renderWithRouter(<UnitRow header="Foxy" headerValue={null} />);

    expect(screen.getByTestId('unit-row-header').textContent).toContain('Foxy');
    expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
      'None'
    );
    expect(screen.queryByTestId('unit-row-route')).toBeNull();
    expect(screen.queryByTestId('unit-row-modal')).toBeNull();
    expect(screen.queryByTestId('avatar-default')).toBeNull();
    expect(screen.queryByTestId('avatar-nondefault')).toBeNull();
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
        headerId="display-name"
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
    expect(screen.getByTestId('unit-row-header')).toHaveAttribute(
      'id',
      'display-name'
    );
    expect(screen.getByTestId('unit-row-route')).toHaveAttribute(
      'href',
      '/display_name'
    );
    expect(screen.getByTestId('unit-row-route').textContent).toContain(
      'Change'
    );
    expect(screen.queryByTestId('avatar-default')).toBeNull();
    expect(screen.queryByTestId('avatar-nondefault')).toBeNull();
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

  it('renders as expected with `hideCtaText` prop', () => {
    renderWithRouter(
      <UnitRow header="Display name" headerValue={null} hideCtaText={true} />
    );

    const ctaTextElement = screen.queryByTestId('unit-row-route');

    expect(ctaTextElement).not.toBeInTheDocument();
  });

  it('renders non-default `noHeaderValueText` and `ctaText`', () => {
    renderWithRouter(
      <UnitRow
        header="Display name"
        headerValue={null}
        noHeaderValueText="Not Set"
        ctaText="Create"
        route="/display_name"
      />
    );

    expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
      'Not Set'
    );
    expect(screen.getByTestId('unit-row-route').textContent).toContain(
      'Create'
    );
  });

  it('renders `secondaryCtaText`', () => {
    renderWithRouter(
      <UnitRow
        header="Display name"
        headerValue="Fred Flinstone"
        route="/display_name"
        revealSecondaryModal={() => {}}
      />
    );

    expect(screen.getByTestId('unit-row-route').textContent).toContain(
      'Change'
    );
    expect(
      screen.getByTestId('secondary-button-unit-row-modal').textContent
    ).toContain('Disable');
  });

  it('renders as expected with the default avatar', () => {
    const account = {
      avatar: { url: null, id: null, isDefault: true },
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={{ account }}>
        <UnitRow
          header="Picture"
          headerId="profile-picture"
          headerValue={!account.avatar.isDefault}
          route={`${SETTINGS_PATH}/avatar`}
          avatar={account.avatar}
        />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('unit-row-route').textContent).toContain('Add');
    expect(screen.getByTestId('avatar-default')).toBeInTheDocument();
    expect(screen.queryByTestId('avatar-nondefault')).toBeNull();
  });

  it('renders as expected with the user avatar', () => {
    const account = {
      avatar: {
        id: null,
        url: 'http://localhost:1111/v1/avatar/t',
        isDefault: false,
      },
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={{ account }}>
        <UnitRow
          header="Picture"
          headerId="profile-picture"
          headerValue={!account.avatar.isDefault}
          route={`${SETTINGS_PATH}/avatar`}
          avatar={account.avatar}
        />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('unit-row-route').textContent).toContain(
      'Change'
    );
    expect(screen.getByTestId('avatar-nondefault')).toBeInTheDocument();
    expect(screen.queryByTestId('avatar-default')).toBeNull();
  });
});
