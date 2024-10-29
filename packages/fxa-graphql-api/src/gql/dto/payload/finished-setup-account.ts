/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FinishedSetupAccountPassword {
  @Field()
  public wrapKb!: string;

  @Field()
  public authPWVersion2!: string;

  @Field()
  public wrapKbVersion2!: string;

  @Field()
  public clientSalt!: string;
}

@ObjectType()
export class FinishedSetupAccountPayload {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field((type) => String)
  public uid!: hexstring;

  @Field((type) => String)
  public sessionToken!: hexstring;

  @Field()
  verified!: boolean;
}
