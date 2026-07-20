/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import {
  MeteringConfigurationManager,
  type StrapiMeter,
} from '@fxa/shared/cms';

import { UsageGrantsManager } from './usage-grants.manager';
import type { UsageGrantRecord } from './usage-grants.repository';
import {
  type CreateUsageGrantRequest,
  type UsageGrant,
  type UsageGrantLifetime,
} from './usage-grants.schema';
import { computeWindow } from './utils/computeWindow';
import { isUsageGrantActive } from './utils/isUsageGrantActive';
import { requireMeterBySlug } from './utils/requireMeterBySlug';

export interface CreateUsageGrantParams {
  request: CreateUsageGrantRequest;
  grantedBy: string;
}

@Injectable()
export class UsageGrantsService {
  constructor(
    private readonly meteringConfigurationManager: MeteringConfigurationManager,
    private readonly usageGrantsManager: UsageGrantsManager
  ) {}

  async createGrant(
    params: CreateUsageGrantParams,
    now: Date = new Date()
  ): Promise<UsageGrant> {
    const { request, grantedBy } = params;
    const meter = await requireMeterBySlug(
      this.meteringConfigurationManager,
      request.slug
    );
    const expiresAt = this.resolveExpiry(request.lifetime, meter, now);

    const record = await this.usageGrantsManager.createGrant({
      userIdentifier: request.userIdentifier,
      slug: request.slug,
      amount: request.amount,
      grantedBy,
      reason: request.reason,
      expiresAt,
    });

    return this.toUsageGrant(record, now);
  }

  async listGrants(
    userIdentifier: string,
    slug?: string,
    now: Date = new Date()
  ): Promise<UsageGrant[]> {
    const records = await this.usageGrantsManager.listGrants(
      userIdentifier,
      slug
    );
    return records.map((record) => this.toUsageGrant(record, now));
  }

  async deleteGrant(id: string): Promise<void> {
    await this.usageGrantsManager.deleteGrant(id);
  }

  private resolveExpiry(
    lifetime: UsageGrantLifetime,
    meter: StrapiMeter,
    now: Date
  ): Date | null {
    switch (lifetime.type) {
      case 'unending':
        return null;
      case 'currentWindow':
        return computeWindow(meter.window, now).windowEnd;
      case 'expires':
        return new Date(lifetime.expiresAt);
    }
  }

  private toUsageGrant(record: UsageGrantRecord, now: Date): UsageGrant {
    return {
      id: record.id,
      userIdentifier: record.userIdentifier,
      slug: record.slug,
      amount: record.amount,
      grantedBy: record.grantedBy,
      reason: record.reason,
      createdAt: record.createdAt.toDate().toISOString(),
      expiresAt: record.expiresAt
        ? record.expiresAt.toDate().toISOString()
        : null,
      active: isUsageGrantActive(record.expiresAt, now),
    };
  }
}
