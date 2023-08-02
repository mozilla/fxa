/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';
import { TaxAmount } from './tax-amount.model';

@ObjectType()
export class Invoice {
  @Field({ description: 'Total of invoice' })
  public totalAmount!: number;

  @Field((type) => [TaxAmount], {
    description: 'Tax amounts of the invoice',
  })
  public taxAmounts!: TaxAmount[];
}
