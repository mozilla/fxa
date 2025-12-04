/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { uuidTransformer } from '../../database/transformers';

import { AdminPanelFeature } from '@fxa/shared/guards';
import { GqlAuthHeaderGuard } from '../../auth/auth-header.guard';
import { AuditLog } from '../../auth/audit-log.decorator';
import { Features } from '../../auth/user-group-header.decorator';
import { DatabaseService } from '../../database/database.service';
import {
  RelyingPartyDto,
  RelyingPartyUpdateDto,
} from '../../gql/model/relying-party.model';
import crypto from 'node:crypto';

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
@Resolver((of: any) => [RelyingPartyDto])
export class RelyingPartyResolver {
  constructor(private db: DatabaseService) {}

  @Features(AdminPanelFeature.RelyingParties)
  @Query(() => [RelyingPartyDto])
  public async relyingParties() {
    const relyingParties = await this.db.relyingParty
      .query()
      .select(RELYING_PARTY_COLUMNS);

    return relyingParties.map((x) => {
      x.id = uuidTransformer.from(x.id);
      return x;
    });
  }

  @Features(AdminPanelFeature.CreateRelyingParty)
  @AuditLog()
  @Mutation(() => String)
  public async createRelyingParty(
    @Args('relyingParty') relyingParty: RelyingPartyUpdateDto
  ) {
    const id = crypto.randomBytes(8).toString('hex');
    const createdAt = new Date();
    const result = await this.db.relyingParty.query().insert({
      id,
      createdAt,
      ...relyingParty,
    });

    return result.id;
  }

  @Features(AdminPanelFeature.UpdateRelyingParty)
  @AuditLog()
  @Mutation(() => Boolean)
  public async updateRelyingParty(
    @Args('id') id: string,
    @Args('relyingParty') relyingParty: RelyingPartyUpdateDto
  ) {
    const result = await this.db.relyingParty
      .query()
      .update({
        ...relyingParty,
      })
      .where({
        id: uuidTransformer.to(id),
      });

    return result === 1;
  }

  @Features(AdminPanelFeature.DeleteRelyingParty)
  @AuditLog()
  @Mutation(() => Boolean)
  public async deleteRelyingParty(@Args('id') id: string) {
    const result = await this.db.relyingParty
      .query()
      .deleteById(uuidTransformer.to(id));
    return result === 1;
  }
}
