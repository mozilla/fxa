/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Chance from 'chance';
import fs from 'fs';
import { Knex, knex } from 'knex';
import path from 'path';

import { ProfileBaseModel } from '../../../../db/models/profile';

export const chance = new Chance();

const thisDir = path.dirname(__filename);
export const avatarTable = fs.readFileSync(
  path.join(thisDir, './avatar.sql'),
  'utf8'
);
export const avatarProvidersTable = fs.readFileSync(
  path.join(thisDir, './avatar-provider.sql'),
  'utf8'
);
export const avatarSelectedTable = fs.readFileSync(
  path.join(thisDir, './avatar-selected.sql'),
  'utf8'
);
export const profileTable = fs.readFileSync(
  path.join(thisDir, './profile.sql'),
  'utf8'
);

export function defaultProvider() {
  return {
    name: 'gravatar',
  };
}

export function randomAvatar(userId: string, providerId: number) {
  return {
    id: chance.guid({ version: 4 }).replace(/-/g, ''),
    url: chance.url(),
    userId,
    providerId,
  };
}

export function randomProfile() {
  return {
    userId: chance.guid({ version: 4 }).replace(/-/g, ''),
    displayName: chance.name(),
  };
}

export async function testProfileDatabaseSetup(instance: Knex): Promise<void> {
  ProfileBaseModel.knex(instance);

  await instance.raw(avatarProvidersTable);
  await instance.raw(avatarTable);
  await instance.raw(avatarSelectedTable);
  await instance.raw(profileTable);

  /* Debugging Assistance
  knex.on('query', (data) => {
    console.dir(data);
  });
  */
}
