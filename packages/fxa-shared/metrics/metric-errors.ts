/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class InvalidMetricError extends Error {
  constructor(
    public readonly name: string,
    public readonly violation: string,
    public readonly critical: boolean,
    public readonly val: string | number | null | undefined,
    public readonly limitOrDefault?: string | number
  ) {
    super(`Bad metric encountered: ${name} - ${violation}`);
  }
}
