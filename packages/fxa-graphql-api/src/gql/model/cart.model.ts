/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CartState } from '@fxa/shared/db/mysql/account';
import { TaxAddress } from './tax-address.model';
import { Invoice } from './invoice.model';

registerEnumType(CartState, {
  name: 'CartState',
});

@ObjectType({
  description:
    'The Cart associated with a customer Subscription Platform checkout',
})
export class Cart {
  @Field((type) => ID, { description: 'Cart unique identifier' })
  public id!: string;

  @Field((type) => ID, {
    nullable: true,
    description: 'Firefox Account User ID',
  })
  public uid?: string;

  @Field((type) => CartState, { description: 'State of the cart' })
  public state!: CartState;

  @Field({ nullable: true, description: 'Error reason ID' })
  public errorReasonId?: string;

  @Field({ description: 'Offering ID configured in the CMS' })
  public offeringConfigId!: string;

  @Field({ description: 'Interval' })
  public interval!: string;

  @Field({
    nullable: true,
    description: 'Experiment associated with the cart',
  })
  public experiment?: string;

  @Field((type) => TaxAddress, {
    nullable: true,
    description: 'Tax address',
  })
  public taxAddress?: TaxAddress;

  @Field((type) => Invoice, {
    nullable: true,
    description: 'The previous invoice',
  })
  public previousInvoice?: Invoice;

  @Field((type) => Invoice, {
    description: 'The next, also known as upcoming, invoice',
  })
  public nextInvoice!: Invoice;

  @Field({ description: 'Timestamp when the cart was created' })
  public createdAt!: number;

  @Field({ description: 'Timestamp the cart was last updated' })
  public updatedAt!: number;

  @Field({ nullable: true, description: 'Applied coupon code' })
  public couponCode?: string;

  @Field({
    nullable: true,
    description: 'Stripe customer ID of cart customer',
  })
  public stripeCustomerId?: string;

  @Field({ nullable: true, description: 'Email set by customer' })
  public email?: string;

  @Field({ description: 'Amount of plan at checkout' })
  public amount!: number;
}
