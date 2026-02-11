/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { QueryParams } from '../../..';
import { MozServices } from '../../../lib/types';

export interface ResetPasswordContainerProps {
  flowQueryParams?: QueryParams;
  serviceName: MozServices;
}

export interface ResetPasswordProps {
  errorMessage?: string;
  requestResetPasswordCode: (email: string) => Promise<void>;
  serviceName: MozServices;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

export interface ResetPasswordFormData {
  email: string;
}
