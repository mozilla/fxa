/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** A general type that holds PII data. */
export type PiiData = Record<string, any> | string | undefined | null;

/**
 * Result of a filter action.
 */
export interface FilterActionResult<T> {
  /**
   * The modified value
   */
  val: T;

  /**
   * Whether or not the pipeline can be exited. In the event the filter removes enough data, it might
   * make sense to exit the pipeline of filter actions early.
   */
  exitPipeline: boolean;
}

/** A general interface for running a filter action on PII Data */
export interface IFilterAction {
  /**
   * Filters a value for PII
   * @param val - the value to filter
   * @param depth - if filtering an object, the depth of the current traversal
   * @returns the provided value with modifications, and flag if the action pipeline can be exited.
   */
  execute<T extends PiiData>(val: T, depth?: number): FilterActionResult<T>;
}

/** A general interface for top level classes that filter PII data */
export interface IFilter {
  filter(event: PiiData): PiiData;
}

/** Things to check for when scrubbing for PII. */
export type CheckOnly = 'keys' | 'values' | 'both';
