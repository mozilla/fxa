/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useRef } from 'react';
import { MemoryRouter } from 'react-router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import DropDownAvatarMenu from '.';
import { Account, AppContext } from 'fxa-settings/src/models';
import { mockAppContext, MOCK_ACCOUNT } from 'fxa-settings/src/models/mocks';
import { getDefault } from '../../../lib/config';
import Storage from '../../../lib/storage';
import { mockAvatar } from '../../AccountSwitcher/mocks';

export default {
  title: 'Components/Settings/DropDownAvatarMenu',
  component: DropDownAvatarMenu,
  decorators: [
    withLocalization,
    // "Use another account" navigates via useNavigateWithQuery.
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    (Story) => (
      <div className="w-full flex justify-end">
        <div className="flex pr-10 pt-4">
          <Story />
        </div>
      </div>
    ),
  ],
} as Meta;

const accountWithoutAvatar = {
  avatar: {
    url: null,
    id: null,
  },
  primaryEmail: {
    email: MOCK_ACCOUNT.primaryEmail.email,
  },
} as unknown as Account;

const storyWithContext = (account: Partial<Account>) => {
  const context = { account: account as Account };

  const story = () => (
    <AppContext.Provider value={mockAppContext(context)}>
      <DropDownAvatarMenu />
    </AppContext.Provider>
  );
  return story;
};

export const DefaultNoAvatarOrDisplayName =
  storyWithContext(accountWithoutAvatar);

export const WithAvatarAndDisplayName = storyWithContext(MOCK_ACCOUNT);

const CURRENT_UID = 'uid-current';

/**
 * Opens the menu on mount so the switcher is visible without a click. The ref
 * guard keeps React's development double-effect from toggling it back shut.
 */
const AutoOpenMenu = ({ children }: { children: React.ReactNode }) => {
  const hasOpened = useRef(false);
  useEffect(() => {
    if (hasOpened.current) {
      return;
    }
    hasOpened.current = true;
    document
      .querySelector<HTMLButtonElement>(
        '[data-testid="drop-down-avatar-menu-toggle"]'
      )
      ?.click();
  }, []);
  return <>{children}</>;
};

/** Clearing on the empty case keeps a story from inheriting another's accounts. */
const seedAccounts = (accounts: Record<string, unknown>[]) => {
  const storage = Storage.factory('localStorage');
  if (!accounts.length) {
    storage.remove('accounts');
    storage.remove('currentAccountUid');
    storage.remove('firefoxSignedInUid');
    return;
  }
  storage.set(
    'accounts',
    Object.fromEntries(accounts.map((a) => [a.uid as string, a]))
  );
  storage.set('currentAccountUid', CURRENT_UID);
};

const currentStoredAccount = {
  uid: CURRENT_UID,
  email: MOCK_ACCOUNT.primaryEmail.email,
  sessionToken: 'current-token',
  lastLogin: 3,
};

const otherStoredAccounts = [
  {
    uid: 'uid-work',
    email: 'work@example.com',
    displayName: 'Work Account',
    sessionToken: 'work-token',
    avatar: mockAvatar('W', '#9059FF'),
    lastLogin: 2,
  },
  // No sessionToken: shows a "Signed out" state line.
  {
    uid: 'uid-old',
    email: 'old-address@example.com',
    avatar: mockAvatar('O', '#00B3A4'),
    lastLogin: 1,
  },
];

const switcherStory = (
  accounts: Record<string, unknown>[],
  firefoxSignedInUid?: string
) => {
  const config = {
    ...getDefault(),
    featureFlags: {
      ...getDefault().featureFlags,
      accountSwitcherEnabled: true,
    },
  };

  const story = () => {
    seedAccounts(accounts);
    if (firefoxSignedInUid) {
      Storage.factory('localStorage').set(
        'firefoxSignedInUid',
        firefoxSignedInUid
      );
    }
    return (
      <AppContext.Provider
        value={mockAppContext({
          account: { ...MOCK_ACCOUNT, uid: CURRENT_UID } as Account,
          config,
        })}
      >
        <AutoOpenMenu>
          <DropDownAvatarMenu />
        </AutoOpenMenu>
      </AppContext.Provider>
    );
  };
  return story;
};

export const AccountSwitcherOnlyCurrentAccount = switcherStory([
  currentStoredAccount,
]);

export const AccountSwitcherTwoOtherAccounts = switcherStory([
  currentStoredAccount,
  ...otherStoredAccounts,
]);

export const AccountSwitcherCurrentSignedIntoFirefox = switcherStory(
  [currentStoredAccount, ...otherStoredAccounts],
  CURRENT_UID
);

export const AccountSwitcherOtherAccountSignedIntoFirefox = switcherStory(
  [currentStoredAccount, ...otherStoredAccounts],
  'uid-work'
);
