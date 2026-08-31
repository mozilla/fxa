/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';
import { SwitchableAccount } from '../../lib/account-switcher';
import AccountRow, {
  AccountSwitcherVariant,
  dividerClasses,
  labelClasses,
  rowClasses,
} from './AccountRow';
import { ReactComponent as AddAccount } from './add-account.svg';
import { ChevronRightIcon } from '../Icons';

/**
 * Accounts offered at once, counting the suggested one. Anyone outside the list
 * is still reachable via "Use another account".
 */
export const MAX_OFFERED_ACCOUNTS = 3;

/** Test id the cached page's primary action has always carried. */
export const CACHED_SUBMIT_TEST_ID = 'cached-signin-submit';

export interface AccountSwitcherProps {
  /**
   * The suggested account, which leads the list. Omit on surfaces that already
   * name the current account elsewhere, like the settings menu header.
   */
  primaryAccount?: SwitchableAccount;
  accounts: SwitchableAccount[];
  onSelect: (account: SwitchableAccount) => void;
  onUseAnotherAccount: () => void;
  variant?: AccountSwitcherVariant;
  /** Visible label for the list. Defaults per variant. */
  localizedLabel?: string;
  gleanIdPrefix?: string;
  /** Locks every row while the chosen account's sign-in is in flight. */
  disabled?: boolean;
}

export const AccountSwitcher = ({
  primaryAccount,
  accounts,
  onSelect,
  onUseAnotherAccount,
  variant = 'menu',
  localizedLabel,
  gleanIdPrefix,
  disabled = false,
}: AccountSwitcherProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const isChooser = variant === 'chooser';

  const offeredAccounts = accounts.slice(
    0,
    MAX_OFFERED_ACCOUNTS - (primaryAccount ? 1 : 0)
  );

  // One flat list, so the accounts read as a single set of equivalent choices;
  // the suggested one is marked by its fill rather than a separate section.
  const rows = primaryAccount
    ? [primaryAccount, ...offeredAccounts]
    : offeredAccounts;

  const rowProps = {
    onSelect,
    disabled,
    variant,
    gleanId: gleanIdPrefix && `${gleanIdPrefix}_select`,
  };

  return (
    <div data-testid="account-switcher">
      {localizedLabel && (
        <p className={labelClasses(variant)}>{localizedLabel}</p>
      )}

      {rows.length > 0 && (
        <div
          className={isChooser ? 'flex flex-col gap-2.5' : undefined}
          {...(!localizedLabel && {
            role: 'group',
            'aria-label': ftlMsgResolver.getMsg(
              'account-switcher-group-label',
              'Choose an account'
            ),
          })}
        >
          {rows.map((account) => {
            const isPrimary = account.uid === primaryAccount?.uid;
            return (
              <AccountRow
                key={account.uid}
                {...{ account }}
                {...rowProps}
                highlighted={isPrimary}
                // Keeps the cached page's submit semantics, and with them the
                // test id functional tests rely on.
                isSubmit={isChooser && isPrimary}
                data-testid={
                  isChooser && isPrimary ? CACHED_SUBMIT_TEST_ID : undefined
                }
              />
            );
          })}
        </div>
      )}

      {/* With no accounts above it, this would sit against the surrounding
       * surface's own divider and read as a double rule. */}
      {rows.length > 0 && <hr className={dividerClasses(variant)} />}

      <button
        type="button"
        onClick={onUseAnotherAccount}
        disabled={disabled}
        data-testid="account-switcher-use-another-account"
        {...(gleanIdPrefix && {
          'data-glean-id': `${gleanIdPrefix}_use_another`,
        })}
        className={rowClasses(variant)}
      >
        <span
          className={`${
            isChooser ? 'w-8 h-8' : 'w-8'
          } shrink-0 flex items-center justify-center`}
        >
          <AddAccount
            aria-hidden="true"
            className="w-5 stroke-current text-grey-500 dark:text-grey-200"
          />
        </span>
        <FtlMsg id="account-switcher-use-another-account">
          <span className="flex-1 text-sm">Use another account</span>
        </FtlMsg>
        {isChooser && (
          <ChevronRightIcon
            className="flex-none w-4 rtl:-scale-x-100 text-grey-400"
            ariaHidden
          />
        )}
      </button>
    </div>
  );
};

export default AccountSwitcher;
