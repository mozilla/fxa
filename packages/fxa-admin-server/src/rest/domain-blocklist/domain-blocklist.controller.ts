/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminPanelFeature } from '@fxa/shared/guards';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { DomainBlocklist } from 'fxa-shared/db/models/auth';
import { AuthHeaderGuard } from '../../auth/auth-header.guard';
import { AuditLog } from '../../auth/audit-log.decorator';
import { Features } from '../../auth/user-group-header.decorator';
import { CurrentUser } from '../../auth/auth-header.decorator';
import type { DomainBlocklistEntry } from '../../types';

// RFC 1035 hostname label pattern — used to validate each domain entry
const DOMAIN_RE =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

@UseGuards(AuthHeaderGuard)
@Controller('/api/domain-blocklist')
export class DomainBlocklistController {
  constructor(private log: MozLoggerService) {}

  @Get()
  @Features(AdminPanelFeature.DomainBlocklist)
  public async list(): Promise<DomainBlocklistEntry[]> {
    return DomainBlocklist.findAll();
  }

  @Post('add')
  @Features(AdminPanelFeature.DomainBlocklist)
  @AuditLog()
  public async add(
    @Body('domains') domains: string[],
    @CurrentUser() user: string
  ): Promise<{ ok: boolean }> {
    if (
      !Array.isArray(domains) ||
      !domains.every((d) => typeof d === 'string')
    ) {
      throw new BadRequestException(
        'domains must be a non-empty array of strings'
      );
    }

    if (domains.length > 1000) {
      throw new BadRequestException(
        'Too many domains in a single request (max 1000)'
      );
    }

    const trimmed = domains
      .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
      .filter((d) => d.length > 0);

    if (trimmed.length === 0) {
      throw new BadRequestException(
        'domains array contained no non-empty values after normalization'
      );
    }

    const tooLong = trimmed.filter((d) => d.length > 253);
    if (tooLong.length > 0) {
      throw new BadRequestException(
        `Domain(s) exceed maximum length of 253 characters: ${tooLong.join(', ')}`
      );
    }

    const labelTooLong = trimmed.filter((d) =>
      d.split('.').some((label) => label.length > 63)
    );
    if (labelTooLong.length > 0) {
      throw new BadRequestException(
        `Domain(s) have a label exceeding 63 characters: ${labelTooLong.join(', ')}`
      );
    }

    const invalid = trimmed.filter((d) => !DOMAIN_RE.test(d));
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid domain(s): ${invalid.join(', ')}`);
    }

    await DomainBlocklist.addMany(trimmed);
    this.log.info('domainBlocklist.add', { user, count: trimmed.length });
    return { ok: true };
  }

  @Delete()
  @Features(AdminPanelFeature.DomainBlocklist)
  @AuditLog()
  public async remove(
    @Body('domain') domain: string,
    @CurrentUser() user: string
  ): Promise<{ removed: boolean }> {
    if (typeof domain !== 'string' || domain.trim().length === 0) {
      throw new BadRequestException('domain must be a non-empty string');
    }
    const trimmedDomain = domain.trim().toLowerCase().replace(/^@/, '');
    const removed = await DomainBlocklist.removeByDomain(trimmedDomain);
    this.log.info('domainBlocklist.remove', {
      user,
      domain: trimmedDomain,
      removed,
    });
    return { removed };
  }

  @Delete('all')
  @Features(AdminPanelFeature.DomainBlocklist)
  @AuditLog()
  public async removeAll(
    @CurrentUser() user: string
  ): Promise<{ ok: boolean }> {
    await DomainBlocklist.deleteAll();
    this.log.info('domainBlocklist.removeAll', { user });
    return { ok: true };
  }
}
