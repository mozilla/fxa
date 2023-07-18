/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { readFileSync } from 'fs';
import { Request, Response, NextFunction } from 'express';

/**
 * Configuration options for GqlGuard
 */
export type Config = {
  /** A list of json files holding queries extracted with the persistgraphql util. */
  allowlist: string[];
  /** Toggles gaurd on / off. */
  enabled: boolean;
};

/**
 * Guards against the execution of unsanctioned gql queries. A list of allowed queries can be populated by running.
 * `yarn gql:allowlist`.
 *
 * During development it is probably desirable to disable this!
 */
export class GqlAllowlist {
  public readonly valid: Array<Record<string, number>>;
  public readonly enabled: boolean;

  constructor(config: Config) {
    this.enabled = config.enabled;
    if (this.enabled) {
      this.valid = config.allowlist.map((x) => {
        const raw = readFileSync(x).toString();
        try {
          return JSON.parse(raw);
        } catch (err) {
          console.warn('Failed to parse gql allowlist', raw);
          throw err;
        }
      });
    } else {
      this.valid = [];
    }
  }

  allowed(req: Pick<Request, 'body' | 'query'>) {
    if (!this.enabled) {
      return true;
    }

    const query = req.query?.query || req.body?.query;

    // If there was no query defined, assume it is not a gql request.
    // This allows the gql playground to work.
    if (!query) {
      return true;
    }

    return this.valid.some((x) => x[query] !== undefined);
  }
}

/**
 * Express middleware for sanctioning GqlQueries. See:
 *   https://www.apollographql.com/blog/graphql/security/securing-your-graphql-api-from-malicious-queries/#query-whitelisting
 * @param config
 * @returns
 */
export function allowlistGqlQueries(config: Config) {
  const guard = new GqlAllowlist(config);
  return (req: Request, res: Response, next: NextFunction) => {
    if (guard.allowed(req)) {
      next();
    } else {
      res
        .status(403)
        .send({ statusCode: 403, message: 'Unsanctioned Graphql Query' });
    }
  };
}
