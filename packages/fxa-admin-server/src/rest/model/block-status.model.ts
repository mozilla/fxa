/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class BlockStatus {
  public retryAfter!: number;

  public reason!: string;

  public action!: string;

  public blockingOn!: string;

  public startTime!: number;

  public duration!: number;

  public attempt!: number;

  public policy!: string;
}
