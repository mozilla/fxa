/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactNode } from 'react';
import { MozServices, TotpInfo } from '../../lib/types';
import { Integration } from '../../models';
import { queryParamsToMetricsContext } from '../../lib/metrics';
import { SigninLocationState } from '../Signin/interfaces';
import { SigninRecoveryLocationState } from '../InlineRecoverySetupFlow/interfaces';

export type MetricsContext = ReturnType<typeof queryParamsToMetricsContext>;

export type NavTo = (
  uri:
    | '/'
    | '/signin_token_code'
    | '/signin_totp_code'
    | '/inline_recovery_setup',
  state?: SigninLocationState | SigninRecoveryLocationState
) => void;

export interface InlineTotpSetupProps {
  currentStep: number;
  onContinue: () => void;
  serviceName: MozServices;
  integration: Integration;
  signedInWithPasskey?: boolean;
  /** The guarded enrolment step, composed by the container and rendered at step 1. */
  enrolment: ReactNode;
}

export interface InlineTotpSetupPropsOld {
  totp: TotpInfo;
  serviceName?: MozServices;
  cancelSetupHandler: () => void;
  verifyCodeHandler: (code: string) => void;
  integration?: Integration;
}
