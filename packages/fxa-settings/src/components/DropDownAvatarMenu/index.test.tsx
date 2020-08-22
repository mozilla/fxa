/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MockedCache } from '../../models/_mocks';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';
import DropDownAvatarMenu, { DESTROY_SESSION_MUTATION } from '.';

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

describe('DropDownAvatarMenu', () => {
  it('renders and toggles as expected with default values', () => {
    render(
      <MockedCache account={{ avatarUrl: null, displayName: null }}>
        <DropDownAvatarMenu />
      </MockedCache>
    );

    const toggleButton = screen.getByTestId('drop-down-avatar-menu-toggle');
    const dropDownId = 'drop-down-avatar-menu';
    const dropDown = screen.queryByTestId(dropDownId);

    expect(toggleButton).toHaveAttribute('title', 'Firefox Account Menu');
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

  it('renders as expected with avatarUrl and displayName set', () => {
    render(
      <MockedCache>
        <DropDownAvatarMenu />
      </MockedCache>
    );
    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(screen.getByTestId('drop-down-name-or-email').textContent).toContain(
      'John Dope'
    );
  });

  it('closes on esc keypress', () => {
    render(
      <MockedCache>
        <DropDownAvatarMenu />
      </MockedCache>
    );
    const dropDown = screen.queryByTestId('drop-down-avatar-menu');

    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(dropDown).toBeInTheDocument;
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(dropDown).not.toBeInTheDocument;
  });

  it('closes on click outside', () => {
    const { container } = render(
      <MockedCache>
        <div className="w-full flex justify-end">
          <div className="flex pr-10 pt-4">
            <DropDownAvatarMenu />
          </div>
        </div>
      </MockedCache>
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
        <MockedCache {...{ mocks }}>
          <DropDownAvatarMenu />
        </MockedCache>
      );

      fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('sign-out'));
      });
      expect(window.location.assign).toHaveBeenCalledWith(
        `${window.location.origin}/signin`
      );
    });

    it('displays an error in the AlertBar', async () => {
      const mocks = [mockGqlError()];

      const { rerender } = render(<AlertBarRootAndContextProvider />);
      rerender(
        <MockedCache {...{ mocks }}>
          <AlertBarRootAndContextProvider>
            <DropDownAvatarMenu />
          </AlertBarRootAndContextProvider>
        </MockedCache>
      );

      fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('sign-out'));
      });

      expect(screen.getByTestId('sign-out-error').textContent).toContain(
        'Aw shucks'
      );
    });
  });
});
