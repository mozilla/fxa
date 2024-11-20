/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { syncEngineConfigs } from '../../../components/ChooseWhatToSync/sync-engines';
import { OAuthIntegration } from './../../../models/integrations/oauth-native-integration';

export type SetPasswordIntegration = Pick<OAuthIntegration, 'type' | 'isSync'>;

export interface SetPasswordFormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export type CreatePasswordHandler = (newPassword: string) => Promise<void>;

export interface SetPasswordProps {
  email: string;
  createPasswordHandler: CreatePasswordHandler;
  setCreatePasswordLoading: (loading: boolean) => void;
  createPasswordLoading: boolean;
  bannerErrorText: string;
  offeredSyncEngineConfigs: typeof syncEngineConfigs | undefined;
  setDeclinedSyncEngines: React.Dispatch<React.SetStateAction<string[]>>;
}
