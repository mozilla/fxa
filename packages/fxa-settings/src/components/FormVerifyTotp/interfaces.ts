/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GleanClickEventDataAttrs } from '../../lib/types';

export type FormVerifyTotpProps = {
  clearBanners?: () => void;
  codeLength: 6 | 8 | 10;
  codeType: 'numeric' | 'alphanumeric';
  errorBannerId?: string;
  errorMessage: string;
  localizedInputLabel: string;
  localizedSubmitButtonText: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  verifyCode: (code: string) => void;
  gleanDataAttrs?: GleanClickEventDataAttrs;
};

export type VerifyTotpFormData = {
  code: string;
};
