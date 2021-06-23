/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseAuthModel } from './base-auth';

/**
 * Track subscription related emails sent to FxA users.
 */

export class EmailType extends BaseAuthModel {
  public static tableName = 'emailTypes';
  public static idColumn = 'id';

  public id!: number;
  public emailType!: string;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['emailType'],
      properties: {
        id: {
          type: 'integer',
        },
        emailType: {
          type: 'string',
        },
      },
    };
  }
}
