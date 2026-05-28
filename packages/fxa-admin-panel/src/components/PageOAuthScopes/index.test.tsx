/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { AdminPanelGroup, AdminPanelGuard, GuardEnv } from '@fxa/shared/guards';
import { IClientConfig } from '../../../interfaces';
import { mockConfigBuilder } from '../../lib/config';
import PageOAuthScopes from './index';
import { adminApi } from '../../lib/api';

const mockGuard = new AdminPanelGuard(GuardEnv.Prod);

const mockConfig: IClientConfig = mockConfigBuilder({
  user: {
    email: 'test@mozilla.com',
    group: mockGuard.getGroup(AdminPanelGroup.AdminProd),
  },
});

jest.mock('../../hooks/UserContext.ts', () => ({
  useUserContext: () => ({
    guard: mockGuard,
    user: mockConfig.user,
    setUser: () => {},
  }),
}));

jest.mock('../../hooks/GuardContext.ts', () => ({
  useGuardContext: () => ({
    guard: mockGuard,
    setGuard: () => {},
  }),
}));

jest.mock('../../lib/api', () => ({
  adminApi: {
    getOAuthScopes: jest.fn(),
    createOAuthScope: jest.fn(),
    deleteOAuthScope: jest.fn(),
  },
}));

const mockScopes = [
  {
    id: 1,
    scope: 'https://identity.mozilla.com/apps/oldsync',
    hasScopedKeys: true,
  },
  {
    id: 2,
    scope: 'https://identity.mozilla.com/apps/subscriptions',
    hasScopedKeys: false,
  },
];

