/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Args, Query, Resolver } from '@nestjs/graphql';
import { ClientInfo } from './dto/payload';
import { ClientInfoService } from '../backend/clientInfo.service';

@Resolver()
export class ClientInfoResolver {
  constructor(private clientInfoService: ClientInfoService) {}

  @Query((returns) => ClientInfo)
  public async clientInfo(
    @Args('input', { type: () => String })
    input: string
  ): Promise<ClientInfo> {
    return this.clientInfoService.getClientInfo(input);
  }
}
