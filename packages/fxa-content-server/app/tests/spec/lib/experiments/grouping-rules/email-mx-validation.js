/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Experiment from 'lib/experiments/grouping-rules/email-mx-validation';
import sinon from 'sinon';

describe('lib/experiments/grouping-rules/email-mx-validation', () => {
  let experiment;
  const subject = { uniqueUserId: 'quzz' };

  beforeEach(() => {
    experiment = new Experiment();
  });

  describe('choose', () => {
    it('returns false when given no subject', () => {
      assert.equal(experiment.choose(), false);
    });

    it('returns false when the subject does not have a unique user id', () => {
      assert.equal(experiment.choose({}), false);
    });

    it('calls bernoulliTrial with the correct arguments', () => {
      sinon.spy(experiment, 'bernoulliTrial');
      experiment.choose(subject);
      assert.isTrue(
        experiment.bernoulliTrial.calledOnceWith(0.2, subject.uniqueUserId)
      );
    });

    it('calls uniformChoice with the correct arguments and return the result', () => {
      sinon.stub(experiment, 'bernoulliTrial').returns(true);
      sinon.stub(experiment, 'uniformChoice').returns(true);
      const result = experiment.choose(subject);
      assert.isTrue(
        experiment.uniformChoice.calledOnceWith(
          ['control', 'treatment'],
          subject.uniqueUserId
        )
      );
      assert.isTrue(result);
    });

    it('returns false by default', () => {
      sinon.stub(experiment, 'bernoulliTrial').returns(false);
      const result = experiment.choose(subject);
      assert.isFalse(result);
    });
  });
});
