/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'The Tax Address associated with the Cart',
})
export class TaxAddress {
  @Field({
    nullable: true,
    description: 'Country code for tax',
  })
  public countryCode!: string;

  @Field({ description: 'Postal code for tax' })
  public postalCode!: string;
}
