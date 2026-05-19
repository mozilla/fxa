/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import classNames from 'classnames';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import Avatar from '../../../../components/Settings/Avatar';
import { AvatarResponse } from '../../interfaces';

const avatarClassNames = 'h-12 w-12 desktop:h-22 desktop:w-22';

export interface SigninUserLockupProps {
  email: string;
  avatarData: AvatarResponse | undefined;
  avatarLoading: boolean;
  sessionToken?: hexstring;
  additionalAccessibilityInfo?: string;
}

const SigninUserLockup = ({
  email,
  avatarData,
  avatarLoading,
  sessionToken,
  additionalAccessibilityInfo,
}: SigninUserLockupProps) => (
  <div className="mt-8 mb-7 desktop:my-6">
    <div className="flex desktop:flex-col items-center gap-3 desktop:gap-2">
      {sessionToken && avatarData?.account?.avatar ? (
        <Avatar
          className={avatarClassNames}
          avatar={avatarData.account.avatar}
        />
      ) : avatarLoading ? (
        <div
          className={classNames(
            avatarClassNames,
            'flex justify-center items-center'
          )}
        >
          <LoadingSpinner />
        </div>
      ) : (
        // There was an error, so just show default avatar
        <Avatar className={avatarClassNames} />
      )}
      <div className="text-base break-all text-start desktop:text-center">
        {email}
      </div>
    </div>

    {additionalAccessibilityInfo && (
      <p className="mt-6 mb-4 text-sm">{additionalAccessibilityInfo}</p>
    )}
  </div>
);

export default SigninUserLockup;
