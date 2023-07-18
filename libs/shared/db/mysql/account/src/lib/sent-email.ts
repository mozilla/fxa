/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseModel } from './base';

/**
 * Track subscription related emails sent to FxA users.
 */
export class SentEmail extends BaseModel {
  public static tableName = 'sentEmails';
  public static idColumn = 'id';

  protected $uuidFields = ['uid'];

  // table fields
  public uid!: string;
  public emailTypeId!: number;
  public params!: any;
  public sentAt!: number;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['uid', 'emailType'],
      properties: {
        id: {
          type: 'integer',
        },
        uid: {
          type: 'string',
          pattern: '^(?:[a-fA-F0-9]{2})+$',
        },
        emailTypeId: {
          type: 'integer',
        },
        params: {
          type: 'json',
        },
      },
    };
  }

  $beforeInsert() {
    this.sentAt = Date.now();
  }

  $afterFind() {
    this.params = JSON.parse(this.params);
  }
}
