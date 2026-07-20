/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @openmeter/client ships its type definitions only through the newer package
// "exports" field. The TypeScript setup in this repo does not read that field,
// so it cannot find the types on its own and the build fails to resolve the
// import. Rather than change repo-wide config, we declare here just the small
// part of the client we actually use so the build can type-check it.
declare module '@openmeter/client' {
  export interface EventInput {
    id: string;
    source: string;
    type: string;
    subject: string;
    time?: string | null;
    data?: Record<string, unknown> | null;
  }

  export interface QueryFilterStringMapItem {
    eq?: string;
    in?: string[];
  }

  export interface MeterQueryRequestInput {
    from?: string;
    to?: string;
    filters?: { dimensions?: Record<string, QueryFilterStringMapItem> };
  }

  export interface MeterQueryRow {
    value: string;
    from: string;
    to: string;
    dimensions: Record<string, string>;
  }

  export interface MeterQueryResult {
    from?: string;
    to?: string;
    data: MeterQueryRow[];
  }

  export interface Meter {
    id: string;
    key: string;
  }

  export interface MeterPagePaginatedResponse {
    data: Meter[];
  }

  export class OpenMeter {
    constructor(options: { baseUrl: string; apiKey?: string });
    events: {
      ingest(events: EventInput | EventInput[]): Promise<void>;
    };
    meters: {
      list(request?: {
        filter?: { key?: string };
      }): Promise<MeterPagePaginatedResponse>;
      query(request: {
        meterId: string;
        body: MeterQueryRequestInput;
      }): Promise<MeterQueryResult>;
    };
  }
}
