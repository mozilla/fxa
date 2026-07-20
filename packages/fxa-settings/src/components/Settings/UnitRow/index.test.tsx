/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitRow from '.';
import { renderWithRouter } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { SETTINGS_PATH } from '../../../constants';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    handleClickEvent: jest.fn(),
  },
}));

describe('UnitRow', () => {
  beforeEach(() => {
    (GleanMetrics.handleClickEvent as jest.Mock).mockClear();
  });

  it('renders as expected with minimal required attributes', () => {
    renderWithRouter(<UnitRow header="Foxy" />);

    expect(screen.getByTestId('unit-row-header').textContent).toContain('Foxy');
    expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
      'None'
    );
    expect(screen.queryByTestId('unit-row-route')).toBeNull();
    expect(screen.queryByTestId('unit-row-modal-button')).toBeNull();
    expect(screen.queryByTestId('avatar-default')).toBeNull();
    expect(screen.queryByTestId('avatar-nondefault')).toBeNull();
  });

  it('renders the children', () => {
    renderWithRouter(
      <UnitRow header="Display name">
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
    renderWithRouter(<UnitRow header="Display name" revealModal={() => {}} />);

    expect(screen.getByTestId('unit-row-modal-button').textContent).toContain(
      'Add'
    );
  });

  it('renders as expected with `hideCtaText` prop', () => {
    renderWithRouter(<UnitRow header="Display name" hideCtaText={true} />);

    const ctaTextElement = screen.queryByTestId('unit-row-route');

    expect(ctaTextElement).not.toBeInTheDocument();
  });

  it('renders non-default `defaultHeaderValueText` and `ctaText`', () => {
    renderWithRouter(
      <UnitRow
        header="Display name"
        defaultHeaderValueText="Not set"
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
      screen.getByTestId('secondary-button-unit-row-modal-button').textContent
    ).toContain('Disable');
  });

  // Regression (FXA-13881): ModalButton calls event.stopPropagation() to keep the
  // opening click from closing the modal, which also stops the click from reaching
  // Glean's document-level auto-element-click listener. When glean data attrs are
  // present, the click must be recorded explicitly so the event reaches Looker.
  describe('Glean click recording', () => {
    it('records the primary modal-button click when ctaGleanDataAttrs is set', async () => {
      renderWithRouter(
        <UnitRow
          header="Two-step authentication"
          revealModal={() => {}}
          ctaGleanDataAttrs={{ id: 'account_pref_two_step_auth_add_click' }}
        />
      );

      await userEvent.click(screen.getByTestId('unit-row-modal-button'));

      expect(GleanMetrics.handleClickEvent).toHaveBeenCalledTimes(1);
    });

    it('records the secondary modal-button click when secondaryButtonGleanDataAttrs is set', async () => {
      renderWithRouter(
        <UnitRow
          header="Two-step authentication"
          headerValue="Enabled"
          route="/two_step_authentication"
          revealSecondaryModal={() => {}}
          secondaryButtonGleanDataAttrs={{ id: 'two_step_auth_disable_click' }}
        />
      );

      await userEvent.click(
        screen.getByTestId('secondary-button-unit-row-modal-button')
      );

      expect(GleanMetrics.handleClickEvent).toHaveBeenCalledTimes(1);
    });

    it('does not record a modal-button click when no glean data attrs are set', async () => {
      renderWithRouter(
        <UnitRow header="Display name" revealModal={() => {}} />
      );

      await userEvent.click(screen.getByTestId('unit-row-modal-button'));

      expect(GleanMetrics.handleClickEvent).not.toHaveBeenCalled();
    });
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

  it('renders as expected when `hideHeaderValue=true` and no action', () => {
    const { container } = renderWithRouter(
      <UnitRow header="Foxy" hideHeaderValue />
    );

    expect(screen.getByTestId('unit-row-header').textContent).toContain('Foxy');
    expect(screen.queryByTestId('unit-row-header-value')).toBeNull();
    expect(container.querySelector('unit-row-actions')).not.toBeInTheDocument();
  });
});
