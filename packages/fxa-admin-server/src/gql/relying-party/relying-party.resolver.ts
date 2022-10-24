/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { uuidTransformer } from '../../database/transformers';

import { Features } from '../../auth/user-group-header.decorator';
import { GqlAuthHeaderGuard } from '../../auth/auth-header.guard';
import { DatabaseService } from '../../database/database.service';
import { RelyingParty } from '../../gql/model/relying-party.model';
import { AdminPanelFeature } from 'fxa-shared/guards';

const RELYING_PARTY_COLUMNS = [
  'id',
  'name',
  'imageUri',
  'redirectUri',
  'canGrant',
  'publicClient',
  'createdAt',
  'trusted',
  'allowedScopes',
  'notes',
];

@UseGuards(GqlAuthHeaderGuard)
@Resolver((of: any) => [RelyingParty])
export class RelyingPartyResolver {
  constructor(private log: MozLoggerService, private db: DatabaseService) {}

  @Features(AdminPanelFeature.RelyingParties)
  @Query((returns) => [RelyingParty])
  public async relyingParties() {
    const relyingParties = await this.db.relyingParty
      .query()
      .select(RELYING_PARTY_COLUMNS);

    return relyingParties.map((x) => {
      x.id = uuidTransformer.from(x.id);
      return x;
    });
  }

  @Features(AdminPanelFeature.RelyingPartiesEditNotes)
  @Mutation((returns) => Boolean)
  public async updateNotes(
    @Args('id') id: string,
    @Args('notes') notes: string
  ) {
    const updated = await this.db.relyingParty
      .query()
      .update({ notes })
      .where({ id: uuidTransformer.to(id) });

    return updated === 1;
  }
}
