/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { PasskeyIcon } from '../Icons';
import { FtlMsg } from 'fxa-react/lib/utils';
import BoxButton from '../BoxButton';

export type ButtonPasskeySigninProps = {
  isLoading?: boolean;
  onClick?: () => void;
};

const ButtonPasskeySignin = ({
  isLoading = false,
  onClick = () => {},
}: ButtonPasskeySigninProps) => (
  <BoxButton
    type="button"
    leadingIcon={<PasskeyIcon className="w-5 h-5" ariaHidden />}
    isLoading={isLoading}
    onClick={onClick}
  >
    {isLoading ? (
      <FtlMsg id="button-passkey-signin-loading">Securely signing in…</FtlMsg>
    ) : (
      <FtlMsg id="button-passkey-signin">Sign in with passkey</FtlMsg>
    )}
  </BoxButton>
);

export default ButtonPasskeySignin;
