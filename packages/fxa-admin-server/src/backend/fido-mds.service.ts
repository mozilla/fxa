/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { AppConfig } from '../config';

/**
 * Fetches authenticator names from the FIDO Metadata Service (MDS3).
 *
 * The MDS response is a JWT whose payload contains a list of authenticator
 * entries, each with an `aaguid` and a human-readable `description`. We parse
 * the payload directly without verifying the JWT signature because this data
 * is display-only and carries no security weight.
 *
 * The name map is cached in memory and refreshed every TTL_MS. Network
 * failures are non-fatal: callers receive `undefined` and the next request
 * triggers a retry.
 */
@Injectable()
export class FidoMdsService {
  private names: Map<string, string> = new Map();
  private refreshedAt = 0;
  private pending: Promise<void> | null = null;

  private readonly url: string;
  private readonly ttlMs: number;
  private readonly fetchTimeoutMs: number;

  constructor(
    private log: MozLoggerService,
    configService: ConfigService<AppConfig>
  ) {
    const fidoMds = configService.get('fidoMds') as AppConfig['fidoMds'];
    this.url = fidoMds.url;
    this.ttlMs = fidoMds.cacheTtlSeconds * 1000;
    this.fetchTimeoutMs = fidoMds.fetchTimeoutSeconds * 1000;
  }

  /**
   * Returns the human-readable authenticator name for the given AAGUID UUID
   * string (e.g. `"fa2b99dc-9e39-4257-8f92-4a30d23c4118"`), or `undefined`
   * if the AAGUID is unknown or the MDS is unreachable.
   */
  async getAuthenticatorName(aaguid: string): Promise<string | undefined> {
    await this.refresh();
    return this.names.get(aaguid.toLowerCase());
  }

  private async refresh(): Promise<void> {
    const isStale = Date.now() - this.refreshedAt > this.ttlMs;
    if (!this.pending && isStale) {
      this.pending = this.doRefresh();
    }
    return this.pending ?? Promise.resolve();
  }

  private async doRefresh(): Promise<void> {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), this.fetchTimeoutMs);
    try {
      const res = await fetch(this.url, { signal: abort.signal });
      if (!res.ok) {
        throw new Error(`MDS fetch failed: ${res.status}`);
      }
      const jwt = await res.text();

      const payloadB64 = jwt.split('.')[1];
      if (!payloadB64) {
        throw new Error('Unexpected MDS response format');
      }
      const { entries = [] } = JSON.parse(
        Buffer.from(payloadB64, 'base64url').toString('utf8')
      );

      const newNames = new Map<string, string>();
      for (const entry of entries) {
        const aaguid: string | undefined = entry.aaguid;
        const description: string | undefined =
          entry.metadataStatement?.description;
        if (aaguid && description) {
          newNames.set(aaguid.toLowerCase(), description);
        }
      }
      this.names = newNames;
      this.refreshedAt = Date.now();
      this.log.info('FidoMdsService: cache refreshed', {
        entries: newNames.size,
      });
    } catch (err) {
      // Allow a retry on the next call, but keep the stale cache so
      // existing entries remain usable.
      this.log.warn('FidoMdsService: fetch/parse failed', { err });
    } finally {
      clearTimeout(timer);
      this.pending = null;
    }
  }
}
