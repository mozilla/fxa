/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, ID, ObjectType } from 'type-graphql';
import { Email } from './emails';
import { AttachedClient } from './attachedClient';
import { Totp } from './totp';
import { Subscription } from './subscription';

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

  @Field({ nullable: true, description: "URL for the user's avatar." })
  public avatarUrl!: string;

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

  @Field((type) => [Email], { description: 'Email addresses for the user.' })
  public emails!: Email[];

  @Field((type) => [AttachedClient], {
    description: 'Client sessions attached to the user.',
  })
  public attachedClients!: AttachedClient;
}
