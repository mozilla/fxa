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
import { EmailBlocklist } from 'fxa-shared/db/models/auth';
import { AuthHeaderGuard } from '../../auth/auth-header.guard';
import { AuditLog } from '../../auth/audit-log.decorator';
import { Features } from '../../auth/user-group-header.decorator';
import { CurrentUser } from '../../auth/auth-header.decorator';
import type { EmailBlocklistEntry } from '../../types';

@UseGuards(AuthHeaderGuard)
@Controller('/api/email-blocklist')
export class EmailBlocklistController {
  constructor(private log: MozLoggerService) {}

  @Get()
  @Features(AdminPanelFeature.EmailBlocklist)
  public async list(): Promise<EmailBlocklistEntry[]> {
    return EmailBlocklist.findAll();
  }

  @Post('add')
  @Features(AdminPanelFeature.EmailBlocklist)
  @AuditLog()
  public async add(
    @Body('regexes') regexes: string[],
    @CurrentUser() user: string
  ): Promise<{ ok: boolean }> {
    if (
      !Array.isArray(regexes) ||
      !regexes.every((r) => typeof r === 'string')
    ) {
      throw new BadRequestException(
        'regexes must be a non-empty array of strings'
      );
    }

    const trimmed = regexes.map((r) => r.trim()).filter((r) => r.length > 0);
    if (trimmed.length === 0) {
      throw new BadRequestException(
        'regexes must be a non-empty array of strings'
      );
    }
    const tooLong = trimmed.filter((r) => r.length > 768);
    if (tooLong.length > 0) {
      throw new BadRequestException(
        `Regex(es) exceed maximum length of 768 characters: ${tooLong.join(', ')}`
      );
    }
    const invalid = trimmed.filter((r) => {
      try {
        // CodeQL: patterns are admin-supplied and validated here before use
        new RegExp(r); // lgtm[js/regexp-injection]
        return false;
      } catch {
        return true;
      }
    });
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid regex(es): ${invalid.join(', ')}`);
    }

    await EmailBlocklist.addMany(trimmed);
    this.log.info('emailBlocklist.add', { user, count: trimmed.length });
    return { ok: true };
  }

  @Delete()
  @Features(AdminPanelFeature.EmailBlocklist)
  @AuditLog()
  public async remove(
    @Body('regex') regex: string,
    @CurrentUser() user: string
  ): Promise<{ removed: boolean }> {
    if (typeof regex !== 'string' || regex.trim().length === 0) {
      throw new BadRequestException('regex must be a non-empty string');
    }
    const trimmedRegex = regex.trim();
    const removed = await EmailBlocklist.removeByRegex(trimmedRegex);
    this.log.info('emailBlocklist.remove', {
      user,
      regex: trimmedRegex,
      removed,
    });
    return { removed };
  }

  @Delete('all')
  @Features(AdminPanelFeature.EmailBlocklist)
  @AuditLog()
  public async removeAll(
    @CurrentUser() user: string
  ): Promise<{ ok: boolean }> {
    await EmailBlocklist.deleteAll();
    this.log.info('emailBlocklist.removeAll', { user });
    return { ok: true };
  }
}
