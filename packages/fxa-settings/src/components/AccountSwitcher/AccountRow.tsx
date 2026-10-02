/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import Avatar from '../Settings/Avatar';
import BoxButton from '../BoxButton';
import { SwitchableAccount } from '../../lib/account-switcher';

/**
 * `chooser` renders each account as an outlined BoxButton sized to the card's
 * content width; `menu` renders flat rows inside an unpadded dropdown.
 */
export type AccountSwitcherVariant = 'menu' | 'chooser';

// These strings must stay in a .tsx file: tailwind.config.js scans
// `./src/**/*.tsx`, so classes referenced only from a .ts module are silently
// dropped from the generated stylesheet.
//
// `w-full` is required: a <button> shrinks to fit its content even as a flex
// container. The chooser mirrors BoxButton's `px-4 gap-4` so plain rows beside
// it line their icons and text up with the outlined ones.
const BASE_ROW =
  'flex w-full items-center rounded-md py-3 text-start hover:bg-grey-10 dark:hover:bg-grey-700 disabled:pointer-events-none disabled:opacity-50 focus-visible-default';

export function rowClasses(variant: AccountSwitcherVariant): string {
  return `${BASE_ROW} ${variant === 'chooser' ? 'gap-4 px-4' : 'gap-3 px-4'}`;
}

export function dividerClasses(variant: AccountSwitcherVariant): string {
  return variant === 'chooser'
    ? 'border-grey-100 dark:border-grey-600 mx-0 my-3'
    : 'border-grey-100 dark:border-grey-600 mx-4 my-1';
}

export function labelClasses(variant: AccountSwitcherVariant): string {
  return variant === 'chooser'
    ? 'text-xs uppercase tracking-wide text-grey-400 dark:text-grey-300 px-0 mb-1'
    : 'text-xs uppercase tracking-wide text-grey-400 dark:text-grey-300 px-4 pt-3';
}

export interface AccountRowProps {
  account: SwitchableAccount;
  onSelect?: (account: SwitchableAccount) => void;
  variant?: AccountSwitcherVariant;
  /** Tints the row and bolds the email, marking the suggested account. */
  highlighted?: boolean;
  gleanId?: string;
  /**
   * Submits the surrounding form instead of calling onSelect. Used for the
   * account the cached page is about, whose row *is* the primary action.
   */
  isSubmit?: boolean;
  disabled?: boolean;
  serviceName?: string;
  'data-testid'?: string;
}

export const AccountRow = ({
  account,
  onSelect,
  variant = 'menu',
  highlighted = false,
  gleanId,
  isSubmit = false,
  disabled = false,
  serviceName,
  'data-testid': testId,
}: AccountRowProps) => {
  const { email, avatar, hasSession, isFirefoxSignedIn, isLastUsedForClient } =
    account;
  const isChooser = variant === 'chooser';

  // Line 1 is always the email, line 2 always account state. Display names are
  // optional on Mozilla accounts, so using them would make one row read as a
  // name and the next as an address.
  //
  // Both states share one muted colour: grey-500 is the only one that clears
  // WCAG AA at 12px on both the plain and the highlighted purple fill, so the
  // state is carried by the words rather than by hue.
  const stateClasses =
    'block truncate text-xs text-grey-500 dark:text-grey-200';

  // Last-used wins over signed out: it explains why the row leads, and choosing
  // it prompts for credentials either way.
  const stateLine =
    isLastUsedForClient && serviceName ? (
      <FtlMsg
        id="account-switcher-last-used-for-service"
        vars={{ serviceName }}
      >
        <span className={stateClasses}>Last used for {serviceName}</span>
      </FtlMsg>
    ) : !hasSession ? (
      <FtlMsg id="account-switcher-signed-out">
        <span className={stateClasses}>Signed out</span>
      </FtlMsg>
    ) : isFirefoxSignedIn ? (
      <FtlMsg id="account-switcher-signed-into-firefox">
        <span className={stateClasses}>Signed in to Firefox</span>
      </FtlMsg>
    ) : null;

  const label = (
    <span className="block leading-5">
      <span
        className={`block break-all text-sm ${highlighted ? 'font-semibold' : ''}`}
      >
        {email}
      </span>
      {stateLine}
    </span>
  );

  const sharedProps = {
    type: (isSubmit ? 'submit' : 'button') as 'submit' | 'button',
    onClick: isSubmit ? undefined : () => onSelect?.(account),
    disabled,
    'data-testid': testId || `account-switcher-row-${email}`,
    ...(gleanId && { 'data-glean-id': gleanId }),
  };

  // Outlined BoxButtons, the same primitive the passkey and third-party options
  // use, so the sign-in page's tappable options read as one family.
  if (isChooser) {
    return (
      <BoxButton
        {...sharedProps}
        {...{ highlighted }}
        leadingIcon={
          <Avatar className="w-8 rounded-full" avatar={avatar ?? undefined} />
        }
      >
        {label}
      </BoxButton>
    );
  }

  return (
    <button {...sharedProps} className={rowClasses(variant)}>
      <Avatar
        className="w-8 flex-none rounded-full"
        avatar={avatar ?? undefined}
      />
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
};

export default AccountRow;
