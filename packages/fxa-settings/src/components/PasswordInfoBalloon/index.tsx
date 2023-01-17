/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactComponent as IconKey } from './icon-key-grey-50.svg';

export const PasswordInfoBalloon = () => {
  return (
    <>
      <div className="input-balloon flex gap-2 items-start text-xs">
        <div className="ltr:mr-1 rtl:ml-1">
          <IconKey className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-4">
          <FtlMsg id="password-info-balloon-why-password-info">
            <p>
              You need this password to access any encrypted data you store with
              us.
            </p>
          </FtlMsg>
          <FtlMsg id="password-info-balloon-reset-risk-info">
            <p>
              A reset means potentially losing data like passwords and
              bookmarks.
            </p>
          </FtlMsg>
        </div>
      </div>
    </>
  );
};

export default PasswordInfoBalloon;
