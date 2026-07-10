/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GenericData, ModelValidationErrors } from '../../../lib/model-data';
import {
  INTEGRATION_ACTIONS,
  IntegrationData,
  WebIntegrationData,
} from './data';

describe('models/integrations/data', () => {
  describe('IntegrationData.action allowlist', () => {
    it.each(INTEGRATION_ACTIONS)(
      'accepts the allowlisted action "%s"',
      (action) => {
        const model = new IntegrationData(new GenericData({ action }));
        // validate() before reading the getter: the getter also validates but
        // clears the dirty flag, which would make a later validate() a no-op.
        expect(() => model.validate()).not.toThrow();
        expect(model.action).toEqual(action);
      }
    );

    it('accepts a missing action', () => {
      const model = new IntegrationData(new GenericData({}));
      expect(() => model.validate()).not.toThrow();
      expect(model.action).toBeUndefined();
    });

    it('rejects an action outside the allowlist', () => {
      const model = new IntegrationData(
        new GenericData({ action: '/evil.example' })
      );
      expect(() => model.validate()).toThrow(ModelValidationErrors);
    });

    // The base allowlist is what closes the open redirect for plain Web
    // integrations, which inherit `action` from IntegrationData rather than
    // overriding it (unlike OAuth and Sync integrations).
    it('rejects an open-redirect action on the inheriting WebIntegrationData', () => {
      const model = new WebIntegrationData(
        new GenericData({ action: '/attacker.example/login' })
      );
      expect(() => model.validate()).toThrow(ModelValidationErrors);
    });
  });
});
