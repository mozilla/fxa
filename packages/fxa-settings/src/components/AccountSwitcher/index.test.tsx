/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import AccountSwitcher, {
  MAX_OFFERED_ACCOUNTS,
  CACHED_SUBMIT_TEST_ID,
} from '.';
import { mockSwitchableAccount, mockSwitchableAccounts } from './mocks';
import { SwitchableAccount } from '../../lib/account-switcher';

const renderSwitcher = (
  accounts: SwitchableAccount[],
  props: Partial<React.ComponentProps<typeof AccountSwitcher>> = {}
) => {
  const onSelect = jest.fn();
  const onUseAnotherAccount = jest.fn();
  const { container } = renderWithLocalizationProvider(
    <AccountSwitcher
      {...{ accounts, onSelect, onUseAnotherAccount }}
      {...props}
    />
  );
  return { onSelect, onUseAnotherAccount, container };
};

describe('AccountSwitcher', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  it('renders every account when the list is short', () => {
    renderSwitcher(mockSwitchableAccounts(2));

    expect(screen.getByTestId('account-switcher')).toBeInTheDocument();
    expect(screen.getByText('user0@example.com')).toBeInTheDocument();
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
  });

  it('passes l10n', () => {
    renderSwitcher(
      [
        mockSwitchableAccount({ isFirefoxSignedIn: true }),
        mockSwitchableAccount({
          uid: 'b',
          email: 'b@e.com',
          hasSession: false,
        }),
        mockSwitchableAccount({ uid: 'c', email: 'c@e.com', isCurrent: true }),
      ],
      { variant: 'chooser' }
    );
    testAllL10n(screen, bundle);
  });

  it('calls onSelect with the chosen account', () => {
    const accounts = mockSwitchableAccounts(2);
    const { onSelect } = renderSwitcher(accounts);

    fireEvent.click(
      screen.getByTestId('account-switcher-row-user1@example.com')
    );

    expect(onSelect).toHaveBeenCalledWith(accounts[1]);
  });

  it('calls onUseAnotherAccount', () => {
    const { onUseAnotherAccount } = renderSwitcher(mockSwitchableAccounts(1));

    fireEvent.click(screen.getByTestId('account-switcher-use-another-account'));

    expect(onUseAnotherAccount).toHaveBeenCalled();
  });

  it('identifies each row by email, exactly once, never by display name', () => {
    renderSwitcher([
      mockSwitchableAccount({
        displayName: 'Test User',
        email: 'user@example.com',
      }),
    ]);

    expect(screen.getAllByText('user@example.com')).toHaveLength(1);
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  describe('state line', () => {
    it('marks the account the browser is signed in as', () => {
      renderSwitcher([mockSwitchableAccount({ isFirefoxSignedIn: true })]);

      expect(screen.getByText('Signed in to Firefox')).toBeInTheDocument();
    });

    it('prefers the signed out state over the browser one', () => {
      renderSwitcher([
        mockSwitchableAccount({ hasSession: false, isFirefoxSignedIn: true }),
      ]);

      expect(screen.getByText('Signed out')).toBeInTheDocument();
      expect(
        screen.queryByText('Signed in to Firefox')
      ).not.toBeInTheDocument();
    });

    it('says nothing extra for an account with a session', () => {
      renderSwitcher([mockSwitchableAccount({ isCurrent: true })]);

      expect(screen.queryByText('Signed out')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Signed in to Firefox')
      ).not.toBeInTheDocument();
    });

    it('does not render a session-less row as disabled', () => {
      renderSwitcher([mockSwitchableAccount({ hasSession: false })]);

      expect(
        screen.getByTestId('account-switcher-row-user@example.com')
      ).toBeEnabled();
    });
  });

  describe('label', () => {
    it('renders a visible label when given one', () => {
      renderSwitcher(mockSwitchableAccounts(1), {
        localizedLabel: 'Other accounts',
      });

      expect(screen.getByText('Other accounts')).toBeInTheDocument();
    });

    it('falls back to an accessible group label when there is none', () => {
      renderSwitcher(mockSwitchableAccounts(1));

      expect(
        screen.getByRole('group', { name: 'Choose an account' })
      ).toBeInTheDocument();
    });
  });

  describe('chooser variant', () => {
    const primaryAccount = mockSwitchableAccount({
      uid: 'uid-current',
      email: 'current@example.com',
      isCurrent: true,
    });
    const others = [
      mockSwitchableAccount({ uid: 'uid-other', email: 'other@example.com' }),
    ];

    const renderChooser = () =>
      renderSwitcher(others, { variant: 'chooser', primaryAccount });

    it('makes the suggested account the form submit control, leading the list', () => {
      renderChooser();

      const rows = screen.getAllByRole('button');
      expect(rows[0]).toHaveAttribute('data-testid', CACHED_SUBMIT_TEST_ID);
      expect(rows[0]).toHaveAttribute('type', 'submit');
      expect(rows[0]).toHaveTextContent('current@example.com');
      expect(rows[1]).toHaveTextContent('other@example.com');
    });

    it('renders one flat list, with no section label', () => {
      renderChooser();

      expect(screen.queryByText('Other accounts')).not.toBeInTheDocument();
    });

    it('renders the suggested account alone when there is nothing else', () => {
      renderSwitcher([], { variant: 'chooser', primaryAccount });

      expect(screen.getByTestId(CACHED_SUBMIT_TEST_ID)).toBeInTheDocument();
    });

    it('leaves the other rows as plain buttons that call onSelect', () => {
      const { onSelect } = renderChooser();

      const other = screen.getByTestId(
        'account-switcher-row-other@example.com'
      );
      expect(other).toHaveAttribute('type', 'button');

      fireEvent.click(other);
      expect(onSelect).toHaveBeenCalledWith(others[0]);
    });

    it('does not call onSelect for the submitting suggested row', () => {
      const { onSelect } = renderChooser();

      fireEvent.click(screen.getByTestId(CACHED_SUBMIT_TEST_ID));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('highlights only the suggested account', () => {
      renderChooser();

      // BoxButton's highlighted fill, vs the default bg-grey-10.
      expect(screen.getByTestId(CACHED_SUBMIT_TEST_ID).className).toContain(
        'bg-purple-50'
      );
      expect(
        screen.getByTestId('account-switcher-row-other@example.com').className
      ).toContain('bg-grey-10 ');
    });

    it('counts the suggested account against the offer limit', () => {
      renderSwitcher(mockSwitchableAccounts(5), {
        variant: 'chooser',
        primaryAccount,
      });

      expect(screen.getAllByText(/@example\.com/)).toHaveLength(
        MAX_OFFERED_ACCOUNTS
      );
    });

    it('does not highlight or submit in the menu variant', () => {
      renderSwitcher(others, { primaryAccount });

      expect(
        screen.queryByTestId(CACHED_SUBMIT_TEST_ID)
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('account-switcher-row-current@example.com')
      ).toHaveAttribute('type', 'button');
    });
  });

  it('locks every control while a sign-in is in flight', () => {
    renderSwitcher(mockSwitchableAccounts(2), { disabled: true });

    expect(
      screen.getByTestId('account-switcher-row-user0@example.com')
    ).toBeDisabled();
    expect(
      screen.getByTestId('account-switcher-use-another-account')
    ).toBeDisabled();
  });

  it('renders a divider only when there are accounts above it', () => {
    // Otherwise it doubles up with the surrounding surface's own divider.
    const { container } = renderSwitcher([]);
    expect(container.querySelectorAll('hr')).toHaveLength(0);
    expect(
      screen.getByTestId('account-switcher-use-another-account')
    ).toBeInTheDocument();

    const withAccounts = renderSwitcher(mockSwitchableAccounts(2));
    expect(withAccounts.container.querySelectorAll('hr')).toHaveLength(1);
  });

  describe('offer limit', () => {
    it('offers no more than the limit, keeping the highest ranked', () => {
      renderSwitcher(mockSwitchableAccounts(6));

      expect(screen.getAllByText(/user\d@example\.com/)).toHaveLength(
        MAX_OFFERED_ACCOUNTS
      );
      expect(screen.getByText('user0@example.com')).toBeInTheDocument();
      expect(screen.queryByText('user3@example.com')).not.toBeInTheDocument();
    });

    it('still offers a way to reach a dropped account', () => {
      renderSwitcher(mockSwitchableAccounts(6));

      expect(
        screen.getByTestId('account-switcher-use-another-account')
      ).toBeInTheDocument();
    });
  });

  describe('glean attributes', () => {
    it('omits them when no prefix is given', () => {
      renderSwitcher(mockSwitchableAccounts(1));

      expect(
        screen.getByTestId('account-switcher-use-another-account')
      ).not.toHaveAttribute('data-glean-id');
    });

    it('applies the prefix to the rows and the fallback', () => {
      renderSwitcher(mockSwitchableAccounts(2), { gleanIdPrefix: 'test' });

      expect(
        screen.getByTestId('account-switcher-row-user0@example.com')
      ).toHaveAttribute('data-glean-id', 'test_select');
      expect(
        screen.getByTestId('account-switcher-use-another-account')
      ).toHaveAttribute('data-glean-id', 'test_use_another');
    });
  });
});
