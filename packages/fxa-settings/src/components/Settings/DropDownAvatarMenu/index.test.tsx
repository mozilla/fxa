/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import {
  mockAppContext,
  mockSession,
  mockSettingsContext,
} from '../../../models/mocks';
import DropDownAvatarMenu from '.';
import { logViewEvent, settingsViewName } from 'fxa-settings/src/lib/metrics';
import { Account, AppContext } from '../../../models';
import { SettingsContext } from '../../../models/contexts/SettingsContext';

jest.mock('../../../models/AlertBarInfo');
jest.mock('fxa-settings/src/lib/metrics', () => ({
  logViewEvent: jest.fn(),
  settingsViewName: 'quuz',
}));

const account = {
  avatar: {
    id: 'abc1234',
    url: 'http://placekitten.com/512/512',
    isDefault: false,
  },
  primaryEmail: {
    email: 'johndope@example.com',
  },
  displayName: 'John Dope',
} as unknown as Account;

describe('DropDownAvatarMenu', () => {
  const dropDownId = 'drop-down-avatar-menu';

  it('renders and toggles as expected with default values', () => {
    const account = {
      avatar: { url: null, id: null },
      displayName: null,
      primaryEmail: {
        email: 'johndope@example.com',
      },
    } as unknown as Account;
    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <DropDownAvatarMenu />
      </AppContext.Provider>
    );

    const toggleButton = screen.getByTestId('drop-down-avatar-menu-toggle');

    expect(toggleButton).toHaveAttribute('title', 'Mozilla account menu');
    expect(toggleButton).toHaveAttribute('aria-label', 'Mozilla account menu');
    expect(toggleButton).toHaveAttribute('aria-haspopup', 'menu');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();
    expect(screen.getByTestId('drop-down-name-or-email').textContent).toContain(
      'johndope@example.com'
    );

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();
  });

  it('renders as expected with avatar url and displayName set', () => {
    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <DropDownAvatarMenu />
      </AppContext.Provider>
    );
    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(screen.getByTestId('drop-down-name-or-email').textContent).toContain(
      'John Dope'
    );
  });

  it('closes on esc keypress', () => {
    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <DropDownAvatarMenu />
      </AppContext.Provider>
    );

    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();
  });

  it('closes on click outside', () => {
    const { container } = renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <div className="w-full flex justify-end">
          <div className="flex pr-10 pt-4">
            <DropDownAvatarMenu />
          </div>
        </div>
      </AppContext.Provider>
    );

    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();
    fireEvent.click(container);
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();
  });

  describe('destroySession', () => {
    it('redirects the user on success', async () => {
      //@ts-ignore
      delete window.location;
      window.location = {
        ...window.location,
        assign: jest.fn(),
      };

      renderWithLocalizationProvider(
        <AppContext.Provider
          value={mockAppContext({ account, session: mockSession() })}
        >
          <DropDownAvatarMenu />
        </AppContext.Provider>
      );

      fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('avatar-menu-sign-out'));
      });
      expect(logViewEvent).toHaveBeenCalledWith(
        settingsViewName,
        'signout.success'
      );
      expect(window.location.assign).toHaveBeenCalledWith(
        window.location.origin
      );
    });

    it('displays an error in the AlertBar', async () => {
      const context = mockAppContext({
        account,
        session: mockSession(true, true),
      });
      const settingsContext = mockSettingsContext();
      renderWithLocalizationProvider(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <DropDownAvatarMenu />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );

      fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('avatar-menu-sign-out'));
      });
      expect(settingsContext.alertBarInfo?.error).toBeCalledTimes(1);
    });
  });
});
