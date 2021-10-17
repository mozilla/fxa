/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import * as grpc from '@grpc/grpc-js';

import { ConfigType } from '../config';

export function setupFirestore(config: ConfigType) {
  const fsConfig = Object.assign({}, config.authFirestore);
  // keyFilename takes precedence over credentials
  if (fsConfig.keyFilename) {
    /* istanbul ignore next */
    // @ts-ignore
    delete fsConfig.credentials;
  }

  // Utilize the local firestore emulator when the env indicates
  if (process.env.FIRESTORE_EMULATOR_HOST) {
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
