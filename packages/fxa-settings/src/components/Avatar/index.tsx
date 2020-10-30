/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import classNames from 'classnames';
import { useAccount } from '../../models';

type AvatarProps = {
  className?: string;
};

export const Avatar = ({ className }: AvatarProps) => {
  const { avatarUrl } = useAccount();

  if (avatarUrl) {
    return (
      <img
        data-testid="avatar-nondefault"
        src={avatarUrl}
        alt="Your avatar"
        className={classNames(
          'rounded-full bg-grey-200 text-grey-200',
          className
        )}
      />
    );
  }

  return (
    // whatever webkit version firefox on ios 13 uses
    // has a bug that makes the image disappear in some case
    // with inline svgs. img elements don't have this problem.
    // see: https://github.com/mozilla/fxa/issues/6359
    <img
      data-testid="avatar-default"
      // use the default profile image location from content-server
      src="/images/default-profile.svg"
      alt="Default avatar"
      className={classNames(
        'rounded-full bg-grey-200 text-grey-200',
        className
      )}
    />
  );
};

export default Avatar;
