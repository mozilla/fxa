/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UseFormReturn } from 'react-hook-form';
import { SetPasswordFormData } from '../../pages/PostVerify/SetPassword/interfaces';
import { SignupFormData } from '../../pages/Signup/interfaces';
import { syncEngineConfigs } from '../../lib/sync-engines';
import { CmsButtonType } from '../CmsButtonWithFallback';

export type FormSetupAccountData = SignupFormData | SetPasswordFormData;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFormReturn = UseFormReturn<any>;

export type FormSetupAccountProps = {
  formState: AnyFormReturn['formState'];
  errors: Record<string, any>;
  trigger: AnyFormReturn['trigger'];
  register: AnyFormReturn['register'];
  getValues: AnyFormReturn['getValues'];
  onFocus?: () => void;
  email: string;
  onFocusMetricsEvent?: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  loading: boolean;
  isSync: boolean;
  requirePasswordConfirmation?: boolean;
  offeredSyncEngineConfigs?: typeof syncEngineConfigs;
  submitButtonGleanId?: string;
  passwordFormType?: 'signup' | 'post-verify-set-password';
  cmsButton?: CmsButtonType;
};
