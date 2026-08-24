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
import type {
  DomainBlocklistEntry,
  DomainBlocklistSyncResult,
} from '../../types';

// RFC 1035 hostname label pattern — used to validate each domain entry
const DOMAIN_RE =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

const SYNC_BATCH_SIZE = 500;
/** Pause between batches so a large import does not saturate the database. */
const SYNC_BATCH_DELAY_MS = 50;
const SYNC_FETCH_TIMEOUT_MS = 60_000;
/** The ~40k entry reference list is under 1MB. 10MB leaves room for a bigger list. */
const SYNC_MAX_BYTES = 10 * 1024 * 1024;

function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^@/, '');
}

function isValidDomain(domain: string): boolean {
  return (
    domain.length <= 253 &&
    domain.split('.').every((label) => label.length <= 63) &&
    DOMAIN_RE.test(domain)
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    const trimmed = domains.map(normalizeDomain).filter((d) => d.length > 0);

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

  /**
   * Imports a newline-delimited domain list from a public URL. The server
   * fetches the list so the panel does not need a cross-origin request.
   */
  @Post('sync')
  @Features(AdminPanelFeature.DomainBlocklist)
  @AuditLog()
  public async sync(
    @Body('url') url: string,
    @CurrentUser() user: string
  ): Promise<DomainBlocklistSyncResult> {
    const source = this.parseSyncUrl(url);
    const body = await this.fetchList(source);
    const { total, domains } = this.parseList(body);

    for (let i = 0; i < domains.length; i += SYNC_BATCH_SIZE) {
      await DomainBlocklist.addMany(domains.slice(i, i + SYNC_BATCH_SIZE));
      if (i + SYNC_BATCH_SIZE < domains.length) {
        await delay(SYNC_BATCH_DELAY_MS);
      }
    }

    this.log.info('domainBlocklist.sync', {
      user,
      url: `${source.origin}${source.pathname}`,
      total,
      submitted: domains.length,
    });
    return { ok: true, total, submitted: domains.length };
  }

  /** Accepts https URLs only, so the fetch cannot reach a plaintext target. */
  private parseSyncUrl(url: string): URL {
    if (typeof url !== 'string') {
      throw new BadRequestException('url must be a string');
    }
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BadRequestException('url must be a valid URL');
    }
    if (parsed.protocol !== 'https:') {
      throw new BadRequestException('url must use https');
    }
    return parsed;
  }

  private async fetchList(source: URL): Promise<string> {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), SYNC_FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(source.toString(), { signal: abort.signal });
      if (!res.ok) {
        throw new BadRequestException(
          `Could not fetch the list: ${res.status} ${res.statusText}`
        );
      }
      // fetch follows redirects, so a https URL can still land on a plaintext one.
      // This checks the final hop only; fetch has already made every request.
      if (res.url && new URL(res.url).protocol !== 'https:') {
        throw new BadRequestException('url redirected away from https');
      }
      return await this.readCappedBody(res);
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.log.error('domainBlocklist.sync.fetchFailed', {
        url: `${source.origin}${source.pathname}`,
        err,
      });
      throw new BadRequestException(
        `Could not fetch the list: ${err instanceof Error ? err.message : 'unknown error'}`
      );
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Reads the body a chunk at a time and stops at SYNC_MAX_BYTES. `content-length`
   * is not enough on its own: a chunked response does not send one.
   */
  private async readCappedBody(res: Response): Promise<string> {
    const reader = res.body?.getReader();
    if (!reader) {
      return '';
    }

    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      size += value.length;
      if (size > SYNC_MAX_BYTES) {
        await reader.cancel();
        throw new BadRequestException(
          `List is larger than the ${SYNC_MAX_BYTES} byte limit`
        );
      }
      chunks.push(value);
    }

    return Buffer.concat(chunks).toString('utf8');
  }

  /**
   * Splits the list into unique valid domains. Invalid entries are dropped
   * rather than rejected, because a public list of ~40k entries usually has
   * some junk in it and one bad line must not fail the whole import.
   */
  private parseList(body: string): { total: number; domains: string[] } {
    const domains = new Set<string>();
    let total = 0;

    for (const line of body.split(/\r?\n/)) {
      const entry = normalizeDomain(line.split('#')[0]);
      if (entry.length === 0) {
        continue;
      }
      total++;
      if (isValidDomain(entry)) {
        domains.add(entry);
      }
    }

    return { total, domains: [...domains] };
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
    const trimmedDomain = normalizeDomain(domain);
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
