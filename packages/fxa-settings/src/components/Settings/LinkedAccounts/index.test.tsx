/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { Account, AppContext, LinkedAccount } from '../../../models';
import LinkedAccounts from '../LinkedAccounts';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { MOCK_LINKED_ACCOUNTS } from '../LinkedAccounts/mocks';
import { LinkedAccountProviderIds } from '../../../lib/types';
import { withLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      googleUnlinkSubmit: jest.fn(),
      googleUnlinkSubmitConfirm: jest.fn(),
      appleUnlinkSubmit: jest.fn(),
      appleUnlinkSubmitConfirm: jest.fn(),
    },
  },
}));

const MOCK_ACCOUNT = {
  hasPassword: true,
  linkedAccounts: MOCK_LINKED_ACCOUNTS,
} as unknown as Account;

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation(),
}));

let mockLocationState = {};
const mockLocation = () => {
  return {
    state: mockLocationState,
  };
};

const clickUnlinkButton = async (providerId = 1) => {
  await act(async () => {
    const unlinkButton = await screen.findByTestId(
      `linked-account-unlink-${providerId}`
    );
    fireEvent.click(unlinkButton);
  });
};
const clickConfirmUnlinkButton = async () => {
  await act(async () => {
    const confirmButton = await screen.findByTestId('modal-confirm');
    fireEvent.click(confirmButton);
  });
};

// This directly modifies `account.linkedAccounts` for the account object
// passed in to simulate a state update. Because it is mutable, be sure to
// spread a new `linkedAccounts` array if referencing a constant. We also
// have to force a re-render after account.unlinkThirdParty is called
// because manual state updates to account.linkedAccounts from our mock
// are not detected by React.
const mockUnlinkThirdParty = (
  providerId: LinkedAccountProviderIds,
  account: Account
) => {
  const index = account.linkedAccounts.findIndex(
    (linkedAcc: LinkedAccount) => linkedAcc.providerId === providerId
  );
  if (index !== -1) {
    account.linkedAccounts.splice(index, 1);
  }
};

