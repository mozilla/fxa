/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ProviderId {
  unmapped,
  GOOGLE,
  APPLE,
}

registerEnumType(ProviderId, {
  name: 'ProviderId',
});

@ObjectType()
export class LinkedAccount {
  @Field()
  public uid!: string;

  @Field()
  public authAt!: number;

  @Field((type) => ProviderId)
  public providerId!: string;

  @Field()
  public enabled!: boolean;
}
