/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { AttachedClient } from './attachedClient';
import { Avatar } from './avatar';
import { Email } from './emails';
import { Subscription } from './subscription';
import { Totp } from './totp';

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

  @Field({ description: 'Whether the user has had a recovery key issued.' })
  public recoveryKey!: boolean;

  @Field({
    nullable: true,
    description:
      'Timestamp of when the user opted out of account metrics, null otherwise',
  })
  public metricsOptOutAt!: number;

  @Field((type) => [Email], { description: 'Email addresses for the user.' })
  public emails!: Email[];

  @Field((type) => [AttachedClient], {
    description: 'Client sessions attached to the user.',
  })
  public attachedClients!: AttachedClient;
}
