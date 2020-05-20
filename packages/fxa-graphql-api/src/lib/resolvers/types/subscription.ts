/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Subscription {
  @Field()
  public created!: number;

  @Field()
  public currentPeriodEnd!: number;

  @Field()
  public currentPeriodStart!: number;

  @Field()
  public cancelAtPeriodEnd!: boolean;

  @Field()
  public endAt!: number;

  @Field()
  public latestInvoice!: string;

  @Field()
  public planId!: string;

  @Field()
  public productName!: string;

  @Field()
  public productId!: string;

  @Field()
  public status!: string;

  @Field()
  public subscriptionId!: string;
}
