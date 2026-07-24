/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { isEmailValid } from 'fxa-shared/email/helpers';
import { Link, useLocation } from 'react-router';
import GleanMetrics from '../../lib/glean';

// The reset-flow step a footer is rendered on, recorded as the `reason` on the
// remember-password Glean events.
export type RememberPasswordEntrypoint =
  | 'reset_password'
  | 'confirm_reset_password'
  | 'confirm_totp_reset_password'
  | 'confirm_backup_code_reset_password'
  | 'account_recovery_confirm_key'
  | 'complete_reset_password';

export type LinkRememberPasswordProps = {
  email?: string;
  clickHandler?: () => void;
  textStart?: boolean;
  showPasskeyOption?: boolean;
  entrypoint: RememberPasswordEntrypoint;
};

const LinkRememberPassword = ({
  email,
  clickHandler,
  textStart,
  showPasskeyOption = false,
  entrypoint,
}: LinkRememberPasswordProps) => {
  const location = useLocation();

  useEffect(() => {
    GleanMetrics.passwordReset.rememberPasswordLinkView({
      event: {
        has_passkey_option: String(showPasskeyOption),
        reason: entrypoint,
      },
    });
  }, [entrypoint, showPasskeyOption]);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    GleanMetrics.passwordReset.rememberPasswordLinkClick({
      event: {
        has_passkey_option: String(showPasskeyOption),
        reason: entrypoint,
      },
    });
    if (clickHandler) {
      // additional optional click handling behavior
      clickHandler();
    }
  };

  return (
    <div
      className={`flex flex-wrap mt-8 shrink-0 gap-1 text-sm ${
        textStart ? 'text-start' : 'justify-center'
      }`}
    >
      {showPasskeyOption ? (
        <FtlMsg id="remember-password-passkey-text">
          <p>Have a passkey or remember your password?</p>
        </FtlMsg>
      ) : (
        <FtlMsg id="remember-password-text">
          <p>Remember your password?</p>
        </FtlMsg>
      )}
      <FtlMsg id="remember-password-signin-link">
        <Link
          to={`/${location.search}`}
          state={{
            prefillEmail: email && isEmailValid(email) ? email : undefined,
          }}
          className="link-blue"
          id="remember-password"
          onClick={handleClick}
        >
          Sign in
        </Link>
      </FtlMsg>
    </div>
  );
};

export default LinkRememberPassword;
