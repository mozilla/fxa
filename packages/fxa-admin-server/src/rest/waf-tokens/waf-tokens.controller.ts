/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import crypto from 'node:crypto';

import { AdminPanelFeature } from '@fxa/shared/guards';
import { AuthHeaderGuard } from '../../auth/auth-header.guard';
import { AuditLog } from '../../auth/audit-log.decorator';
import { Features } from '../../auth/user-group-header.decorator';
import { DatabaseService } from '../../database/database.service';
import { uuidTransformer } from '../../database/transformers';
import { WafBypassTokenDto, WafBypassTokenCreateDto } from '../../types';

const CLIENT_ID_RE = /^[0-9a-f]{16}$/i;

@UseGuards(AuthHeaderGuard)
@Controller('/api/waf-tokens')
export class WafTokensController {
  constructor(private db: DatabaseService) {}

  @Features(AdminPanelFeature.ManageWafTokens)
  @AuditLog()
  @Get()
  public async listWafTokens(): Promise<WafBypassTokenDto[]> {
    const rows = await this.db.wafBypassTokens
      .query()
      .select('id', 'name', 'token', 'clientId', 'createdAt');
    return rows.map<WafBypassTokenDto>((r) => ({
      id: r.id,
      name: r.name,
      token: r.token,
      clientId: r.clientId ? uuidTransformer.from(r.clientId) : null,
      createdAt: Number(r.createdAt),
    }));
  }

  @Features(AdminPanelFeature.ManageWafTokens)
  @AuditLog()
  @Post()
  public async createWafToken(
    @Body() body: WafBypassTokenCreateDto
  ): Promise<WafBypassTokenDto> {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) throw new BadRequestException('name is required');
    if (name.length > 255)
      throw new BadRequestException('name must be 255 characters or fewer');

    const clientId =
      typeof body.clientId === 'string'
        ? body.clientId.trim() || undefined
        : undefined;
    if (clientId !== undefined && !CLIENT_ID_RE.test(clientId))
      throw new BadRequestException(
        'clientId must be a 16-character hex string'
      );

    const row = {
      id: crypto.randomUUID(),
      name,
      token: crypto.randomUUID(),
      clientId: clientId ? uuidTransformer.to(clientId) : null,
      createdAt: Date.now(),
    };

    try {
      await this.db.wafBypassTokens.query().insert(row);
    } catch (err: any) {
      if (err?.code === 'ER_DUP_ENTRY') {
        const errorMessage = err?.message ?? '';
        throw new ConflictException(
          errorMessage.includes('unique_clientId')
            ? 'A token already exists for this clientId'
            : 'Token generation conflict; please try again'
        );
      }
      throw err;
    }

    return { ...row, clientId: clientId ?? null };
  }

  @Features(AdminPanelFeature.ManageWafTokens)
  @AuditLog()
  @Post(':id/rotate')
  public async rotateWafToken(
    @Param('id') id: string
  ): Promise<WafBypassTokenDto> {
    const existing = await this.db.wafBypassTokens
      .query()
      .where({ id })
      .first();
    if (!existing) throw new NotFoundException('WAF token not found');

    const newToken = crypto.randomUUID();
    const patched = await this.db.wafBypassTokens
      .query()
      .patch({ token: newToken })
      .where({ id });
    if (patched === 0) throw new NotFoundException('WAF token not found');

    return {
      id: existing.id,
      name: existing.name,
      token: newToken,
      clientId: existing.clientId
        ? uuidTransformer.from(existing.clientId)
        : null,
      createdAt: Number(existing.createdAt),
    };
  }

  @Features(AdminPanelFeature.ManageWafTokens)
  @AuditLog()
  @Delete(':id')
  public async deleteWafToken(@Param('id') id: string): Promise<boolean> {
    const count = await this.db.wafBypassTokens.query().deleteById(id);
    if (count === 0) throw new NotFoundException('WAF token not found');
    return true;
  }
}
