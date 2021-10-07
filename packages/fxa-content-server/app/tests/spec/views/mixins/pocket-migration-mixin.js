/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';
import BaseView from 'views/base';
import Relier from 'models/reliers/relier';
import Cocktail from 'cocktail';
import { Model } from 'backbone';
import PocketMigrationMixin from 'views/mixins/pocket-migration-mixin';

describe('views/mixins/pocket-migration-mixin', () => {
  let view;
  let relier;
  class View extends BaseView {}
  Cocktail.mixin(View, PocketMigrationMixin);

  beforeEach(() => {
    relier = new Relier();
    view = new View({
      relier,
    });
  });

  describe('setInitialContext', () => {
    it('sets isInPocketMigration', () => {
      sinon.stub(view, 'isInPocketMigrationTreatment').callsFake(() => true);
      const context = new Model({});
      view.setInitialContext(context);
      assert.isTrue(context.get('isInPocketMigration'));
    });
  });

  describe('isInPocketMigrationTreatment', () => {
    it('returns true if in experiment', () => {
      sinon
        .stub(view, 'getAndReportExperimentGroup')
        .callsFake(() => 'treatment');
      assert.isTrue(view.isInPocketMigrationTreatment());
    });

    it('returns false if not in experiment', () => {
      sinon.stub(view, 'getAndReportExperimentGroup').callsFake(() => false);
      assert.isFalse(view.isInPocketMigrationTreatment());
    });
  });
});
