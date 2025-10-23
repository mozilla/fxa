/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized } from '@fluent/react';
import classNames from 'classnames';
import { AccountAvatar } from '../../../lib/interfaces';
import defaultAvatar from './avatar-default.svg';

type AvatarProps = {
  className?: string;
  avatar?: AccountAvatar;
};

export const Avatar = ({ className, avatar }: AvatarProps) => {
  if (avatar?.url) {
    return (
      <Localized id="avatar-your-avatar" attrs={{ alt: true }}>
        <img
          data-testid="avatar-nondefault"
          src={avatar.url}
          alt="Your avatar"
          className={classNames('rounded-full bg-white', className)}
        />
      </Localized>
    );
  }

  return (
    // whatever webkit version firefox on ios 13 uses
    // has a bug that makes the image disappear in some case
    // with inline svgs. img elements don't have this problem.
    // see: https://github.com/mozilla/fxa/issues/6359
    <Localized id="avatar-default-avatar" attrs={{ alt: true }}>
      <img
        data-testid="avatar-default"
        src={defaultAvatar}
        alt="Default avatar"
        className={classNames('rounded-full', className)}
      />
    </Localized>
  );
};

export default Avatar;
