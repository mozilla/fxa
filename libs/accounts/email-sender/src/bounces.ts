/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError } from '@fxa/accounts/errors';

export type BouncesConfig = {
  enabled: boolean;
  hard: Record<number, number>;
  soft: Record<number, number>;
  complaint: Record<number, number>;
  ignoreTemplates: string[];
};

export type Bounce = {
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

  constructor(
    private readonly config: BouncesConfig,
    private readonly db: BounceDb
  ) {
    this.bounceRules = {
      [BOUNCE_TYPE_HARD]: Object.freeze(config.hard || {}),
      [BOUNCE_TYPE_SOFT]: Object.freeze(config.soft || {}),
      [BOUNCE_TYPE_COMPLAINT]: Object.freeze(config.complaint || {}),
    };
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

    const bounces = await this.db.emailBounces.findByEmail(email);
    return this.applyRules(bounces);
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
