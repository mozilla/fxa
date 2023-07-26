/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseModel } from './base';
import { Device } from './device';
import { Email } from './email';
import { LinkedAccount } from './linked-account';
import { SecurityEvent } from './security-event';

export class Account extends BaseModel {
  static tableName = 'accounts';
  static idColumn = 'uid';

  protected $uuidFields = [
    'authSalt',
    'emailCode',
    'kA',
    'uid',
    'verifyHash',
    'wrapWrapKb',
  ];

  // table fields
  authSalt!: string;
  createdAt!: number;
  devices?: Device[];
  disabledAt?: number;
  email!: string;
  emailCode!: string;
  emails?: Email[];
  emailVerified!: boolean;
  kA!: string;
  keysChangedAt!: number;
  linkedAccounts?: LinkedAccount[];
  locale!: string;
  lockedAt!: number;
  metricsOptOutAt?: number;
  normalizedEmail!: string;
  primaryEmail?: Email;
  profileChangedAt!: number;
  securityEvents?: SecurityEvent[];
  uid!: string;
  verifierSetAt!: number;
  verifierVersion!: number;
  verifyHash?: string;
  wrapWrapKb!: string;

  static relationMappings = {
    emails: {
      join: {
        from: 'accounts.uid',
        to: 'emails.uid',
      },
      modelClass: Email,
      relation: BaseModel.HasManyRelation,
    },
    devices: {
      join: {
        from: 'accounts.uid',
        to: 'devices.uid',
      },
      modelClass: Device,
      relation: BaseModel.HasManyRelation,
    },
    linkedAccounts: {
      join: {
        from: 'accounts.uid',
        to: 'linkedAccounts.uid',
      },
      modelClass: LinkedAccount,
      relation: BaseModel.HasManyRelation,
    },
    securityEvents: {
      join: {
        from: 'accounts.uid',
        to: 'securityEvents.uid',
      },
      modelClass: SecurityEvent,
      relation: BaseModel.HasManyRelation,
    },
  };
}
