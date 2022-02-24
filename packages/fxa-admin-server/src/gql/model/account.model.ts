/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { EmailBounce } from './email-bounces.model';
import { Email } from './emails.model';
import { SecurityEvents } from './security-events.model';
import { Totp } from './totp.model';
import { RecoveryKeys } from './recovery-keys.model';
import { SessionTokens } from './session-tokens.model';

@ObjectType()
export class Account {
  @Field((type) => ID)
  public uid!: string;

  @Field()
  public email!: string;

  @Field()
  public emailVerified!: boolean;

  @Field()
  public createdAt!: number;

  @Field({ nullable: true })
  public disabledAt?: number;

  @Field((type) => [Email], { nullable: true })
  public emails!: Email[];

  @Field((type) => [EmailBounce], { nullable: true })
  public emailBounces!: EmailBounce[];

  @Field((type) => [Totp], { nullable: true })
  public totp!: Totp[];

  @Field((type) => [RecoveryKeys], { nullable: true })
  public recoveryKeys!: RecoveryKeys[];

  @Field((type) => [SessionTokens], { nullable: true })
  public sessionTokens!: SessionTokens[];

  @Field((type) => [SecurityEvents], { nullable: true })
  public securityEvents!: SecurityEvents[];
}
