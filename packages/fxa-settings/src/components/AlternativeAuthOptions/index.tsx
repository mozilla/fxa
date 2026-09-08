/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { QueryParams } from '../..';
import ButtonPasskeySignin from '../ButtonPasskeySignin';
import ThirdPartyAuth from '../ThirdPartyAuth';

export interface PasskeySignInBinding {
  isLoading?: boolean;
  onClick: () => void;
}

export interface AlternativeAuthOptionsProps {
  viewName?: string;
  flowQueryParams?: QueryParams;
  isStandalone?: boolean;
  showThirdPartyAuth?: boolean;
  showPasskeySignin?: boolean;
  /** Required for the passkey button to render, even when `showPasskeySignin` is true. */
  passkeySignIn?: PasskeySignInBinding;
  errorBanner?: React.ReactNode;
  /** Locks every option; the passkey button keeps its own spinner via `isLoading`. */
  disabled?: boolean;
  onContinueWithGoogle?: () => void;
  onContinueWithApple?: () => void;
}

const AlternativeAuthOptions = ({
  viewName = 'unknown',
  flowQueryParams,
  isStandalone = false,
  showThirdPartyAuth = true,
  showPasskeySignin = false,
  passkeySignIn,
  errorBanner,
  disabled = false,
  onContinueWithGoogle,
  onContinueWithApple,
}: AlternativeAuthOptionsProps) => {
  const renderPasskey = showPasskeySignin && !!passkeySignIn;
  const hasContent = renderPasskey || showThirdPartyAuth;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {!isStandalone && (
        <div
          className={`text-sm flex items-center justify-center mt-6 ${
            errorBanner ? 'mb-0' : 'mb-6'
          }`}
        >
          <div className="flex-1 h-px bg-grey-300 divide-x"></div>
          <FtlMsg id="third-party-auth-options-or">
            <div className="mx-4 text-base text-grey-500 dark:text-grey-200 font-extralight">
              or
            </div>
          </FtlMsg>
          <div className="flex-1 h-px bg-grey-300 divide-x"></div>
        </div>
      )}

      {errorBanner}

      <div className="flex flex-col gap-2.5">
        {renderPasskey && (
          <ButtonPasskeySignin
            isLoading={passkeySignIn.isLoading}
            disabled={disabled}
            onClick={passkeySignIn.onClick}
          />
        )}
        {showThirdPartyAuth && (
          <ThirdPartyAuth
            {...{
              viewName,
              flowQueryParams,
              disabled,
              onContinueWithGoogle,
              onContinueWithApple,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AlternativeAuthOptions;
