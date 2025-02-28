/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TaxAddress {
  @Field()
  public countryCode!: string;

  @Field()
  public postalCode!: string;
}

@ObjectType()
export class Cart {
  @Field()
  public id!: string;

  @Field({ nullable: true })
  public uid?: string;

  @Field()
  public state!: string;

  @Field({ nullable: true })
  public errorReasonId?: string;

  @Field()
  public offeringConfigId!: string;

  @Field()
  public interval!: string;

  @Field({ nullable: true })
  public experiment?: string;

  @Field((type) => TaxAddress, { nullable: true })
  public taxAddress?: TaxAddress;

  @Field({ nullable: true })
  public currency?: string;

  @Field()
  public createdAt!: number;

  @Field()
  public updatedAt!: number;

  @Field({ nullable: true })
  public couponCode?: string;

  @Field({ nullable: true })
  public stripeCustomerId?: string;

  @Field({ nullable: true })
  public stripeSubscriptionId?: string;

  @Field({ nullable: true })
  public email?: string;

  @Field()
  public amount!: number;

  @Field()
  public version!: number;

  @Field()
  public eligibilityStatus!: string;
}
