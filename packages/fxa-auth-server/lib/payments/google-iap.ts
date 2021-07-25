/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { Container } from 'typedi';
import { TypedDocumentReference } from 'typesafe-node-firestore';

import { AppConfig, AuthFirestore, AuthLogger } from '../types';
import { GooglePlans } from './firestore-types';

export class GoogleIAP {
  private firestore: Firestore;
  private log: AuthLogger;
  private prefix: string;

  constructor() {
    const config = Container.get(AppConfig);
    this.firestore = Container.get(AuthFirestore);
    this.log = Container.get(AuthLogger);
    this.prefix = `${config.authFirestore.prefix}googleIap`;
  }

  /**
   * Fetch the Google plan object for Android client usage.
   */
  public async plans() {
    const planDocument = this.firestore.doc(
      `${this.prefix}/plans/default`
    ) as TypedDocumentReference<GooglePlans>;
    const doc = await planDocument.get();
    if (doc.exists) {
      return doc.data()?.plans;
    } else {
      throw Error('Google Plans default document does not exist.');
    }
  }
}
