/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import classNames from 'classnames';
import { ReactComponent as DefaultAvatar } from './avatar-default.svg';

type AvatarProps = {
  avatarUrl: string | null;
  className?: string;
};

export const Avatar = ({ avatarUrl, className }: AvatarProps) => {
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
    <DefaultAvatar
      data-testid="avatar-default"
      role="img"
      aria-label="Default avatar"
      className={classNames('rounded-full', className)}
    />
  );
};

export default Avatar;
