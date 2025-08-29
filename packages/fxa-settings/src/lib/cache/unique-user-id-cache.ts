/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { storage } from '../storage';
import { v4 as uuid } from 'uuid';

const STORAGE_KEY__UUID = 'uniqueUserId';

/**
 * Creates a new Unique User Id using v4 uuid format.
 * @returns v4 uuid
 */
export function createUUID() {
  return uuid();
}

/**
 * Gets the current unique user id from cache.
 * @returns
 */
export function getUUID() {
  return storage.local.get(STORAGE_KEY__UUID);
}

/**
 * Sets the current unique user id in cache.
 * @param uuid
 */
export function setUUID(uuid: string) {
  storage.local.set(STORAGE_KEY__UUID, uuid);
}

/**
 * Removes the current unique user id from cache.
 */
export function removeUUID() {
  storage.local.remove(STORAGE_KEY__UUID);
}
