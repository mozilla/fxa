/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ReactComponent as PassedIcon } from './icon-check.svg';
import { ReactComponent as Failed } from './icon-x.svg';
import { FtlMsg } from 'fxa-react/lib/utils';

export type PasswordStrengthInlineProps = {
  hasUserTakenAction: boolean;
  isTooShort: boolean;
  isSameAsEmail: boolean;
  isCommon: boolean;
  isUnconfirmed: boolean | undefined;
};

const ValidationIcon = ({ hasError }: { hasError: boolean }) => {
  return hasError ? (
    <Failed role="img" className="inline-block" aria-label="failed" />
  ) : (
    <PassedIcon role="img" className="inline-block" aria-label="passed" />
  );
};

export const PasswordStrengthInline = ({
  hasUserTakenAction,
  isTooShort,
  isSameAsEmail,
  isCommon,
  isUnconfirmed,
}: PasswordStrengthInlineProps) => {
  return (
    <div
      className="leading-5 text-sm"
      id="password-strength-inline"
      aria-live="polite"
    >
      <p className="mb-2">
        Pick a strong password you haven’t used on other sites. Ensure it meets
        the security requirements:
      </p>
      <ul className="mt-2 mb-2">
        <li data-testid="password-min-char-req" className="flex ">
          <span className="w-7 h-7 text-center">
            {!hasUserTakenAction && '•'}
            {hasUserTakenAction && <ValidationIcon hasError={isTooShort} />}
          </span>
          <FtlMsg id="password-strength-inline-min-length">
            <span
              className={`ltr:pl-2 rtl:pr-2 ${
                isTooShort ? 'text-red-700' : ''
              }`}
            >
              At least 8 characters
            </span>
          </FtlMsg>
        </li>
        <li data-testid="password-not-email-req" className="flex ">
          <span className="w-7 h-7 text-center">
            {!hasUserTakenAction && '•'}
            {hasUserTakenAction && (
              <ValidationIcon hasError={!isTooShort && isSameAsEmail} />
            )}
          </span>
          <FtlMsg id="password-strength-inline-not-email">
            <span
              className={`ltr:pl-2 rtl:pr-2 ${
                !isTooShort && isSameAsEmail ? 'text-red-700' : ''
              }`}
            >
              Not your email address
            </span>
          </FtlMsg>
        </li>
        <li data-testid="password-not-common-req" className="flex ">
          <span className="w-7 h-7 text-center">
            {!hasUserTakenAction && '•'}
            {hasUserTakenAction && <ValidationIcon hasError={isCommon} />}
          </span>
          <FtlMsg id="password-strength-inline-not-common">
            <span
              className={`ltr:pl-2 rtl:pr-2 ${isCommon ? 'text-red-700' : ''}`}
            >
              Not a commonly used password
            </span>
          </FtlMsg>
        </li>
        {isUnconfirmed !== undefined && (
          <li data-testid="passwords-match" className="flex ">
            <span className="w-7 h-7 text-center">
              {!hasUserTakenAction && '•'}
              {hasUserTakenAction && (
                <ValidationIcon hasError={isUnconfirmed} />
              )}
            </span>
            <FtlMsg id="password-strength-inline-confirmed-must-match">
              <span
                className={`ltr:pl-2 rtl:pr-2 ${
                  isUnconfirmed ? 'text-red-700' : ''
                }`}
              >
                Confirmed password must match
              </span>
            </FtlMsg>
          </li>
        )}
      </ul>
    </div>
  );
};

export default PasswordStrengthInline;
