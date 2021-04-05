/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MockedCache } from '../../models/_mocks';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';
import DropDownAvatarMenu, { DESTROY_SESSION_MUTATION } from '.';
import { logViewEvent, settingsViewName } from 'fxa-settings/src/lib/metrics';
import { Account, AccountContext } from '../../models';

jest.mock('fxa-settings/src/lib/metrics', () => ({
  logViewEvent: jest.fn(),
  settingsViewName: 'quuz',
}));

const account = ({
  avatar: {
    id: 'abc1234',
    url: 'http://placekitten.com/512/512',
    isDefault: false,
  },
  primaryEmail: {
    email: 'johndope@example.com',
  },
  displayName: 'John Dope',
} as unknown) as Account;

const mockGqlSuccess = () => ({
  request: {
    query: DESTROY_SESSION_MUTATION,
    variables: { input: {} },
  },
  result: {
    data: {
      resendSecondaryEmailCode: {
        clientMutationId: null,
      },
    },
  },
});

const mockGqlError = () => ({
  request: {
    query: DESTROY_SESSION_MUTATION,
    variables: { input: {} },
  },
  error: new Error('Aw shucks'),
});

window.console.error = jest.fn();

afterAll(() => {
  (window.console.error as jest.Mock).mockReset();
});

describe('DropDownAvatarMenu', () => {
  it('renders and toggles as expected with default values', () => {
    const account = ({
      avatar: { url: null, id: null },
      displayName: null,
      primaryEmail: {
        email: 'johndope@example.com',
      },
    } as unknown) as Account;
    render(
      <AccountContext.Provider value={{ account }}>
        <MockedCache>
          <DropDownAvatarMenu />
        </MockedCache>
      </AccountContext.Provider>
    );

    const toggleButton = screen.getByTestId('drop-down-avatar-menu-toggle');
    const dropDownId = 'drop-down-avatar-menu';
    const dropDown = screen.queryByTestId(dropDownId);

    expect(toggleButton).toHaveAttribute('title', 'drop-down-menu-title');
    expect(toggleButton).toHaveAttribute('aria-controls', dropDownId);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(dropDown).not.toBeInTheDocument;

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(dropDown).toBeInTheDocument;
    expect(screen.getByTestId('drop-down-name-or-email').textContent).toContain(
      'johndope@example.com'
    );

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(dropDown).not.toBeInTheDocument;
  });

  it('renders as expected with avatar url and displayName set', () => {
    render(
      <AccountContext.Provider value={{ account }}>
        <MockedCache>
          <DropDownAvatarMenu />
        </MockedCache>
      </AccountContext.Provider>
    );
    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(screen.getByTestId('drop-down-name-or-email').textContent).toContain(
      'John Dope'
    );
  });

  it('closes on esc keypress', () => {
    render(
      <AccountContext.Provider value={{ account }}>
        <MockedCache>
          <DropDownAvatarMenu />
        </MockedCache>
      </AccountContext.Provider>
    );
    const dropDown = screen.queryByTestId('drop-down-avatar-menu');

    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(dropDown).toBeInTheDocument;
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(dropDown).not.toBeInTheDocument;
  });

  it('closes on click outside', () => {
    const { container } = render(
      <AccountContext.Provider value={{ account }}>
        <MockedCache>
          <div className="w-full flex justify-end">
            <div className="flex pr-10 pt-4">
              <DropDownAvatarMenu />
            </div>
          </div>
        </MockedCache>
      </AccountContext.Provider>
    );
    const dropDown = screen.queryByTestId('drop-down-avatar-menu');

    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(dropDown).toBeInTheDocument;
    fireEvent.click(container);
    expect(dropDown).not.toBeInTheDocument;
  });

  describe('destroySession', () => {
    it('redirects the user on success', async () => {
      window.location.assign = jest.fn();
      const mocks = [mockGqlSuccess()];

      render(
        <AccountContext.Provider value={{ account }}>
          <MockedCache {...{ mocks }}>
            <DropDownAvatarMenu />
          </MockedCache>
        </AccountContext.Provider>
      );

      fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('avatar-menu-sign-out'));
      });
      expect(window.location.assign).toHaveBeenCalledWith(
        `${window.location.origin}/signin`
      );
      expect(logViewEvent).toHaveBeenCalledWith(
        settingsViewName,
        'signout.success'
      );
    });

    it('displays an error in the AlertBar', async () => {
      const mocks = [mockGqlError()];

      const { rerender } = render(<AlertBarRootAndContextProvider />);
      rerender(
        <AccountContext.Provider value={{ account }}>
          <MockedCache {...{ mocks }}>
            <AlertBarRootAndContextProvider>
              <DropDownAvatarMenu />
            </AlertBarRootAndContextProvider>
          </MockedCache>
        </AccountContext.Provider>
      );

      fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('avatar-menu-sign-out'));
      });

      expect(screen.getByTestId('sign-out-error').textContent).toContain(
        'drop-down-menu-sign-out-error'
      );
    });
  });
});
