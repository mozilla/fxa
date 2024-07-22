/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../../lib/types';
import { Integration, IntegrationType } from '../../../models';
import { MOCK_RECOVERY_CODE } from '../../mocks';
import { CONSUME_RECOVERY_CODE_MUTATION } from './gql';
import { ConsumeRecoveryCodeResponse } from './interfaces';

export function mockConsumeRecoveryCodeUseMutation() {
  const result = createConsumeRecoveryCodeResponse();
  return {
    request: {
      query: CONSUME_RECOVERY_CODE_MUTATION,
      variables: { input: { code: MOCK_RECOVERY_CODE } },
    },
    result,
  };
}

export function createConsumeRecoveryCodeResponse(): {
  data: ConsumeRecoveryCodeResponse;
} {
  return {
    data: {
      consumeRecoveryCode: {
        remaining: 3,
      },
    },
  };
}

export const mockWebIntegration = {
  type: IntegrationType.Web,
  getService: () => MozServices.Default,
  isSync: () => false,
  wantsKeys: () => false,
  data: {},
} as Integration;

export * from '../../mocks';
