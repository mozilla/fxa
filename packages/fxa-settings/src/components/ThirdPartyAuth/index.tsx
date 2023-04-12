/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactComponent as GoogleLogo } from './google-logo.svg';
import { ReactComponent as AppleLogo } from './apple-logo.svg';

export type ThirdPartyAuthProps = {
  enabled?: boolean;
};

const ThirdPartyAuth = ({ enabled = false }: ThirdPartyAuthProps) => {
  if (!enabled) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="text-sm flex items-center justify-center my-6">
          <div className="flex-1 h-px bg-grey-300 divide-x"></div>
          <FtlMsg id="third-party-auth-options-or">
            <div className="mx-4">Or</div>
          </FtlMsg>
          <div className="flex-1 h-px bg-grey-300 divide-x"></div>
        </div>

        <div className="flex flex-col">
          <button
            type="button"
            className="w-full mt-2 justify-center text-black bg-transparent border-black border hover:border-grey-300 font-medium rounded-lg text-sm text-center inline-flex items-center"
          >
            <GoogleLogo />
            <FtlMsg id="continue-with-google-button">
              Continue with Google
            </FtlMsg>
          </button>

          <button
            type="button"
            className="w-full mt-2 justify-center text-black bg-transparent border-black border hover:border-grey-300 font-medium rounded-lg text-sm text-center inline-flex items-center"
          >
            <AppleLogo />
            <FtlMsg id="continue-with-apple-button">Continue with Apple</FtlMsg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ThirdPartyAuth;
