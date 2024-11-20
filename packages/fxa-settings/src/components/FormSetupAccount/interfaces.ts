/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UseFormMethods } from 'react-hook-form';
import { SetPasswordFormData } from '../../pages/PostVerify/SetPassword/interfaces';
import { SignupFormData } from '../../pages/Signup/interfaces';
import { syncEngineConfigs } from '../ChooseWhatToSync/sync-engines';

export type FormSetupAccountData = SignupFormData | SetPasswordFormData;

export type FormSetupAccountProps = {
  formState: UseFormMethods['formState'];
  errors: UseFormMethods['errors'];
  trigger: UseFormMethods['trigger'];
  register: UseFormMethods['register'];
  getValues: UseFormMethods['getValues'];
  onFocus: () => void;
  email: string;
  onFocusMetricsEvent: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  loading: boolean;
  isSync: boolean;
  offeredSyncEngineConfigs?: typeof syncEngineConfigs | undefined;
  setDeclinedSyncEngines: React.Dispatch<React.SetStateAction<string[]>>;
  isDesktopRelay: boolean;
  setSelectedNewsletterSlugs?: React.Dispatch<React.SetStateAction<string[]>>;
  // Age check props, if not provided it will not be rendered
  ageCheckErrorText?: string;
  setAgeCheckErrorText?: React.Dispatch<React.SetStateAction<string>>;
  onFocusAgeInput?: () => void;
  onBlurAgeInput?: () => void;
};
