/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Args, Query, Resolver } from '@nestjs/graphql';
import { SubscriptionProductInfo } from './dto/payload';
import { SubscriptionService } from '../backend/subscription.service';

@Resolver()
export class SubscriptionResolver {
  constructor(private productService: SubscriptionService) {}

  @Query((returns) => SubscriptionProductInfo)
  public async productInfo(
    @Args('input', { type: () => String })
    input: string
  ) {
    return this.productService.getProductInfo(input);
  }
}
