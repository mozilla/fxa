/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RelierPage } from './relier';

/**
 * The untrusted relying party (321done). It serves the same static assets as
 * the trusted app, so only the origin differs and every locator is inherited.
 */
export class UntrustedRelierPage extends RelierPage {
  protected override get relierUrl() {
    return this.target.untrustedRelierUrl;
  }
}
