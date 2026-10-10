/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Firestore } from '@google-cloud/firestore';
import { Provider } from '@nestjs/common';

import { createFirestore } from '@fxa/shared/db/firestore';

import { MeteringFirestoreConfig } from './metering-firestore.config';

export const MeteringFirestore = Symbol('METERING_FIRESTORE');

export const MeteringFirestoreProvider: Provider<Firestore> = {
  provide: MeteringFirestore,
  useFactory: createFirestore,
  inject: [MeteringFirestoreConfig],
};

export const MockMeteringFirestoreProvider: Provider<Firestore> = {
  provide: MeteringFirestore,
  useFactory: () => {
    return {
      collection: () => {},
    } as unknown as Firestore;
  },
};
