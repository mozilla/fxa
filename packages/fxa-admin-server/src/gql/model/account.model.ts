/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { AttachedClient } from './attached-clients.model';
import { EmailBounce } from './email-bounces.model';
import { Email } from './emails.model';
import { RecoveryKeys } from './recovery-keys.model';
import { SecurityEvents } from './security-events.model';
import { Totp } from './totp.model';
import { LinkedAccount } from './linked-account.model';
import { AccountEvent } from './account-events.model';
import { MozSubscription } from './moz-subscription.model';
import { Cart } from './cart.model';
import { BackupCodes } from './backup-code.model';
import { RecoveryPhone } from './recovery-phone.model';

@ObjectType()
export class Account {
  @Field((type) => ID)
  public uid!: string;

  @Field()
  public email!: string;

  @Field()
  public emailVerified!: boolean;

  @Field({ nullable: true })
  public clientSalt?: string;

  @Field()
  public createdAt!: number;

  @Field({ nullable: true })
  public disabledAt?: number;

  @Field({ nullable: true })
  public locale?: string;

  @Field({ nullable: true })
  public lockedAt?: number;

  @Field({ nullable: true })
  public verifierSetAt?: number;

  @Field((type) => [Email], { nullable: true })
  public emails!: Email[];

  @Field((type) => [EmailBounce], { nullable: true })
  public emailBounces!: EmailBounce[];

  @Field((type) => [Totp], { nullable: true })
  public totp!: Totp[];

  @Field((type) => [RecoveryKeys], { nullable: true })
  public recoveryKeys!: RecoveryKeys[];

  @Field((type) => [SecurityEvents], { nullable: true })
  public securityEvents!: SecurityEvents[];

  @Field((type) => [AttachedClient], { nullable: true })
  public attachedClients!: AttachedClient[];

  @Field((type) => [MozSubscription], { nullable: true })
  public subscriptions!: MozSubscription[];

  @Field((type) => [LinkedAccount], { nullable: true })
  public linkedAccounts!: LinkedAccount[];

  @Field((type) => [AccountEvent], { nullable: true })
  public accountEvents!: AccountEvent[];

  @Field((type) => [Cart], { nullable: true })
  public carts!: Cart[];

  @Field((type) => [BackupCodes], { nullable: true })
  public backupCodes!: BackupCodes[];

  @Field((type) => [RecoveryPhone], { nullable: true })
  public recoveryPhone!: RecoveryPhone[];
}
