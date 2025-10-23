/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import { useMemo } from 'react';
import { PasswordFormType } from '../FormPasswordWithInlineCriteria';
import { ReactComponent as PassedIcon } from './icon-check.svg';
import { ReactComponent as Failed } from './icon-x.svg';

export type PasswordStrengthInlineProps = {
  isPasswordEmpty: boolean;
  isConfirmedPasswordEmpty: boolean;
  isTooShort: boolean;
  isSameAsEmail: boolean;
  isCommon: boolean;
  isUnconfirmed: boolean | undefined;
  passwordFormType: PasswordFormType;
  requirePasswordConfirmation?: boolean;
};

const ValidationIcon = ({ hasError }: { hasError: boolean }) => {
  return hasError ? (
    <Failed role="img" className="inline-block" aria-label="failed" />
  ) : (
    <PassedIcon role="img" className="inline-block" aria-label="passed" />
  );
};

export const PasswordStrengthInline = ({
  isPasswordEmpty,
  isConfirmedPasswordEmpty,
  isTooShort,
  isSameAsEmail,
  isCommon,
  isUnconfirmed,
  passwordFormType,
  requirePasswordConfirmation,
}: PasswordStrengthInlineProps) => {
  const passwordInstruction = useMemo(() => {
    if (passwordFormType === 'reset') {
      return (
        <FtlMsg id="password-strength-long-instruction">
          <p className="mb-2 text-start">
            Pick a strong password you haven’t used on other sites. Ensure it
            meets the security requirements:
          </p>
        </FtlMsg>
      );
    }

    return (
      <FtlMsg id="password-strength-short-instruction">
        <p className="mb-2 text-start">Pick a strong password:</p>
      </FtlMsg>
    );
  }, [passwordFormType]);

  return (
    <div
      className="text-sm mb-2"
      id="password-strength-inline"
      aria-live="polite"
    >
      {passwordInstruction}
      <ul className="mt-2 mb-2 text-grey-400">
        <li data-testid="password-min-char-req" className="flex -mb-1">
          <span className="w-7 h-7 text-center">
            {isPasswordEmpty && '•'}
            {!isPasswordEmpty && <ValidationIcon hasError={isTooShort} />}
          </span>
          <FtlMsg id="password-strength-inline-min-length">
            <span className="ps-2">At least 8 characters</span>
          </FtlMsg>
        </li>
        <li data-testid="password-not-email-req" className="flex -mb-1">
          <span className="w-7 h-7 text-center">
            {isPasswordEmpty && '•'}
            {!isPasswordEmpty && (
              <ValidationIcon hasError={!isTooShort && isSameAsEmail} />
            )}
          </span>
          <FtlMsg id="password-strength-inline-not-email">
            <span className="ps-2">Not your email address</span>
          </FtlMsg>
        </li>
        <li data-testid="password-not-common-req" className="flex -mb-1">
          <span className="w-7 h-7 text-center">
            {isPasswordEmpty && '•'}
            {!isPasswordEmpty && <ValidationIcon hasError={isCommon} />}
          </span>
          <FtlMsg id="password-strength-inline-not-common">
            <span className="ps-2">Not a commonly used password</span>
          </FtlMsg>
        </li>
        {isUnconfirmed !== undefined && passwordFormType === 'reset' && (
          <li data-testid="passwords-match" className="flex">
            <span className="w-7 h-7 text-center">
              {(isPasswordEmpty || isConfirmedPasswordEmpty) && '•'}
              {!(isPasswordEmpty || isConfirmedPasswordEmpty) && (
                <ValidationIcon hasError={isUnconfirmed} />
              )}
            </span>
            <FtlMsg id="password-strength-inline-confirmed-must-match">
              <span className="ps-2">
                Confirmation matches the new password
              </span>
            </FtlMsg>
          </li>
        )}
        {requirePasswordConfirmation &&
          isUnconfirmed !== undefined &&
          (passwordFormType === 'signup' ||
            passwordFormType === 'post-verify-set-password') && (
            <li data-testid="passwords-match" className="flex">
              <span className="w-7 h-7 text-center">
                {(isPasswordEmpty || isConfirmedPasswordEmpty) && '•'}
                {!(isPasswordEmpty || isConfirmedPasswordEmpty) && (
                  <ValidationIcon hasError={isUnconfirmed} />
                )}
              </span>
              <FtlMsg id="password-strength-inline-passwords-match">
                <span className="ps-2">Passwords match</span>
              </FtlMsg>
            </li>
          )}
      </ul>
    </div>
  );
};

export default PasswordStrengthInline;