describe('PageOAuthScopes', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
    (adminApi.getOAuthScopes as jest.Mock).mockResolvedValue([]);
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page heading and empty state', async () => {
    render(<PageOAuthScopes />);

    expect(screen.getByText('OAuth Scopes')).toBeInTheDocument();
    expect(await screen.findByText('No scopes yet.')).toBeInTheDocument();
  });

  it('shows loading state then renders sorted scopes', async () => {
    (adminApi.getOAuthScopes as jest.Mock).mockResolvedValue(mockScopes);

    render(<PageOAuthScopes />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();

    expect(
      await screen.findByText('https://identity.mozilla.com/apps/oldsync')
    ).toBeInTheDocument();
    expect(
      screen.getByText('https://identity.mozilla.com/apps/subscriptions')
    ).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  const findRowByScope = (scope: string) =>
    screen
      .getAllByTestId('oauth-scope-row')
      .find((row) => row.getAttribute('data-scope') === scope);

  it('renders hasScopedKeys true and false distinctly', async () => {
    (adminApi.getOAuthScopes as jest.Mock).mockResolvedValue(mockScopes);

    render(<PageOAuthScopes />);

    const rows = await screen.findAllByTestId('oauth-scope-row');
    expect(rows).toHaveLength(2);

    const oldsyncRow = findRowByScope(
      'https://identity.mozilla.com/apps/oldsync'
    );
    expect(oldsyncRow?.getAttribute('data-has-scoped-keys')).toBe('true');

    const subsRow = findRowByScope(
      'https://identity.mozilla.com/apps/subscriptions'
    );
    expect(subsRow?.getAttribute('data-has-scoped-keys')).toBe('false');
  });

  it('sorts scopes alphabetically and surfaces the id', async () => {
    (adminApi.getOAuthScopes as jest.Mock).mockResolvedValue([
      {
        id: 9,
        scope: 'https://identity.mozilla.com/apps/zeta',
        hasScopedKeys: false,
      },
      {
        id: 4,
        scope: 'https://identity.mozilla.com/apps/alpha',
        hasScopedKeys: false,
      },
    ]);

    render(<PageOAuthScopes />);

    const rows = await screen.findAllByTestId('oauth-scope-row');
    expect(rows[0].getAttribute('data-scope')).toBe(
      'https://identity.mozilla.com/apps/alpha'
    );
    expect(rows[0].getAttribute('data-id')).toBe('4');
    expect(rows[1].getAttribute('data-scope')).toBe(
      'https://identity.mozilla.com/apps/zeta'
    );
    expect(rows[1].getAttribute('data-id')).toBe('9');
  });

  it('shows error state when load fails', async () => {
    (adminApi.getOAuthScopes as jest.Mock).mockRejectedValue(
      new Error('network error')
    );

    render(<PageOAuthScopes />);

    expect(
      await screen.findByText('Failed to load scopes.')
    ).toBeInTheDocument();
  });

  it('Add Scope button is enabled even when input is empty', async () => {
    render(<PageOAuthScopes />);
    await screen.findByText('No scopes yet.');

    expect(screen.getByTestId('oauth-scope-add-btn')).toBeEnabled();
  });

  it('submits a typed scope with hasScopedKeys=false and surfaces the new row', async () => {
    (adminApi.createOAuthScope as jest.Mock).mockResolvedValue({
      id: 11,
      scope: 'https://identity.mozilla.com/apps/new',
      hasScopedKeys: false,
    });

    render(<PageOAuthScopes />);
    await screen.findByText('No scopes yet.');

    const input = screen.getByTestId('oauth-scope-input');

    await user.type(input, 'https://identity.mozilla.com/apps/new');
    await user.click(screen.getByTestId('oauth-scope-add-btn'));

    await waitFor(() => {
      expect(adminApi.createOAuthScope).toHaveBeenCalledWith({
        scope: 'https://identity.mozilla.com/apps/new',
        hasScopedKeys: false,
      });
    });
    const row = await screen.findByTestId('oauth-scope-row');
    expect(row.getAttribute('data-id')).toBe('11');
    expect(row.getAttribute('data-scope')).toBe(
      'https://identity.mozilla.com/apps/new'
    );
    expect(input).toHaveValue('');
  });

  it('submits with hasScopedKeys=true when checkbox is checked', async () => {
    (adminApi.createOAuthScope as jest.Mock).mockResolvedValue({
      id: 12,
      scope: 'https://identity.mozilla.com/apps/new',
      hasScopedKeys: true,
    });

    render(<PageOAuthScopes />);
    await screen.findByText('No scopes yet.');

    await user.type(
      screen.getByTestId('oauth-scope-input'),
      'https://identity.mozilla.com/apps/new'
    );
    await user.click(screen.getByTestId('oauth-scope-has-scoped-keys'));
    await user.click(screen.getByTestId('oauth-scope-add-btn'));

    await waitFor(() => {
      expect(adminApi.createOAuthScope).toHaveBeenCalledWith({
        scope: 'https://identity.mozilla.com/apps/new',
        hasScopedKeys: true,
      });
    });
  });

  it('submits an empty-string scope without prevalidation', async () => {
    (adminApi.createOAuthScope as jest.Mock).mockResolvedValue({
      id: 13,
      scope: '',
      hasScopedKeys: false,
    });

    render(<PageOAuthScopes />);
    await screen.findByText('No scopes yet.');

    await user.click(screen.getByTestId('oauth-scope-add-btn'));

    await waitFor(() => {
      expect(adminApi.createOAuthScope).toHaveBeenCalledWith({
        scope: '',
        hasScopedKeys: false,
      });
    });
  });

  it('preserves surrounding whitespace in the submitted scope', async () => {
    (adminApi.createOAuthScope as jest.Mock).mockResolvedValue({
      id: 14,
      scope: '  spaced  ',
      hasScopedKeys: false,
    });

    render(<PageOAuthScopes />);
    await screen.findByText('No scopes yet.');

    await user.type(screen.getByTestId('oauth-scope-input'), '  spaced  ');
    await user.click(screen.getByTestId('oauth-scope-add-btn'));

    await waitFor(() => {
      expect(adminApi.createOAuthScope).toHaveBeenCalledWith({
        scope: '  spaced  ',
        hasScopedKeys: false,
      });
    });
  });

  it('resets the checkbox after a successful submit', async () => {
    (adminApi.createOAuthScope as jest.Mock).mockResolvedValue({
      id: 15,
      scope: 'https://identity.mozilla.com/apps/new',
      hasScopedKeys: true,
    });

    render(<PageOAuthScopes />);
    await screen.findByText('No scopes yet.');

    const checkbox = screen.getByTestId(
      'oauth-scope-has-scoped-keys'
    ) as HTMLInputElement;

    await user.type(
      screen.getByTestId('oauth-scope-input'),
      'https://identity.mozilla.com/apps/new'
    );
    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);

    await user.click(screen.getByTestId('oauth-scope-add-btn'));

    await waitFor(() => {
      expect(checkbox.checked).toBe(false);
    });
  });

  it('shows an inline error when create fails', async () => {
    (adminApi.createOAuthScope as jest.Mock).mockRejectedValue(
      new Error('API error 400: scope must be a URL-format scope')
    );

    render(<PageOAuthScopes />);
    await screen.findByText('No scopes yet.');

    await user.type(screen.getByTestId('oauth-scope-input'), 'profile:email');
    await user.click(screen.getByTestId('oauth-scope-add-btn'));

    const errorEl = await screen.findByTestId('oauth-scope-submit-error');
    expect(errorEl).toHaveTextContent(
      'API error 400: scope must be a URL-format scope'
    );
    expect(errorEl).toHaveAttribute('role', 'alert');
  });

  it('clears the inline error when the user edits the input', async () => {
    (adminApi.createOAuthScope as jest.Mock).mockRejectedValue(
      new Error('nope')
    );

    render(<PageOAuthScopes />);
    await screen.findByText('No scopes yet.');

    await user.type(screen.getByTestId('oauth-scope-input'), 'bad');
    await user.click(screen.getByTestId('oauth-scope-add-btn'));

    await screen.findByTestId('oauth-scope-submit-error');

    await user.type(screen.getByTestId('oauth-scope-input'), 'x');

    expect(
      screen.queryByTestId('oauth-scope-submit-error')
    ).not.toBeInTheDocument();
  });

  describe('delete', () => {
    it('renders the deletion warning for users who can delete', async () => {
      render(<PageOAuthScopes />);
      await screen.findByText('No scopes yet.');

      const warning = screen.getByTestId('oauth-scope-delete-warning');
      expect(warning).toHaveAttribute('role', 'alert');
      expect(warning).toHaveTextContent(/Deleting a scope is immediate/i);
    });

    it('deletes a scope after confirmation and removes its row', async () => {
      (adminApi.getOAuthScopes as jest.Mock).mockResolvedValue(mockScopes);
      (adminApi.deleteOAuthScope as jest.Mock).mockResolvedValue(true);

      render(<PageOAuthScopes />);
      const rows = await screen.findAllByTestId('oauth-scope-row');
      expect(rows).toHaveLength(2);

      const oldsyncRow = findRowByScope(
        'https://identity.mozilla.com/apps/oldsync'
      )!;
      await user.click(
        within(oldsyncRow).getByTestId('oauth-scope-delete-btn')
      );

      await waitFor(() => {
        expect(adminApi.deleteOAuthScope).toHaveBeenCalledWith(1);
      });
      await waitFor(() => {
        expect(screen.getAllByTestId('oauth-scope-row')).toHaveLength(1);
      });
      expect(
        findRowByScope('https://identity.mozilla.com/apps/oldsync')
      ).toBeUndefined();
    });

    it('does not delete when the confirmation is dismissed', async () => {
      (window.confirm as jest.Mock).mockReturnValue(false);
      (adminApi.getOAuthScopes as jest.Mock).mockResolvedValue(mockScopes);

      render(<PageOAuthScopes />);
      const rows = await screen.findAllByTestId('oauth-scope-row');

      await user.click(within(rows[0]).getByTestId('oauth-scope-delete-btn'));

      expect(adminApi.deleteOAuthScope).not.toHaveBeenCalled();
      expect(screen.getAllByTestId('oauth-scope-row')).toHaveLength(2);
    });

    it('alerts and keeps the row when delete fails', async () => {
      (adminApi.getOAuthScopes as jest.Mock).mockResolvedValue(mockScopes);
      (adminApi.deleteOAuthScope as jest.Mock).mockRejectedValue(
        new Error('API error 404: Scope with id 1 not found')
      );

      render(<PageOAuthScopes />);
      const rows = await screen.findAllByTestId('oauth-scope-row');

      await user.click(within(rows[0]).getByTestId('oauth-scope-delete-btn'));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          'Error deleting scope: API error 404: Scope with id 1 not found'
        );
      });
      expect(screen.getAllByTestId('oauth-scope-row')).toHaveLength(2);
    });
  });
});
