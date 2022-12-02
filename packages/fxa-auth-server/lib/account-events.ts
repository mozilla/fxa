/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { Container } from 'typedi';

import { AuthFirestore, AppConfig } from '../lib/types';
import { StatsD } from 'hot-shots';

type AccountEvent = {
  name: string;
  createdAt: number;
  eventType: 'emailEvent' | 'securityEvent';

  // Email event properties
  template?: string;

  // General metric properties
  deviceId?: string;
  flowId?: string;
  service?: string;
};

export class AccountEventsManager {
  private firestore: Firestore;
  private usersDbRef;
  private statsd;
  readonly prefix: string;
  readonly name: string;

  constructor() {
    // Users are already stored in the event broker Firebase collection, so we
    // need to grab that prefix.
    const { authFirestore } = Container.get(AppConfig);
    this.prefix = authFirestore.ebPrefix;
    this.name = `${this.prefix}users`;

    this.firestore = Container.get(AuthFirestore);
    this.usersDbRef = this.firestore.collection(this.name);

    this.statsd = Container.get(StatsD);
  }

  /**
   * Records a new email event for the user.
   */
  public async recordEmailEvent(
    uid: string,
    message: AccountEvent,
    name: 'emailSent' | 'emailDelivered' | 'emailBounced' | 'emailComplaint'
  ) {
    try {
      const { template, deviceId, flowId, service } = message;

      const emailEvent = {
        name,
        createdAt: Date.now(),
        eventType: 'emailEvent',
        template,
        deviceId,
        flowId,
        service,
      };

      // Firestore can be configured to ignore undefined keys, but we do it here
      // since it is a global config
      for (const [key, value] of Object.entries(emailEvent)) {
        if (!value) delete emailEvent[key as keyof typeof emailEvent];
      }

      await this.usersDbRef.doc(uid).collection('events').add(emailEvent);
      this.statsd.increment('accountEvents.recordEmailEvent.write');
    } catch (err) {
      // Failing to write to events shouldn't break anything
      this.statsd.increment('accountEvents.recordEmailEvent.error');
    }
  }
}
