/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';

import { FirestoreConfig } from '@fxa/shared/db/firestore';

// Distinct class so nest-typed-config does not override the root FirestoreConfig provider.
export class MeteringFirestoreConfig extends FirestoreConfig {}

export const MockMeteringFirestoreConfig = {
  projectId: 'test',
  databaseId: 'test-entitlements',
} satisfies MeteringFirestoreConfig;

export const MockMeteringFirestoreConfigProvider = {
  provide: MeteringFirestoreConfig,
  useValue: MockMeteringFirestoreConfig,
} satisfies Provider<MeteringFirestoreConfig>;
