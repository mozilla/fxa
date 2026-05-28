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
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AdminPanelFeature } from '@fxa/shared/guards';
import { AuthHeaderGuard } from '../../auth/auth-header.guard';
import { AuditLog } from '../../auth/audit-log.decorator';
import { Features } from '../../auth/user-group-header.decorator';
import { DatabaseService } from '../../database/database.service';
import { OAuthScopeCreateDto, OAuthScopeDto } from '../../types';

const SCOPE_MAX_LENGTH = 128;

// `hasScopedKeys` comes back from MySQL as a tinyint(1) (0/1); coerce to a
// real boolean so the wire shape always matches OAuthScopeDto.
export const toOAuthScopeDto = (row: {
  id: number;
  scope: string;
  hasScopedKeys: boolean | number;
}): OAuthScopeDto => ({
  id: row.id,
  scope: row.scope,
  hasScopedKeys: !!row.hasScopedKeys,
});

@UseGuards(AuthHeaderGuard)
@Controller('/api/oauth-scopes')
export class OAuthScopesController {
  constructor(private db: DatabaseService) {}

  @Features(AdminPanelFeature.OAuthScopes)
  @Get()
  public async listOAuthScopes(): Promise<OAuthScopeDto[]> {
    const rows = await this.db.scope
      .query()
      .select('id', 'scope', 'hasScopedKeys')
      .orderBy('scope', 'asc');
    return rows.map(toOAuthScopeDto);
  }

  @Features(AdminPanelFeature.CreateOAuthScope)
  @AuditLog()
  @Post()
  public async createOAuthScope(
    @Body() body: OAuthScopeCreateDto
  ): Promise<OAuthScopeDto> {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new BadRequestException('request body must be an object');
    }
    if (typeof body.scope !== 'string') {
      throw new BadRequestException('scope must be a string');
    }
    if (typeof body.hasScopedKeys !== 'boolean') {
      throw new BadRequestException('hasScopedKeys must be a boolean');
    }
    if (body.scope.length > SCOPE_MAX_LENGTH) {
      throw new BadRequestException(
        `scope must be ${SCOPE_MAX_LENGTH} characters or fewer`
      );
    }

    const { scope, hasScopedKeys } = body;

    try {
      const inserted = await this.db.scope
        .query()
        .insertAndFetch({ scope, hasScopedKeys });
      return toOAuthScopeDto(inserted);
    } catch (err: any) {
      if (err?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`Scope "${scope}" already exists`);
      }
      throw err;
    }
  }

  @Features(AdminPanelFeature.DeleteOAuthScope)
  @AuditLog()
  @Delete(':id')
  public async deleteOAuthScope(
    @Param('id', ParseIntPipe) id: number
  ): Promise<boolean> {
    const count = await this.db.scope.query().deleteById(id);
    if (count === 0) {
      throw new NotFoundException(`Scope with id ${id} not found`);
    }
    return true;
  }
}
