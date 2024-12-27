/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { AttachedClient } from './attachedClient';
import { Avatar } from './avatar';
import { Email } from './emails';
import { Subscription } from './subscription';
import { Totp } from './totp';
import { LinkedAccount } from './linkedAccount';
import { SecurityEvent } from './securityEvent';
import { RecoveryKey } from './recoveryKey';
import { BackupCodes } from './backupCodes';
import { RecoveryPhone } from './recoveryPhone';

@ObjectType({
  description: "The current authenticated user's Firefox Account record.",
})
export class Account {
  @Field((type) => ID, { description: 'Firefox Account User ID.' })
  public uid!: string;

  @Field({ description: 'Timestamp when the account was created.' })
  public accountCreated!: number;

  @Field({ description: 'Timestamp the password was created or last changed.' })
  public passwordCreated!: number;

  @Field({ nullable: true, description: 'Display name the user has set.' })
  public displayName!: string;

  @Field((type) => Avatar)
  public avatar!: Avatar;

  @Field({ nullable: true, description: 'User locale.' })
  public locale!: string;

  @Field((type) => [Subscription], {
    description: 'Active subscriptions for the user.',
  })
  public subscriptions!: Subscription[];

  @Field((type) => Totp)
  public totp!: Totp;

  @Field((type) => BackupCodes)
  public backupCodes!: BackupCodes;

  @Field((type) => RecoveryKey, {
    description: 'Whether the user has had an account recovery key issued.',
  })
  public recoveryKey!: RecoveryKey;

  @Field({ description: 'Whether metrics are enabled and may be reported' })
  public metricsEnabled!: boolean;

  @Field((type) => [Email], { description: 'Email addresses for the user.' })
  public emails!: Email[];

  @Field((type) => [AttachedClient], {
    description: 'Client sessions attached to the user.',
  })
  public attachedClients!: AttachedClient;

  @Field((type) => [LinkedAccount], {
    description: 'Linked accounts',
  })
  public linkedAccounts!: LinkedAccount;

  @Field((type) => [SecurityEvent], {
    description: 'Security events',
  })
  public securityEvents!: SecurityEvent[];

  @Field((type) => RecoveryPhone, {
    description: 'Users recovery phone details',
  })
  public recoveryPhone!: RecoveryPhone;
}
