/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError } from '@fxa/accounts/errors';
import { EmailNormalization } from './email-normalization';

export type BouncesConfig = {
  enabled: boolean;
  aliasCheckEnabled?: boolean;
  emailAliasNormalization?: string;
  hard: Record<number, number>;
  soft: Record<number, number>;
  complaint: Record<number, number>;
  ignoreTemplates: string[];
};

export type Bounce = {
  email?: string;
  bounceType: number;
  createdAt: number;
};

export type Tally = {
  count: number;
  latest: number;
};

export type BounceDb = {
  emailBounces: {
    findByEmail(email: string): Promise<Array<Bounce>>;
  };
};

export const BOUNCE_TYPE_HARD = 1;
export const BOUNCE_TYPE_SOFT = 2;
export const BOUNCE_TYPE_COMPLAINT = 3;

export class Bounces {
  private readonly bounceRules: Record<number, any>;
  private readonly emailNormalization: EmailNormalization;

  constructor(
    private readonly config: BouncesConfig,
    private readonly db: BounceDb
  ) {
    this.bounceRules = {
      [BOUNCE_TYPE_HARD]: Object.freeze(config.hard || {}),
      [BOUNCE_TYPE_SOFT]: Object.freeze(config.soft || {}),
      [BOUNCE_TYPE_COMPLAINT]: Object.freeze(config.complaint || {}),
    };
    this.emailNormalization = new EmailNormalization(
      config.emailAliasNormalization || '[]'
    );
  }

  async check(email: string, template: string) {
    if (this.config.enabled) {
      return await this.checkBounces(email, template);
    }
    return undefined;
  }

  async checkBounces(email: string, template: string) {
    if (this.config.ignoreTemplates.includes(template)) {
      return undefined;
    }

    let bounces: Array<Bounce>;

    if (this.config.aliasCheckEnabled) {
      bounces = await this.checkBouncesWithAliases(email);
    } else {
      bounces = await this.db.emailBounces.findByEmail(email);
    }

    return this.applyRules(bounces);
  }

  private async checkBouncesWithAliases(email: string): Promise<Array<Bounce>> {
    // Given an email alias like test+123@domain.com:
    // We look for bounces to the 'root' email -> `test@domain.com`
    // And look for bounces to the alias with a wildcard -> `test+%@domain.com`
    //
    // This prevents us from picking up false positives when we replace the alias
    // with a wildcard, and doesn't miss the root email bounces either. We have to
    // use both because just using the wildcard would miss bounces sent to the root
    // and just using the root with a wildcard would pickup false positives.
    //
    // So, test+123@domain.com would match:
    //   - test@domain.com            Covered by normalized email
    //   - test+123@domain.com        Covered by wildcard email
    //   - test+asdf@domain.com       Covered by wildcard email
    // but not
    //   - testing@domain.com         Not picked up by wildcard since we include the '+'
    const normalizedEmail = this.emailNormalization.normalizeEmailAliases(
      email,
      ''
    );
    const wildcardEmail = this.emailNormalization.normalizeEmailAliases(
      email,
      '+%'
    );

    const [normalizedBounces, wildcardBounces] = await Promise.all([
      this.db.emailBounces.findByEmail(normalizedEmail),
      this.db.emailBounces.findByEmail(wildcardEmail),
    ]);

    // Merge and deduplicate by email+createdAt
    // There shouldn't be any overlap, but just in case
    const seen = new Set<string>();
    const merged = [...normalizedBounces, ...wildcardBounces].filter(
      (bounce) => {
        const key = `${bounce.email || ''}:${bounce.createdAt}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      }
    );

    return merged.sort((a, b) => b.createdAt - a.createdAt);
  }

  private applyRules(bounces: Array<Bounce>) {
    const tallies: Record<number, any> = {
      [BOUNCE_TYPE_HARD]: {
        count: 0,
        latest: 0,
      },
      [BOUNCE_TYPE_COMPLAINT]: {
        count: 0,
        latest: 0,
      },
      [BOUNCE_TYPE_SOFT]: {
        count: 0,
        latest: 0,
      },
    };
    const now = Date.now();

    // sort to descending order to guarantee latest bounces are processed first
    bounces.sort((a, b) => b.createdAt - a.createdAt);
    bounces.forEach((bounce: Bounce) => {
      const type = bounce.bounceType;
      const ruleSet = this.bounceRules[type];
      if (ruleSet) {
        const tally = tallies[type];
        const tier = ruleSet[tally.count];
        if (!tally.latest) {
          tally.latest = bounce.createdAt;
        }
        if (tier && bounce.createdAt > now - tier) {
          if (type === BOUNCE_TYPE_HARD) {
            throw AppError.emailBouncedHard(tally.latest);
          }
          if (type === BOUNCE_TYPE_COMPLAINT) {
            throw AppError.emailComplaint(tally.latest);
          }
          if (type === BOUNCE_TYPE_SOFT) {
            throw AppError.emailBouncedSoft(tally.latest);
          }
        }
        tally.count++;
      }
    });
    return tallies;
  }
}
