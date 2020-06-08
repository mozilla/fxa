/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, InputType } from 'type-graphql';

@InputType()
export class AttachedClientDisconnectInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field({
    description: 'The OAuth client_id of the connected application.',
    nullable: true,
  })
  public clientId!: string;

  @Field({
    description: 'The id of the sessionToken held by that client, if any.',
    nullable: true,
  })
  public sessionTokenId!: string;

  @Field({
    description:
      'The id of the OAuth refreshToken held by that client, if any.',
    nullable: true,
  })
  public refreshTokenId!: string;

  @Field({
    description:
      "The id of the client's device record, if it has registered one.",
    nullable: true,
  })
  public deviceId!: string;
}
