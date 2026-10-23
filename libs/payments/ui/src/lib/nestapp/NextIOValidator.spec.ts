/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NextIOValidator } from './NextIOValidator';
import { GetCMSChurnInterventionActionResult } from './validators/GetCMSChurnInterventionActionResult';
import { GetExperimentsActionResult } from './validators/GetExperimentsActionResult';

class TestService {
  result: unknown;

  @NextIOValidator(undefined, GetExperimentsActionResult)
  async getExperiments() {
    return this.result as object;
  }

  @NextIOValidator(undefined, GetCMSChurnInterventionActionResult)
  async getCMSChurnIntervention() {
    return this.result as object;
  }
}

describe('NextIOValidator', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
  });

  it('accepts a GetExperimentsActionResult with experiments', async () => {
    service.result = { experiments: { Features: {}, Enrollments: [] } };
    await expect(service.getExperiments()).resolves.toEqual(service.result);
  });

  it('accepts a GetExperimentsActionResult without experiments', async () => {
    service.result = {};
    await expect(service.getExperiments()).resolves.toEqual({});
  });

  it('rejects a GetExperimentsActionResult whose experiments is not an object', async () => {
    service.result = { experiments: 'x' };
    await expect(service.getExperiments()).rejects.toEqual([
      expect.objectContaining({
        property: 'experiments',
        constraints: { isObject: 'experiments must be an object' },
      }),
    ]);
  });

  it('accepts a GetCMSChurnInterventionActionResult with an array', async () => {
    service.result = { churnInterventions: [] };
    await expect(service.getCMSChurnIntervention()).resolves.toEqual({
      churnInterventions: [],
    });
  });

  it('rejects a GetCMSChurnInterventionActionResult whose churnInterventions is not an array', async () => {
    service.result = { churnInterventions: {} };
    await expect(service.getCMSChurnIntervention()).rejects.toEqual([
      expect.objectContaining({
        property: 'churnInterventions',
        constraints: { isArray: 'churnInterventions must be an array' },
      }),
    ]);
  });
});
