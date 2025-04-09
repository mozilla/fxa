/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BlockOn } from './models';

export class ActionNotFound extends Error {
  constructor(public readonly action: string) {
    super(`Could not locate the '${action}' action.`);
  }
}

export class MissingOption extends Error {
  constructor(
    public readonly action: string,
    public readonly blockOn: BlockOn
  ) {
    super(
      `A rule for the '${action}' action requires that '${blockOn}' is provided as an option.`
    );
  }
}

export class InvalidRule extends Error {
  constructor(
    public readonly rule: string,
    public readonly issue: string
  ) {
    super(`${issue}. Check rule: ${rule}.`);
  }
}
