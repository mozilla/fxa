/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Settings from '.';
import { GenericData } from '../../lib/model-data';
import { IntegrationData, IntegrationType } from '../../models';
import { SettingsIntegration } from './interfaces';

export function createMockSettingsIntegration({
  type = IntegrationType.Web,
  isSync = false,
}: {
  type?: IntegrationType;
  isSync?: boolean;
} = {}): SettingsIntegration {
  return {
    type,
    data: new IntegrationData(new GenericData({})),
  };
}

const flowQueryParams = {
  deviceId: 'x',
  flowBeginTime: 1,
  flowId: 'x',
};

export const Subject = () => (
  <Settings
    {...{ flowQueryParams }}
    integration={createMockSettingsIntegration()}
  />
);
