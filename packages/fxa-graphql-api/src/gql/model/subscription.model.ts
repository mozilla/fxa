/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';
import { Invoice } from './invoice.model';

@ObjectType({
  description: 'Subscription representation used within the Cart context',
})
export class Subscription {
  @Field()
  public pageConfigId!: string;

  @Field((type) => Invoice)
  public previousInvoice!: Invoice;

  @Field((type) => Invoice)
  public nextInvoice!: Invoice;
}
