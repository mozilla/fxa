/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseAuthModel, Proc } from './base-auth';

const BOUNCE_TYPES = {
  __fxa__unmapped: 0,
  Permanent: 1,
  Transient: 2,
  Complaint: 3,
} as const;

const BOUNCE_SUB_TYPES = {
  __fxa__unmapped: 0,
  Undetermined: 1,
  General: 2,
  NoEmail: 3,
  Suppressed: 4,
  MailboxFull: 5,
  MessageTooLarge: 6,
  ContentRejected: 7,
  AttachmentRejected: 8,
  abuse: 9,
  'auth-failure': 10,
  fraud: 11,
  'not-spam': 12,
  other: 13,
  virus: 14,
} as const;

export type BounceType = keyof typeof BOUNCE_TYPES;
export type BounceSubType = keyof typeof BOUNCE_SUB_TYPES;

export class EmailBounce extends BaseAuthModel {
  public static tableName = 'emailBounces';
  public static idColumn = ['email', 'createdAt'];

  // table fields
  email!: string;
  bounceType!: number;
  bounceSubType!: number;
  createdAt!: number;

  static async create({
    email,
    bounceType,
    bounceSubType,
  }: Pick<EmailBounce, 'email'> & {
    bounceType: BounceType;
    bounceSubType: BounceSubType;
  }) {
    return EmailBounce.query().insert({
      email,
      bounceType: BOUNCE_TYPES[bounceType],
      bounceSubType: BOUNCE_SUB_TYPES[bounceSubType],
      createdAt: Date.now(),
    });
  }

  static async findByEmail(email: string) {
    const { rows } = await EmailBounce.callProcedure(Proc.EmailBounces, email);
    return rows.map((row: any) => EmailBounce.fromDatabaseJson(rows));
  }
}
