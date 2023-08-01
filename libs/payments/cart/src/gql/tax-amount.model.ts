/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'Tax amounts used within the Cart',
})
export class TaxAmount {
  @Field()
  public title!: string;

  @Field()
  public amount!: number;
}
