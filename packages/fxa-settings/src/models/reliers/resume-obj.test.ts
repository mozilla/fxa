/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelContext, GenericContext } from '../../lib/context';
import { ResumeObj } from './resume-obj';

describe('models/reliers/resume-obj', function () {
  let context: ModelContext;
  let model: ResumeObj;

  beforeEach(function () {
    context = new GenericContext({});
    model = new ResumeObj(context);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  // TODO: Model Test Coverage
});
