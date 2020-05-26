/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * To ensure that the newsletter and qr cad experiment are mutually
 * exclusive, we create a new experiment rule to select only one of them.
 */
'use strict';

const BaseGroupingRule = require('./base');
const GROUPS = ['newsletterSync', 'qrCodeCad'];

module.exports = class ExperimentChooser extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'newsletterCadChooser';

    // Easier to set class properties for testability
    this.groups = GROUPS;
  }

  choose(subject = {}) {
    return this.uniformChoice(this.groups, subject.uniqueUserId);
  }
};
