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
import { FeatureFlag } from 'fxa-shared/db/models/auth';
import { AuthHeaderGuard } from '../../auth/auth-header.guard';
import { AuditLog } from '../../auth/audit-log.decorator';
import { Features } from '../../auth/user-group-header.decorator';
import { CurrentUser } from '../../auth/auth-header.decorator';
import type { FeatureFlagDto } from '../../types';

// Flag names are consumed as plain strings by clients, so keep them to a
// predictable slug: lowercase alphanumerics separated by dashes or dots.
const FLAG_NAME_RE = /^[a-z0-9]+([.-][a-z0-9]+)*$/;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 255;

// A client that cannot reach the flag endpoint sees every flag as off, so off
// has to mean the safe, existing behaviour. A negated name inverts that: an
// outage would re-enable whatever the flag was meant to shut down.
const NEGATIVE_NAME_RE =
  /(^|[.-])(no|not|disable|disabled|off|skip|hide|without)([.-]|$)/;

// Lets the audit stream be filtered by what happened, rather than by comparing
// each entry against the one before it.
function changeAction(
  wasEnabled: boolean | undefined,
  isEnabled: boolean
): 'created' | 'enabled' | 'disabled' | 'updated' {
  if (wasEnabled === undefined) return 'created';
  if (wasEnabled === isEnabled) return 'updated';
  return isEnabled ? 'enabled' : 'disabled';
}

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

    if (NEGATIVE_NAME_RE.test(trimmedName)) {
      throw new BadRequestException(
        `"${trimmedName}" is phrased as a negative. Name the flag for the behaviour it turns on, so that off always means the existing behaviour.`
      );
    }

    if (typeof enabled !== 'boolean') {
      throw new BadRequestException('enabled must be a boolean');
    }

    const trimmedDescription = (description ?? '').trim();

    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      throw new BadRequestException(
        `description exceeds maximum length of ${MAX_DESCRIPTION_LENGTH} characters`
      );
    }

    const previous = await FeatureFlag.findByName(trimmedName);

    await FeatureFlag.upsert(
      { name: trimmedName, enabled, description: trimmedDescription },
      user
    );

    this.log.info('featureFlags.change', {
      user,
      name: trimmedName,
      action: changeAction(previous?.enabled, enabled),
      from: previous && {
        enabled: previous.enabled,
        description: previous.description,
      },
      to: { enabled, description: trimmedDescription },
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
    const previous = await FeatureFlag.findByName(trimmedName);
    const removed = await FeatureFlag.remove(trimmedName);

    this.log.info('featureFlags.change', {
      user,
      name: trimmedName,
      action: 'deleted',
      from: previous && {
        enabled: previous.enabled,
        description: previous.description,
      },
      to: null,
      removed,
    });

    return { removed };
  }
}