describe('#integration - Linked Accounts', () => {
  beforeEach(() => {
    mockLocationState = {};
  });

  it('renders "fresh load" <LinkedAccounts/> with correct content', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account: MOCK_ACCOUNT })}>
        <LinkedAccounts />
      </AppContext.Provider>
    );

    expect(await screen.findByText('Linked Accounts')).toBeTruthy();
    expect(await screen.findByText('Google')).toBeTruthy();
  });

  it('does not render linked accounts section if no linked accounts', async () => {
    const account = {
      linkedAccounts: [],
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <LinkedAccounts />
      </AppContext.Provider>
    );

    expect(
      screen.queryByRole('heading', { name: 'Linked Accounts' })
    ).toBeNull();
    expect(screen.queryByTestId('settings-linked-account')).toBeNull();
  });

  it('renders proper modal and sends Glean ping when Google "unlink" is clicked', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account: MOCK_ACCOUNT })}>
        <LinkedAccounts />
      </AppContext.Provider>
    );
    await clickUnlinkButton();
    expect(GleanMetrics.accountPref.googleUnlinkSubmit).toHaveBeenCalledWith(
      undefined
    );

    screen.queryByTestId('linked-account-unlink-header-test-id');
  });

  it('renders proper modal and sends Glean ping when Apple "unlink" is clicked', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account: MOCK_ACCOUNT })}>
        <LinkedAccounts />
      </AppContext.Provider>
    );
    await clickUnlinkButton(2);
    expect(GleanMetrics.accountPref.appleUnlinkSubmit).toHaveBeenCalledWith(
      undefined
    );

    screen.queryByTestId('linked-account-unlink-header-test-id');
  });

  it('on unlink, sends Glean ping and removes linked account', async () => {
    const account = {
      hasPassword: true,
      linkedAccounts: [...MOCK_LINKED_ACCOUNTS],
      unlinkThirdParty: (providerId: LinkedAccountProviderIds) =>
        mockUnlinkThirdParty(providerId, account),
    } as unknown as Account;

    const ui = (
      <AppContext.Provider value={mockAppContext({ account })}>
        <LinkedAccounts />
      </AppContext.Provider>
    );
    const { rerender } = renderWithRouter(ui);

    const initialCount = (
      await screen.findAllByTestId('settings-linked-account')
    ).length;

    await clickUnlinkButton();

    screen.queryByTestId('linked-account-unlink-header-test-id');

    await clickConfirmUnlinkButton();
    expect(
      GleanMetrics.accountPref.googleUnlinkSubmitConfirm
    ).toHaveBeenCalledWith(undefined);
    rerender(withLocalizationProvider(ui));

    expect(
      await screen.findAllByTestId('settings-linked-account')
    ).toHaveLength(initialCount - 1);
  });

  it('automatically opens corresponding provider ID modal if router state has wantsUnlinkProviderId, emits expected Glean event', async () => {
    mockLocationState = {
      wantsUnlinkProviderId: LinkedAccountProviderIds.Apple,
    };
    const account = {
      hasPassword: true,
      linkedAccounts: [...MOCK_LINKED_ACCOUNTS],
      unlinkThirdParty: (providerId: LinkedAccountProviderIds) =>
        mockUnlinkThirdParty(providerId, account),
    } as unknown as Account;

    const ui = (
      <AppContext.Provider value={mockAppContext({ account })}>
        <LinkedAccounts />
      </AppContext.Provider>
    );
    const { rerender } = renderWithRouter(ui);

    await waitFor(() => {
      screen.getByText('Are you sure you want to unlink your account?', {
        exact: false,
      });
    });
    await clickConfirmUnlinkButton();
    expect(
      GleanMetrics.accountPref.appleUnlinkSubmitConfirm
    ).toHaveBeenCalledWith({
      event: { reason: 'create_password' },
    });
    rerender(withLocalizationProvider(ui));

    expect(screen.queryByLabelText('Apple')).not.toBeInTheDocument();
    // Apple should be unlinked and Google auth should still be present
    screen.getByLabelText('Google');
  });

  describe('account without password', () => {
    const accountWithoutPassword = {
      hasPassword: false,
      linkedAccounts: [...MOCK_LINKED_ACCOUNTS],
    } as unknown as Account;

    it('on Google unlink, emits expected Glean ping and directs user to create password flow', async () => {
      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account: accountWithoutPassword,
          })}
        >
          <LinkedAccounts />
        </AppContext.Provider>
      );

      fireEvent.click(
        await screen.findByTestId(
          `linked-account-unlink-${LinkedAccountProviderIds.Google}`
        )
      );

      expect(GleanMetrics.accountPref.googleUnlinkSubmit).toHaveBeenCalledWith({
        event: { reason: 'create_password' },
      });
      await screen.findByText(
        'Before unlinking your account, you must set a password. Without a password, there is no way for you to log in after unlinking your account.'
      );

      await clickConfirmUnlinkButton();
      expect(mockNavigate).toHaveBeenCalledWith('/settings/create_password', {
        state: { wantsUnlinkProviderId: LinkedAccountProviderIds.Google },
      });
    });
    it('on Apple unlink, emits expected Glean ping and directs user to create password flow', async () => {
      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account: accountWithoutPassword,
          })}
        >
          <LinkedAccounts />
        </AppContext.Provider>
      );

      fireEvent.click(
        await screen.findByTestId(
          `linked-account-unlink-${LinkedAccountProviderIds.Apple}`
        )
      );

      expect(GleanMetrics.accountPref.appleUnlinkSubmit).toHaveBeenCalledWith({
        event: { reason: 'create_password' },
      });
      await screen.findByText('Before unlinking your account', {
        exact: false,
      });

      await clickConfirmUnlinkButton();
      expect(mockNavigate).toHaveBeenCalledWith('/settings/create_password', {
        state: { wantsUnlinkProviderId: LinkedAccountProviderIds.Apple },
      });
    });
  });
});
