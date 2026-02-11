/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Avatar } from './avatar';
import { Profile } from './profile';
import { uuidTransformer } from '../../transformers';

export { ProfileBaseModel } from './profile-base';
export { AvatarProvider } from './avatar-providers';
export { AvatarSelected } from './avatar-selected';

export function selectedAvatar(userId: string) {
  const uid = uuidTransformer.to(userId);
  return Avatar.query()
    .leftJoin('avatar_selected', 'avatars.id', 'avatar_selected.avatarId')
    .where('avatars.userId', uid)
    .whereNotNull('avatar_selected.avatarId')
    .first();
}

export function profileByUid(userId: string) {
  const uid = uuidTransformer.to(userId);
  return Profile.query().findOne({ userId: uid });
}

export { Avatar, Profile };
