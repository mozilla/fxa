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
  onContinueWithGoogle,
  onContinueWithApple,
}: AlternativeAuthOptionsProps) => {
  const renderPasskey = showPasskeySignin && !!passkeySignIn;
  const hasContent = renderPasskey || showThirdPartyAuth;

  if (!hasContent) {
    return null;
  }

  const variant = renderPasskey ? 'box' : 'icon';

  // inline → 'or'; standalone + icon → 'Sign in with'; standalone + box → no separator
  let separator: { ftlId: string; defaultText: string } | null = null;
  if (!isStandalone) {
    separator = { ftlId: 'third-party-auth-options-or', defaultText: 'or' };
  } else if (!renderPasskey) {
    separator = {
      ftlId: 'third-party-auth-options-sign-in-with',
      defaultText: 'Sign in with',
    };
  }

  return (
    <div className="flex flex-col">
      {separator && (
        <div
          className={`text-sm flex items-center justify-center mt-6 ${
            errorBanner ? 'mb-3' : 'mb-6'
          }`}
        >
          <div className="flex-1 h-px bg-grey-300 divide-x"></div>
          <FtlMsg id={separator.ftlId}>
            <div className="mx-4 text-base text-grey-500 dark:text-grey-200 font-extralight">
              {separator.defaultText}
            </div>
          </FtlMsg>
          <div className="flex-1 h-px bg-grey-300 divide-x"></div>
        </div>
      )}

      {errorBanner && <div className="mb-4">{errorBanner}</div>}

      <div className="flex flex-col gap-2.5">
        {renderPasskey && (
          <ButtonPasskeySignin
            isLoading={passkeySignIn.isLoading}
            onClick={passkeySignIn.onClick}
          />
        )}
        {showThirdPartyAuth && (
          <ThirdPartyAuth
            {...{
              variant,
              viewName,
              flowQueryParams,
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
