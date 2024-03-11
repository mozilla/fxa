/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { KeyIconListItem } from '../IconListItem';

export const PasswordInfoBalloon = () => {
  return (
    <div
      className="input-balloon"
      id="password-info-balloon"
      aria-live="polite"
    >
      <ul>
        <KeyIconListItem>
          <>
            <FtlMsg id="password-info-balloon-why-password-info">
              <p>
                You need this password to access any encrypted data you store
                with us.
              </p>
            </FtlMsg>
            <FtlMsg id="password-info-balloon-reset-risk-info">
              <p>
                A reset means potentially losing data like passwords and
                bookmarks.
              </p>
            </FtlMsg>
          </>
        </KeyIconListItem>
      </ul>
    </div>
  );
};

export default PasswordInfoBalloon;
