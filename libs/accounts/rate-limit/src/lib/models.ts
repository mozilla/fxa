/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** The attributes we can count and block on. */
export type BlockOn = 'ip' | 'email' | 'uid' | 'ip_email' | 'ip_uid';

/** Standard set of fields that can be blocked on. */
export type BlockOnOpts = {
  email?: string;
  ip?: string;
  ip_email?: string;
  uid?: string;
  ip_uid?: string;
};

/**
 * Controls how the block is applied.
 *  - block - only applies to the current action being checked, and is done in isolation.
 *  - ban - will apply to the current action and all other actions being checked for the given rules ip, email, or uid.
 **/
export type BlockPolicy = 'block' | 'ban' | 'report';

/** Constant for the common error message, too-many-attempts. */
export const TOO_MANY_ATTEMPTS = 'too-many-attempts';

/** Reasons we might block. Currently only too-many-attempts is supported. */
export type BlockReason = 'too-many-attempts';

/** Represents a configuration rule that describes a block scenario. */
export type Rule = {
  /** The attribute to count on. */
  blockingOn: BlockOn;
  /** The max number of actions or attempts allowed before a block is created. */
  maxAttempts: number;
  /** The window of time over which attempts are counted. After the window ends, the count essentially goes back to 0. */
  windowDurationInSeconds: number;
  /** The amount of time a block lasts for once it has been created.  */
  blockDurationInSeconds: number;
  /**
   * The policy that controls how exactly the block goes into effect.
   * Be careful with 'ban'! See the 'BlockPolicy' type for more details.
   **/
  blockPolicy: BlockPolicy;
};

/** Represents a block held in redis. Not these objects will be stringified json.*/
export type BlockRecord = {
  /** The action that was blocked. */
  action: string;
  /** Indicates if the defacto default rule was used. True means the 'default' rule was used. False means an action specific rule was used. */
  usedDefaultRule: boolean;
  /** The attribute being checked. */
  blockingOn: BlockOn;
  /** The value of the attribute being checked. */
  blockedValue: string;
  /** The time the block was created. */
  startTime: number;
  /** The time the block is expected to expire. */
  duration: number;
  /** The underlying reason for the block. */
  reason: BlockReason;
  /** The attempt number when the block was added. */
  attempts: number;
  /** Blocking policy to applied */
  policy: BlockPolicy;
};

/** Reports back on the status of a check */
export type BlockStatus = {
  /** Duration that needs to elapse before action can be tried again. */
  retryAfter: number;
  /** Reason for blocking. */
  reason: BlockReason;
  /** The action that was being counted. */
  action: string;
  /** The attribute that exceeded max count and resulted in a block. */
  blockingOn: BlockOn;
  /** Time when block was created */
  startTime: number;
  /** How long block should last */
  duration: number;
  /** The attempt number when the block was added. */
  attempt: number;
  /** The type of block which occurred */
  policy: BlockPolicy;
};
