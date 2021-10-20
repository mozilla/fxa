/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { mockAppContext, mockSession } from '../../models/mocks';
import DropDownAvatarMenu from '.';
import { logViewEvent, settingsViewName } from 'fxa-settings/src/lib/metrics';
import { Account, AppContext } from '../../models';

jest.mock('../../models/AlertBarInfo');
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

const makeSession = (isError: boolean = false) => {
  const s = mockSession();
  s.destroy = isError
    ? jest.fn().mockRejectedValue(new Error())
    : jest.fn().mockResolvedValue(true);
  return s;
};

describe('DropDownAvatarMenu', () => {
  it('renders and toggles as expected with default values', () => {
    const account = {
      avatar: { url: null, id: null },
      displayName: null,
      primaryEmail: {
        email: 'johndope@example.com',
      },
    } as unknown as Account;
    render(
      <AppContext.Provider value={mockAppContext({ account })}>
        <DropDownAvatarMenu />
      </AppContext.Provider>
    );

    const toggleButton = screen.getByTestId('drop-down-avatar-menu-toggle');
    const dropDownId = 'drop-down-avatar-menu';
    const dropDown = screen.queryByTestId(dropDownId);

    expect(toggleButton).toHaveAttribute('title', 'drop-down-menu-title');
    expect(toggleButton).toHaveAttribute('aria-controls', dropDownId);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(dropDown).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(dropDown).toBeInTheDocument();
    expect(screen.getByTestId('drop-down-name-or-email').textContent).toContain(
      'johndope@example.com'
    );

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(dropDown).not.toBeInTheDocument();
  });

  it('renders as expected with avatar url and displayName set', () => {
    render(
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
    render(
      <AppContext.Provider value={mockAppContext({ account })}>
        <DropDownAvatarMenu />
      </AppContext.Provider>
    );
    const dropDown = screen.queryByTestId('drop-down-avatar-menu');

    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(dropDown).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(dropDown).not.toBeInTheDocument();
  });

  it('closes on click outside', () => {
    const { container } = render(
      <AppContext.Provider value={mockAppContext({ account })}>
        <div className="w-full flex justify-end">
          <div className="flex pr-10 pt-4">
            <DropDownAvatarMenu />
          </div>
        </div>
      </AppContext.Provider>
    );
    const dropDown = screen.queryByTestId('drop-down-avatar-menu');

    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(dropDown).toBeInTheDocument();
    fireEvent.click(container);
    expect(dropDown).not.toBeInTheDocument();
  });

  describe('destroySession', () => {
    it('redirects the user on success', async () => {
      //@ts-ignore
      delete window.location;
      window.location = {
        ...window.location,
        assign: jest.fn(),
      };

      render(
        <AppContext.Provider
          value={mockAppContext({ account, session: makeSession() })}
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
        `${window.location.origin}/signin`
      );
    });

    it('displays an error in the AlertBar', async () => {
      const context = mockAppContext({ account, session: makeSession(true) });
      render(
        <AppContext.Provider value={context}>
          <DropDownAvatarMenu />
        </AppContext.Provider>
      );

      fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('avatar-menu-sign-out'));
      });
      expect(context.alertBarInfo?.error).toBeCalledTimes(1);
    });
  });
});
