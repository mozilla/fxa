/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FinishSetupPasswordV2 {
  @Field()
  public wrapKb!: string;

  @Field()
  public authPWVersion2!: string;

  @Field()
  public wrapKbVersion2!: string;

  @Field()
  public clientSalt!: string;
}

@InputType()
export class FinishSetupInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field()
  public token!: string;

  @Field((type) => String)
  public authPW!: hexstring;

  @Field({ nullable: true })
  public passwordV2?: FinishSetupPasswordV2;
}
