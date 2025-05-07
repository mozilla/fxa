/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { Container } from 'typedi';

import { AuthFirestore, AppConfig } from '../lib/types';
import { StatsD } from 'hot-shots';
import { SecurityEventNames } from 'fxa-shared/db/models/auth/security-event';

type BaseEvent = {
  // General metric properties
  deviceId?: string;
  flowId?: string;
  service?: string;
};

type EmailEvent = BaseEvent & {
  createdAt: number;
  name: string;
  eventType: 'emailEvent';
  template: string;
};

interface SecurityEventAdditionalInfo {
  userAgent?: string;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  recoveryPhone?: {
    phoneNumber?: string;
  };
}

type SecurityEvent = BaseEvent & {
  uid: string;
  name: SecurityEventNames;
  ipAddr: string;
  tokenId?: string;
  additionalInfo?: SecurityEventAdditionalInfo;
};

type AuthDatabase = {
  securityEvent: (arg: SecurityEvent) => void;
};

type EmailEventName =
  | 'emailSent'
  | 'emailDelivered'
  | 'emailBounced'
  | 'emailComplaint';

export class AccountEventsManager {
  private firestore?: Firestore;
  private usersDbRef?;
  private statsd;
  readonly prefix: string;
  readonly name: string;
  readonly ipHmacKey: string;

  constructor() {
    // Users are already stored in the event broker Firebase collection, so we
    // need to grab that prefix.
    const { authFirestore, securityHistory } = Container.get(AppConfig);
    this.ipHmacKey = securityHistory.ipHmacKey;
    this.prefix = authFirestore.ebPrefix;
    this.name = `${this.prefix}users`;

    // Firestore is only need for email events
    if (Container.has(AuthFirestore)) {
      this.firestore = Container.get(AuthFirestore);
      this.usersDbRef = this.firestore.collection(this.name);
    }

    this.statsd = Container.get(StatsD);
  }

  /**
   * This function removes null or undefined values from an object. This ideally
   * saves of database storage space. This function could be optimized but instead
   * leaned on the simple approach of using JSON.stringify and JSON.parse because
   * security events are not blocking events and recorded aysnc.
   *
   * @param obj
   * @private
   */
  private cleanObject(obj: any): any {
    return JSON.parse(
      JSON.stringify(obj, (key, value) => {
        if (value === null || value === undefined) return undefined;
        return value;
      })
    );
  }

  /**
   * Records a new email event for the user.
   */
  public async recordEmailEvent(
    uid: string,
    message: EmailEvent,
    name: EmailEventName
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

      await this.usersDbRef?.doc(uid).collection('events').add(emailEvent);
      this.statsd.increment('accountEvents.recordEmailEvent.write');
    } catch (err) {
      // Failing to write to events shouldn't break anything
      this.statsd.increment('accountEvents.recordEmailEvent.error');
    }
  }

  public async findEmailEvents(
    uid: string,
    eventName: EmailEventName,
    template: string,
    startDate: number,
    endDate: number
  ) {
    const query = this.usersDbRef
      ?.doc(uid)
      .collection('events')
      .where('eventType', '==', 'emailEvent')
      .where('name', '==', eventName)
      .where('template', '==', template)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate);

    const snapshot = await query?.get();
    return snapshot?.docs.map((doc) => doc.data());
  }

  /**
   * Record a security event for the user. This is based on our security events
   * that are stored in MySQL.
   *
   * @param db - auth db
   * @param message - message
   */
  public recordSecurityEvent(db: AuthDatabase, message: SecurityEvent) {
    const { uid, name, ipAddr, tokenId, additionalInfo } = message;

    const eventData: SecurityEvent = {
      name,
      uid,
      ipAddr,
      tokenId,
      ...(additionalInfo && {
        // Remove all undefined or null values from additionalInfo, we don't want to
        // store them in the database
        additionalInfo: this.cleanObject(additionalInfo),
      }),
    };

    try {
      db.securityEvent(eventData);
      this.statsd.increment(`accountEvents.recordSecurityEvent.write.${name}`);
    } catch (err) {
      // Failing to write to events shouldn't break anything
      this.statsd.increment(`accountEvents.recordSecurityEvent.error.${name}`);
    }
  }
}
