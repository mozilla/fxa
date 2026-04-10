/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { QueryParams } from '../../..';
import { MozServices } from '../../../lib/types';

export interface ResetPasswordContainerProps {
  flowQueryParams?: QueryParams;
  serviceName: MozServices;
  setCurrentSplitLayout: (value: boolean) => void;
}

export interface ResetPasswordProps {
  errorMessage?: string;
  requestResetPasswordCode: (email: string) => Promise<void>;
  serviceName: MozServices;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  /**
   * Although Reset Password does not use the split layout, navigating from
   * a page that does (like signin) causes split layout to be shown during
   * page transitions. We "reset" the layout by passing this value in on
   * the first reset PW screen (/reset_password).
   */
  setCurrentSplitLayout: (value: boolean) => void;
}

export interface ResetPasswordFormData {
  email: string;
}
