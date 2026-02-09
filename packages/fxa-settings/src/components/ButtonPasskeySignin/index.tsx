/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LoadingArrowIcon, PasskeyIcon } from '../Icons';
import { FtlMsg } from 'fxa-react/lib/utils';

export type ButtonPasskeySigninProps = {
  loading?: boolean;
  onClick?: () => void;
};

const ButtonPasskeySignin = ({
  loading = false,
  onClick = () => {},
}: ButtonPasskeySigninProps) => {
  const buttonText = loading ? (
    <>
      <LoadingArrowIcon className="h-5 w-5 me-4 animate-spin-slow" ariaHidden />
      <FtlMsg id="button-passkey-signin-loading">Securely signing in…</FtlMsg>
    </>
  ) : (
    <>
      <PasskeyIcon className="h-5 w-5 me-4" ariaHidden />
      <FtlMsg id="button-passkey-signin">Sign in with passkey</FtlMsg>
    </>
  );

  return (
    <button
      type="submit"
      className="cta-xl w-full justify-center font-header text-grey-900 bg-grey-10 border-grey-200 border text-center inline-flex items-center focus-visible-default outline-offset-2 hover:border-grey-600 active:bg-grey-100 disabled:bg-grey-100 disabled:border-grey-600 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={loading}
    >
      {buttonText}
    </button>
  );
};

export default ButtonPasskeySignin;
