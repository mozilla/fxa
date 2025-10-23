/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UseFormMethods } from 'react-hook-form';
import { syncEngineConfigs } from '../../lib/sync-engines';
import { SetPasswordFormData } from '../../pages/PostVerify/SetPassword/interfaces';
import { SignupFormData } from '../../pages/Signup/interfaces';
import { CmsButtonType } from '../CmsButtonWithFallback';

export type FormSetupAccountData = SignupFormData | SetPasswordFormData;

export type FormSetupAccountProps = {
  formState: UseFormMethods['formState'];
  errors: UseFormMethods['errors'];
  trigger: UseFormMethods['trigger'];
  register: UseFormMethods['register'];
  getValues: UseFormMethods['getValues'];
  onFocus?: () => void;
  email: string;
  onFocusMetricsEvent?: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  loading: boolean;
  isSync: boolean;
  offeredSyncEngineConfigs?: typeof syncEngineConfigs;
  submitButtonGleanId?: string;
  passwordFormType?: 'signup' | 'post-verify-set-password';
  cmsButton?: CmsButtonType;
};
