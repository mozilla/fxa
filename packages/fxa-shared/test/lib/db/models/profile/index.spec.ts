/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { assert } from 'chai';
import Knex from 'knex';
import 'mocha';

import {
  chance,
  testDatabaseSetup,
  randomAvatar,
  randomProfile,
  defaultProvider,
} from './helpers';

import {
  profileByUid,
  selectedAvatar,
} from '../../../../../lib/db/models/profile';
import {
  Avatar,
  AvatarProvider,
  AvatarSelected,
  Profile,
} from '../../../../../lib/db/models/profile';

const PROFILE_1 = randomProfile();
const PROFILE_2 = randomProfile();

describe('auth', () => {
  let knex: Knex;
  let avatar: Avatar;

  before(async () => {
    knex = await testDatabaseSetup();
    // Load the default provider and grab its id
    const provider = await AvatarProvider.query().insert(defaultProvider());
    // Load a random profile in
    const profile = await Profile.query().insert(PROFILE_1);
    // Load another random profile
    const profile2 = await Profile.query().insert(PROFILE_2);
    // Load a random avatar
    avatar = await Avatar.query().insert(
      randomAvatar(profile.userId, provider.id)
    );
    // Link the avatar to profile
    await AvatarSelected.query().insert({
      userId: profile.userId,
      avatarId: avatar.id,
    });
  });

  after(async () => {
    await knex.destroy();
  });

  describe('profileByUid', () => {
    it('retrieves profile successfully', async () => {
      const result = await profileByUid(PROFILE_1.userId);
      assert.deepInclude(result, PROFILE_1);
    });

    it('does not retrieve a non-existent profile', async () => {
      const uid = chance.guid({ version: 4 }).replace(/-/g, '');
      const result = await profileByUid(uid);
      assert.isUndefined(result);
    });
  });

  describe('selectedAvatar', () => {
    it('retrieves selected avatar successfully', async () => {
      const result = await selectedAvatar(PROFILE_1.userId);
      assert.deepEqual(result, avatar);
    });

    it('does not retrieve an avatar if none selected', async () => {
      const result = await selectedAvatar(PROFILE_2.userId);
      assert.isUndefined(result);
    });
  });
});
