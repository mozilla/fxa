/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Firestore } from '@google-cloud/firestore';
import * as grpc from '@grpc/grpc-js';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Creates a firestore instance from a settings object.
 * @param config
 * @returns A firestore instance
 */
export function setupFirestore(config: FirebaseFirestore.Settings) {
  const fsConfig = Object.assign({}, config);
  // keyFilename takes precedence over credentials
  if (fsConfig.keyFilename) {
    delete fsConfig.credentials;
  }

  const testing = !(fsConfig.keyFilename || fsConfig.credentials);

  // Utilize the local firestore emulator when the env indicates
  if (process.env.FIRESTORE_EMULATOR_HOST || testing) {
    return new Firestore({
      customHeaders: {
        Authorization: 'Bearer owner',
      },
      port: 9090,
      projectId: 'demo-fxa',
      servicePath: 'localhost',
      sslCreds: grpc.credentials.createInsecure(),
    });
  } else {
    return new Firestore(fsConfig);
  }
}

/**
 * Factory for providing access to firestore
 */
export const FirestoreService = Symbol('FIRESTORE');
export const FirestoreProvider: Provider<Firestore> = {
  provide: FirestoreService,
  useFactory: (configService: ConfigService) => {
    const firestoreConfig = configService.get('authFirestore');
    if (firestoreConfig == null) {
      throw new Error(
        "Could not locate config for firestore missing 'authFirestore';"
      );
    }
    const firestore = setupFirestore(firestoreConfig);
    return firestore;
  },
  inject: [ConfigService],
};

/**
 * Can be used to satisfy DI when unit testing things that should not need
 * firestore access.
 * Note: this will cause errors to be thrown if firestore is used
 */
export const MockFirestoreProvider: Provider<Firestore> = {
  provide: FirestoreService,
  useFactory: () => {
    return {} as Firestore;
  },
};
