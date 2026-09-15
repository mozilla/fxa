/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminPanelFeature } from '@fxa/shared/guards';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { FeatureFlag } from '@fxa/shared/db/mysql/legacy/models/auth';
import { AuthHeaderGuard } from '../../auth/auth-header.guard';
import { AuditLog } from '../../auth/audit-log.decorator';
import { Features } from '../../auth/user-group-header.decorator';
import { CurrentUser } from '../../auth/auth-header.decorator';
import type { FeatureFlagDto } from '../../types';

// Flag names are consumed as object keys by clients, so keep them to a
// predictable slug: lowercase alphanumerics separated by dashes or dots.
const FLAG_NAME_RE = /^[a-z0-9]+([.-][a-z0-9]+)*$/;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 255;

@UseGuards(AuthHeaderGuard)
@Controller('/api/feature-flags')
export class FeatureFlagsController {
  constructor(private log: MozLoggerService) {}

  @Get()
  @Features(AdminPanelFeature.ManageFeatureFlags)
  public async list(): Promise<FeatureFlagDto[]> {
    return FeatureFlag.findAll();
  }

  @Put()
  @Features(AdminPanelFeature.ManageFeatureFlags)
  @AuditLog()
  public async upsert(
    @Body('name') name: string,
    @Body('enabled') enabled: boolean,
    @Body('description') description: string,
    @CurrentUser() user: string
  ): Promise<{ ok: boolean }> {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestException('name must be a non-empty string');
    }

    const trimmedName = name.trim().toLowerCase();

    if (trimmedName.length > MAX_NAME_LENGTH) {
      throw new BadRequestException(
        `name exceeds maximum length of ${MAX_NAME_LENGTH} characters`
      );
    }

    if (!FLAG_NAME_RE.test(trimmedName)) {
      throw new BadRequestException(
        'name must be lowercase alphanumeric segments separated by "-" or "."'
      );
    }

    if (typeof enabled !== 'boolean') {
      throw new BadRequestException('enabled must be a boolean');
    }

    const trimmedDescription = (description ?? '').trim();

    if (typeof trimmedDescription !== 'string') {
      throw new BadRequestException('description must be a string');
    }

    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      throw new BadRequestException(
        `description exceeds maximum length of ${MAX_DESCRIPTION_LENGTH} characters`
      );
    }

    await FeatureFlag.upsert(
      {
        name: trimmedName,
        enabled,
        description: trimmedDescription,
      },
      user
    );

    this.log.info('featureFlags.upsert', {
      user,
      name: trimmedName,
      enabled,
    });

    return { ok: true };
  }

  @Delete()
  @Features(AdminPanelFeature.ManageFeatureFlags)
  @AuditLog()
  public async remove(
    @Body('name') name: string,
    @CurrentUser() user: string
  ): Promise<{ removed: boolean }> {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestException('name must be a non-empty string');
    }

    const trimmedName = name.trim().toLowerCase();
    const removed = await FeatureFlag.remove(trimmedName);

    this.log.info('featureFlags.remove', { user, name: trimmedName, removed });

    return { removed };
  }
}
