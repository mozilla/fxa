/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const BaseGroupingRule = require('../../../fxa-shared').experiments
  .BaseGroupingRule;

const GROUPS_DEFAULT = ['control', 'treatment-secondary', 'treatment-recovery'];

class PostVerifyEmailGroupingRule extends BaseGroupingRule {
  constructor(config) {
    super();
    this.enabled = config.enabled;
    this.rolloutRate = config.rolloutRate;
    this.name = 'postVerifyEmails';
    this.groups = GROUPS_DEFAULT;
  }

  /**
   * Get the experiment group that the user belongs too.
   *
   * @param {Object} subject
   *  @param {String} uid
   * @returns {String | Boolean}
   */
  choose(subject) {
    if (!subject.uid) {
      throw new Error('subject missing uid');
    }
    if (this.enabled && this.bernoulliTrial(this.rolloutRate, subject.uid)) {
      return this.uniformChoice(this.groups, subject.uid);
    }
    return false;
  }
}

module.exports = PostVerifyEmailGroupingRule;
