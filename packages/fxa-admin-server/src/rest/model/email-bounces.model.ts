/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum BounceType {
  unmapped,
  Permanent,
  Transient,
  Complaint,
  Undetermined,
}

export enum BounceSubType {
  unmapped,
  Undetermined,
  General,
  NoEmail,
  Suppressed,
  MailboxFull,
  MessageTooLarge,
  ContentRejected,
  AttachmentRejected,
  Abuse,
  AuthFailure,
  Fraud,
  NotSpam,
  Other,
  Virus,
  OnAccountSuppressionList,
}

export class EmailBounce {
  public email!: string;

  public templateName!: string;

  public bounceType!: string;

  public bounceSubType!: string;

  public createdAt!: number;

  public diagnosticCode?: string;
}
