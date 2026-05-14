/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getAuthInstance } from './auth';
import { UnauthenticatedError } from './auth.error';

export async function getSessionUid(): Promise<string | undefined> {
  const session = await getAuthInstance().auth();
  return session?.user?.id ?? undefined;
}

export async function requireSessionUid(): Promise<string> {
  const uid = await getSessionUid();
  if (!uid) {
    throw new UnauthenticatedError();
  }
  return uid;
}

export async function getSessionEmail(): Promise<string | undefined> {
  const session = await getAuthInstance().auth();
  return session?.user?.email ?? undefined;
}
