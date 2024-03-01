/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GenericData } from '../../lib/model-data';
import { ReachRouterWindow } from '../../lib/window';
import { KeyStretchExperiment } from './key-stretch-experiment';

describe('Key Stretch Experiment Model', function () {
  const ffOn = {
    featureFlags: {
      keyStretchV2: true,
    },
  };

  const ffOff = {
    featureFlags: {
      keyStretchV2: false,
    },
  };

  const window = new ReachRouterWindow();
  let model: KeyStretchExperiment;
  beforeEach(function () {
    model = new KeyStretchExperiment(new GenericData({}));
  });

  afterEach(() => {
    window.localStorage.removeItem(`__fxa_storage.experiment.keyStretchV2`);
  });

  it('is disabled by default', () => {
    const model = new KeyStretchExperiment(new GenericData({}));
    expect(model.isV2(ffOn)).toBeFalsy();
    expect(model.isV2(ffOff)).toBeFalsy();
  });

  it('enables with stretch query parameter', () => {
    const model = new KeyStretchExperiment(new GenericData({ stretch: '2' }));
    expect(model.isV2(ffOn)).toBeTruthy();
    expect(model.isV2(ffOff)).toBeFalsy();
  });

  it('enables with force experiment query parameters', () => {
    const model = new KeyStretchExperiment(
      new GenericData({
        forceExperiment: 'keyStretchV2',
        forceExperimentGroup: 'v2',
      })
    );
    expect(model.isV2(ffOn)).toBeTruthy();
    expect(model.isV2(ffOff)).toBeFalsy();
  });

  it('enables with content-server experiment', () => {
    window.localStorage.setItem(
      `__fxa_storage.experiment.keyStretchV2`,
      JSON.stringify(JSON.stringify({ enrolled: true }))
    );
    const model = new KeyStretchExperiment(new GenericData({}));
    expect(model.isV2(ffOn)).toBeTruthy();
    expect(model.isV2(ffOff)).toBeFalsy();
  });
});
