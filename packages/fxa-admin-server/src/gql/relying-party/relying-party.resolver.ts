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
  RelyingPartyCreatedDto,
  RelyingPartyDto,
  RelyingPartyUpdateDto,
  RotateSecretDto,
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
  'hashedSecret',
  'hashedSecretPrevious',
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

    const result = relyingParties.map<RelyingPartyDto>((x) => {
      return {
        id: uuidTransformer.from(x.id),
        createdAt: x.createdAt,
        name: x.name,
        imageUri: x.imageUri,
        redirectUri: x.redirectUri,
        canGrant: x.canGrant,
        publicClient: x.publicClient,
        trusted: x.trusted,
        allowedScopes: x.allowedScopes || '',
        notes: x.notes || '',
        hasSecret: !!x.hashedSecret,
        hasPreviousSecret: !!x.hashedSecretPrevious,
      };
    });

    return result;
  }

  @Features(AdminPanelFeature.CreateRelyingParty)
  @AuditLog()
  @Mutation(() => RelyingPartyCreatedDto)
  public async createRelyingParty(
    @Args('relyingParty') relyingParty: RelyingPartyUpdateDto
  ) {
    const id = crypto.randomBytes(8).toString('hex');
    const createdAt = new Date();

    // Compute secret and hashed value for RP
    const secret = crypto.randomBytes(32);
    const hashedSecret = crypto
      .createHash('sha256')
      .update(secret)
      .digest('hex');

    const result = await this.db.relyingParty.query().insert({
      id,
      createdAt,
      hashedSecret: uuidTransformer.to(hashedSecret),
      ...relyingParty,
    });

    return {
      id: result.id,
      secret: secret.toString('hex'),
    };
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

  @Features(AdminPanelFeature.UpdateRelyingParty)
  @AuditLog()
  @Mutation(() => RotateSecretDto)
  public async rotateRelyingPartySecret(@Args('id') id: string) {
    const rp = await this.db.relyingParty
      .query()
      .where({
        id: uuidTransformer.to(id),
      })
      .first();

    // This shouldn't ever happen given how the UI interacts with this endpoint.
    if (!rp) {
      throw new Error('Unknown RP');
    }

    // Generate a new secret and hash it, and store in DB
    const secret = crypto.randomBytes(32);
    const hashedSecret = crypto
      .createHash('sha256')
      .update(secret)
      .digest('hex');
    const result = await this.db.relyingParty
      .query()
      .update({
        hashedSecret: uuidTransformer.to(hashedSecret),
        hashedSecretPrevious: rp.hashedSecret || null,
      })
      .where({
        id: uuidTransformer.to(id),
      });

    // Relay value back to client
    return { secret: secret.toString('hex') };
  }

  @Features(AdminPanelFeature.UpdateRelyingParty)
  @AuditLog()
  @Mutation(() => Boolean)
  public async deletePreviousRelyingPartySecret(@Args('id') id: string) {
    const result = await this.db.relyingParty
      .query()
      .update({
        hashedSecretPrevious: null,
      })
      .where({
        id: uuidTransformer.to(id),
      });
    return result === 1;
  }
}
