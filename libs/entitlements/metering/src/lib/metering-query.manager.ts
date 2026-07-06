/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { OpenMeterClient } from './openmeter.client';
import { OpenMeterQueryError } from './metering.error';

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
export class MeteringQueryManager {
  constructor(private readonly openMeterClient: OpenMeterClient) {}

  async queryUsage(args: QueryUsageArgs): Promise<QueryUsageResult> {
    try {
      const usage = await this.openMeterClient.queryUsage({
        slug: args.slug,
        subject: [args.userIdentifier],
        from: args.from,
        to: args.to,
      });

      return { usage, from: args.from, to: args.to };
    } catch (err) {
      throw new OpenMeterQueryError(toError(err));
    }
  }
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}
