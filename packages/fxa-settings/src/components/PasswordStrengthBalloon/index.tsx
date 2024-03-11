/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import LinkExternal from 'fxa-react/components/LinkExternal';
import React from 'react';
import { ReactComponent as LockIcon } from './icon-lock.svg';
import { ReactComponent as BlueCheckIcon } from './icon-check-blue-50.svg';
import { ReactComponent as AlertIcon } from './icon-warning-red-50.svg';
import { FtlMsg } from 'fxa-react/lib/utils';

export type PasswordStrengthBalloonProps = {
  hasUserTakenAction: boolean;
  isTooShort: boolean;
  isSameAsEmail: boolean;
  isCommon: boolean;
};

const ValidationIcon = ({ hasError }: { hasError: boolean }) => {
  return hasError ? <AlertIcon role="img" /> : <BlueCheckIcon role="img" />;
};

export const PasswordStrengthBalloon = ({
  hasUserTakenAction,
  isTooShort,
  isSameAsEmail,
  isCommon,
}: PasswordStrengthBalloonProps) => {
  return (
    <div
      className="input-balloon"
      id="password-strength-balloon"
      aria-live="polite"
    >
      <FtlMsg id="password-strength-balloon-heading">
        <h2 className="mb-2">Password requirements</h2>
      </FtlMsg>
      <ul>
        <li data-testid="password-min-char-req" className="flex">
          <span className="w-4 h-4 text-center">
            {!hasUserTakenAction && '•'}
            {hasUserTakenAction && <ValidationIcon hasError={isTooShort} />}
          </span>
          <FtlMsg id="password-strength-balloon-min-length">
            <span className="ltr:pl-2 rtl:pr-2">At least 8 characters</span>
          </FtlMsg>
        </li>
        <li data-testid="password-not-email-req" className="flex">
          <span className="w-4 h-4 text-center">
            {!hasUserTakenAction && '•'}
            {hasUserTakenAction && (
              <ValidationIcon hasError={!isTooShort && isSameAsEmail} />
            )}
          </span>
          <FtlMsg id="password-strength-balloon-not-email">
            <span className="ltr:pl-2 rtl:pr-2">Not your email address</span>
          </FtlMsg>
        </li>
        <li data-testid="password-not-common-req" className="flex">
          <span className="w-4 h-4 text-center">
            {!hasUserTakenAction && '•'}
            {hasUserTakenAction && <ValidationIcon hasError={isCommon} />}
          </span>
          <FtlMsg id="password-strength-balloon-not-common">
            <span className="ltr:pl-2 rtl:pr-2">
              Not a commonly used password
            </span>
          </FtlMsg>
        </li>

        <li className="mt-2 flex">
          <span className="w-8 h-8 ">
            <LockIcon />
          </span>
          <FtlMsg
            id="password-strength-balloon-stay-safe-tips"
            elems={{
              LinkExternal: (
                <LinkExternal
                  href="https://support.mozilla.org/kb/password-strength"
                  data-testid="password-strength-tips-link"
                  className="link-grey"
                  // removed this link from the focus order because it was preventing tabbing between password fields
                  tabIndex={-1}
                >
                  create strong passwords
                </LinkExternal>
              ),
            }}
          >
            <span className="ltr:pl-2 rtl:pr-2" data-testid="password-tip">
              Stay safe &mdash; don’t reuse passwords. See more tips to{' '}
              <LinkExternal
                href="https://support.mozilla.org/kb/password-strength"
                data-testid="password-strength-tips-link"
                className="link-grey"
              >
                create strong passwords
              </LinkExternal>
              .
            </span>
          </FtlMsg>
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthBalloon;
