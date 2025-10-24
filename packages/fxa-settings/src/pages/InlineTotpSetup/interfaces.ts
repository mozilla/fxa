/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices, TotpInfo } from '../../lib/types';
import { Integration } from '../../models';

export interface InlineTotpSetupProps {
  totp: TotpInfo;
  serviceName: MozServices;
  verifyCodeHandler: (code: string) => void;
  integration?: Integration;
}

export interface InlineTotpSetupPropsOld {
  totp: TotpInfo;
  serviceName?: MozServices;
  cancelSetupHandler: () => void;
  verifyCodeHandler: (code: string) => void;
  integration?: Integration;
}
