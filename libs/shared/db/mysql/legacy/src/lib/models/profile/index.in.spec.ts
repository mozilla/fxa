/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'reflect-metadata';

import { Knex } from 'knex';

import {
  Avatar,
  AvatarProvider,
  AvatarSelected,
  Profile,
  profileByUid,
  selectedAvatar,
} from '.';
import { defaultOpts, testDatabaseSetup } from '../../testing/helpers';
import {
  chance,
  defaultProvider,
  randomAvatar,
  randomProfile,
} from '../../testing/models/profile/helpers';

const PROFILE_1 = randomProfile();
const PROFILE_2 = randomProfile();

describe('auth', () => {
  let knex: Knex;
  let avatar: Avatar;

  beforeAll(async () => {
    knex = await testDatabaseSetup({
      ...defaultOpts,
      auth: false,
      profile: true,
      oauth: false,
    });
    // Load the default provider and grab its id
    const provider = await AvatarProvider.query().insert(defaultProvider());
    // Load a random profile in
    const profile = await Profile.query().insert(PROFILE_1);
    // Load another random profile
    await Profile.query().insert(PROFILE_2);
    // Load a random avatar
    avatar = await Avatar.query().insert(
      randomAvatar(profile.userId, provider.id)
    );
    // Link the avatar to profile
    await AvatarSelected.query().insert({
      userId: profile.userId,
      avatarId: avatar.id,
    });
  }, 20000);

  afterAll(async () => {
    await knex?.destroy();
  });

  describe('profileByUid', () => {
    it('retrieves profile successfully', async () => {
      const result = await profileByUid(PROFILE_1.userId);
      expect(result).toMatchObject(PROFILE_1);
    });

    it('does not retrieve a non-existent profile', async () => {
      const uid = chance.guid({ version: 4 }).replace(/-/g, '');
      const result = await profileByUid(uid);
      expect(result).toBeUndefined();
    });
  });

  describe('selectedAvatar', () => {
    it('retrieves selected avatar successfully', async () => {
      const result = await selectedAvatar(PROFILE_1.userId);
      expect(result).toEqual(avatar);
    });

    it('does not retrieve an avatar if none selected', async () => {
      const result = await selectedAvatar(PROFILE_2.userId);
      expect(result).toBeUndefined();
    });
  });
});
