/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseChoiceRule from 'lib/experiments/grouping-rules/base';
import ExperimentGroupingRules from 'lib/experiments/grouping-rules/index';
import sinon from 'sinon';

describe('lib/experiments/grouping-rules/index', () => {
  it('EXPERIMENT_NAMES is exported', () => {
    assert.lengthOf(ExperimentGroupingRules.EXPERIMENT_NAMES, 8);
  });

  describe('choose', () => {
    let experimentGroupingRules;
    let rule1;
    let rule2;
    let rule3;

    before(() => {
      rule1 = {
        choose: sinon.spy(() => true),
        name: 'rule1',
      };
      rule2 = {
        choose: sinon.spy(() => 'treatment'),
        name: 'rule2',
      };
      rule3 = {
        choose: sinon.spy(() => 'control'),
        forceExperimentAllow: 'rule2',
        name: 'rule3',
      };

      experimentGroupingRules = new ExperimentGroupingRules({
        env: 'development',
        experimentGroupingRules: [rule1, rule2, rule3],
        featureFlags: {
          foo: 'bar',
        },
      });
    });

    it('returns `undefined` if ExperimentGroupingRule with name does not exist', () => {
      assert.isUndefined(experimentGroupingRules.choose('does-not-exist', {}));
    });

    it('returns `false` if experiment does not meet forceExperiment requirements', () => {
      assert.isFalse(
        experimentGroupingRules.choose('rule1', {
          forceExperiment: 'rule2',
          forceExperimentGroup: 'treatment',
        })
      );
      assert.isFalse(
        experimentGroupingRules.choose('rule3', {
          forceExperiment: 'rule1',
          forceExperimentGroup: 'treatment',
        })
      );
    });

    it('returns `forceExperimentGroup` if defined and `forceExperiment === experiment.name', () => {
      assert.equal(
        experimentGroupingRules.choose('rule1', {
          forceExperiment: 'rule1',
          forceExperimentGroup: 'treatment',
        }),
        'treatment'
      );
    });

    it('delegates to the experimentGroupingRule', () => {
      const subject = { env: 'development', uniqueUserId: 'user-id' };

      assert.isTrue(experimentGroupingRules.choose('rule1', subject));
      assert.isTrue(rule1.choose.calledOnce);
      assert.deepEqual(
        rule1.choose.args[0][0],
        Object.assign(
          {
            experimentGroupingRules,
            featureFlags: {
              foo: 'bar',
            },
          },
          subject
        )
      );

      assert.equal(
        experimentGroupingRules.choose('rule2', subject),
        'treatment'
      );
      assert.isTrue(rule2.choose.calledOnce);
      assert.deepEqual(rule2.choose.args[0][0], rule1.choose.args[0][0]);

      // rule3 is allowed even if rule2 is forced.
      subject.forceExperiment = 'rule2';
      assert.equal(experimentGroupingRules.choose('rule3', subject), 'control');
    });
  });

  describe('choose with mutual exclusion', () => {
    class ChooserRule extends BaseChoiceRule {
      constructor() {
        super();
        this.name = 'chooser-rule';
      }

      choose(subject) {
        return 'rule1';
      }
    }

    class Rule1 extends BaseChoiceRule {
      constructor() {
        super();
        this.name = 'rule1';
      }

      choose(subject) {
        if (
          subject.experimentGroupingRules.choose('chooser-rule', subject) ===
          this.name
        ) {
          return 'rule1-group';
        }
      }
    }

    class Rule2 extends BaseChoiceRule {
      constructor() {
        super();
        this.name = 'rule2';
      }

      choose(subject) {
        if (
          subject.experimentGroupingRules.choose('chooser-rule', subject) ===
          this.name
        ) {
          return 'rule2-group';
        }
      }
    }

    let experimentGroupingRules;
    let chooserRule;
    let rule1;
    let rule2;

    before(() => {
      chooserRule = new ChooserRule();
      rule1 = new Rule1();
      rule2 = new Rule2();

      experimentGroupingRules = new ExperimentGroupingRules({
        experimentGroupingRules: [chooserRule, rule1, rule2],
      });
    });

    it('returns a value for the chosen rule, undefined for the non-chosen rule', () => {
      assert.equal(experimentGroupingRules.choose('rule1'), 'rule1-group');
      assert.isUndefined(experimentGroupingRules.choose('rule2'));
    });
  });
});
