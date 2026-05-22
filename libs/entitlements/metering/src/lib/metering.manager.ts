/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { OpenMeterClient } from './openmeter.client';
import {
  OpenMeterIngestError,
  OpenMeterQueryError,
} from './metering.error';
import {
  IngestEventArgs,
  toMeteringCloudEvent,
} from './utils/toMeteringCloudEvent';

export interface QueryUsageArgs {
  userIdentifier: string;
  slug: string;
  from: Date;
  to: Date;
}

export interface QueryUsageResult {
  usage: number;
  from: Date;
  to: Date;
}

@Injectable()
export class MeteringManager {
  constructor(private readonly openMeterClient: OpenMeterClient) {}

  async ingest(args: IngestEventArgs): Promise<void> {
    try {
      await this.openMeterClient.events.ingest(toMeteringCloudEvent(args));
    } catch (err) {
      throw new OpenMeterIngestError(toError(err));
    }
  }

  async ingestBatch(args: IngestEventArgs[]): Promise<void> {
    if (args.length === 0) {
      return;
    }
    try {
      await this.openMeterClient.events.ingest(args.map(toMeteringCloudEvent));
    } catch (err) {
      throw new OpenMeterIngestError(toError(err));
    }
  }

  async queryUsage(args: QueryUsageArgs): Promise<QueryUsageResult> {
    try {
      const result = await this.openMeterClient.meters.query(args.slug, {
        from: args.from,
        to: args.to,
        subject: [args.userIdentifier],
      });

      const usage = (result.data ?? []).reduce(
        (acc, row) => acc + (row.value ?? 0),
        0
      );

      return {
        usage,
        from: args.from,
        to: args.to,
      };
    } catch (err) {
      throw new OpenMeterQueryError(toError(err));
    }
  }
}

function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(String(err));
}
