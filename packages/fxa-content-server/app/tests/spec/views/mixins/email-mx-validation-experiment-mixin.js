/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Mixin from 'views/mixins/email-mx-validation-experiment-mixin';
import sinon from 'sinon';
import TestTemplate from 'templates/test_template.mustache';

const EXPERIMENT_NAME = 'emailMxValidation';

const View = BaseView.extend({
  template: TestTemplate,
});

Cocktail.mixin(View, Mixin);

let view;

const createViewWithExperiments = experiments => {
  const notifier = {
    trigger: sinon.stub(),
  };
  return new View({
    experiments,
    notifier,
  });
};

const createMockExperiments = mock => {
  const defaultMock = {
    chooseExperiments: sinon.stub(),
    createExperiment: sinon.stub(),
    destroy() {},
    getExperimentGroup: sinon.stub(),
    isInExperiment: sinon.stub(),
    isInExperimentGroup: sinon.stub(),
  };

  return { ...defaultMock, ...mock };
};

describe('views/mixins/email-mx-validation-experiment-mixin', () => {
  afterEach(() => {
    view.remove();
    view.destroy();
  });

  describe('isInEmailMxValidationExperimentTreatment', () => {
    it('returns false when user is not in the experiment', () => {
      view = createViewWithExperiments(
        createMockExperiments({
          isInExperiment: sinon.mock().returns(true),
        })
      );
      assert.isFalse(view.isInEmailMxValidationExperimentTreatment());
    });

    it('returns false when user is not in the treatment group', () => {
      const CONTROL_GROUP_NAME = 'control';
      const isInExperiment = sinon.stub().returns(true);
      const getExperimentGroup = sinon.stub().returns(CONTROL_GROUP_NAME);
      const createExperiment = sinon.stub();
      view = createViewWithExperiments(
        createMockExperiments({
          isInExperiment,
          createExperiment,
          getExperimentGroup,
        })
      );
      assert.isFalse(view.isInEmailMxValidationExperimentTreatment());
      assert.isTrue(
        createExperiment.calledOnceWith(EXPERIMENT_NAME, CONTROL_GROUP_NAME)
      );
    });

    it('returns true when user is in the treatment group', () => {
      const TREATMENT_GROUP_NAME = 'treatment';
      const isInExperiment = sinon.stub().returns(true);
      const getExperimentGroup = sinon.stub().returns(TREATMENT_GROUP_NAME);
      const createExperiment = sinon.stub();
      view = createViewWithExperiments(
        createMockExperiments({
          isInExperiment,
          createExperiment,
          getExperimentGroup,
        })
      );
      assert.isTrue(view.isInEmailMxValidationExperimentTreatment());
      assert.isTrue(
        createExperiment.calledOnceWith(EXPERIMENT_NAME, TREATMENT_GROUP_NAME)
      );
    });
  });
});
