/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** The attributes we can count and block on. */
export type BlockOn = 'ip' | 'email' | 'uid';

/** Reasons we might block. Currently only too-many-attempts is supported. */
export type BlockReason = 'too-many-attempts';

/** Represents a configuration rule that describes a block scenario. */
export type Rule = {
  /** The action to count. */
  action: string;
  /** The attribute to count on. */
  blockingOn: BlockOn;
  /** The max number of actions or attempts allowed before a block is created. */
  maxAttempts: number;
  /** The window of time over which attempts are counted. After the window ends, the count essentially goes back to 0. */
  windowDurationInSeconds: number;
  /** The amount of time a block lasts for once it has been created.  */
  blockDurationInSeconds: number;
};

/** Represents a block held in redis. Not these objects will be stringified json.*/
export type BlockRecord = {
  /** The action that was blocked. */
  action: string;
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
};
