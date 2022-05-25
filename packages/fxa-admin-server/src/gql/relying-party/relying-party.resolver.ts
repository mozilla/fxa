/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { uuidTransformer } from '../../database/transformers';

import { Features } from '../../auth/user-group-header.decorator';
import { GqlAuthHeaderGuard } from '../../auth/auth-header.guard';
import { DatabaseService } from '../../database/database.service';
import { RelyingParty as RelyingPartyType } from '../../gql/model/relying-party.model';
import { AdminPanelFeature } from 'fxa-shared/guards';

@UseGuards(GqlAuthHeaderGuard)
@Resolver((of: any) => [RelyingPartyType])
export class RelyingPartyResolver {
  constructor(private log: MozLoggerService, private db: DatabaseService) {}

  @Features(AdminPanelFeature.RelyingParties)
  @Query((returns) => [RelyingPartyType])
  public async relyingParties() {
    const relyingParties: RelyingPartyType[] = await this.db.relyingParties();
    return relyingParties.map((relyingParty) => {
      relyingParty.id = uuidTransformer.from(relyingParty.id);
      return relyingParty;
    });
  }
}
