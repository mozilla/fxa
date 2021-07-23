/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { Container } from 'typedi';

import { AuthFirestore, AuthLogger } from '../types';

export class GoogleIAP {
  private firestore: Firestore;
  private log: AuthLogger;

  constructor() {
    this.firestore = Container.get(AuthFirestore);
    this.log = Container.get(AuthLogger);
  }
}
