/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { uuidTransformer } from '../../database/transformers';

import { AdminPanelFeature } from '@fxa/shared/guards';
import { AuthHeaderGuard } from '../../auth/auth-header.guard';
import { AuditLog } from '../../auth/audit-log.decorator';
import { Features } from '../../auth/user-group-header.decorator';
import { DatabaseService } from '../../database/database.service';
import {
  RelyingPartyCreatedDto,
  RelyingPartyDto,
  RelyingPartyUpdateDto,
  RotateSecretDto,
} from '../../types';
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

@UseGuards(AuthHeaderGuard)
@Controller('/api/relying-parties')
export class RelyingPartyController {
  constructor(private db: DatabaseService) {}

  @Features(AdminPanelFeature.RelyingParties)
  @Get()
  public async relyingParties(): Promise<RelyingPartyDto[]> {
    const relyingParties = await this.db.relyingParty
      .query()
      .select(RELYING_PARTY_COLUMNS);

    return relyingParties.map<RelyingPartyDto>((x) => ({
      id: uuidTransformer.from(x.id),
      createdAt: x.createdAt.getTime(),
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
    }));
  }

  @Features(AdminPanelFeature.CreateRelyingParty)
  @AuditLog()
  @Post()
  public async createRelyingParty(
    @Body() relyingParty: RelyingPartyUpdateDto
  ): Promise<RelyingPartyCreatedDto> {
    const id = crypto.randomBytes(8).toString('hex');
    const createdAt = new Date();

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
  @Put(':id')
  public async updateRelyingParty(
    @Param('id') id: string,
    @Body() relyingParty: RelyingPartyUpdateDto
  ): Promise<boolean> {
    const result = await this.db.relyingParty
      .query()
      .update({ ...relyingParty })
      .where({ id: uuidTransformer.to(id) });

    return result === 1;
  }

  @Features(AdminPanelFeature.DeleteRelyingParty)
  @AuditLog()
  @Delete(':id')
  public async deleteRelyingParty(@Param('id') id: string): Promise<boolean> {
    const result = await this.db.relyingParty
      .query()
      .deleteById(uuidTransformer.to(id));
    return result === 1;
  }

  @Features(AdminPanelFeature.UpdateRelyingParty)
  @AuditLog()
  @Post(':id/rotate-secret')
  public async rotateRelyingPartySecret(
    @Param('id') id: string
  ): Promise<RotateSecretDto> {
    const rp = await this.db.relyingParty
      .query()
      .where({ id: uuidTransformer.to(id) })
      .first();

    if (!rp) {
      throw new Error('Unknown RP');
    }

    const secret = crypto.randomBytes(32);
    const hashedSecret = crypto
      .createHash('sha256')
      .update(secret)
      .digest('hex');
    await this.db.relyingParty
      .query()
      .update({
        hashedSecret: uuidTransformer.to(hashedSecret),
        hashedSecretPrevious: rp.hashedSecret || null,
      })
      .where({ id: uuidTransformer.to(id) });

    return { secret: secret.toString('hex') };
  }

  @Features(AdminPanelFeature.UpdateRelyingParty)
  @AuditLog()
  @Delete(':id/previous-secret')
  public async deletePreviousRelyingPartySecret(
    @Param('id') id: string
  ): Promise<boolean> {
    const result = await this.db.relyingParty
      .query()
      .update({ hashedSecretPrevious: null })
      .where({ id: uuidTransformer.to(id) });
    return result === 1;
  }
}
