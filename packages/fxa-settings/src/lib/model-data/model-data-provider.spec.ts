/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GenericData } from './data-stores';
import { ModelDataProvider } from './model-data-provider';

describe('model-data-provider', function () {
  let modelDataProvider: ModelDataProvider;

  beforeEach(() => {
    modelDataProvider = new ModelDataProvider(new GenericData({}));
  });

  it('validates', () => {
    expect(() => modelDataProvider.validate()).not.toThrow();
  });

  it('isValid', () => {
    expect(modelDataProvider.isValid()).toBe(true);
  });

  it('tries to validate', () => {
    expect(modelDataProvider.tryValidate()).toEqual({
      isValid: true,
      error: undefined,
    });
  });
});
