/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Broker from 'models/auth_brokers/base';
import chai from 'chai';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import View from 'views/cannot_create_account';

var assert = chai.assert;

describe('views/cannot_create_account', function() {
  var view;
  var relier;
  var broker;

  beforeEach(function() {
    relier = new Relier();
    broker = new Broker({
      relier: relier,
    });
    view = new View({
      broker: broker,
      relier: relier,
    });
  });

  afterEach(function() {
    view.remove();
    view.destroy();
  });

  it('ftc link opens in a new tab for sync', function() {
    sinon.stub(relier, 'isSync').callsFake(function() {
      return true;
    });

    return view.render().then(function() {
      assert.ok(view.$('#fxa-cannot-create-account-header').length);
      assert.equal(view.$('.ftc').attr('target'), '_blank');
    });
  });

  it('ftc link opens in a same tab for all others', function() {
    sinon.stub(relier, 'isSync').callsFake(function() {
      return false;
    });

    return view.render().then(function() {
      assert.equal(view.$('.ftc').attr('target'), null);
    });
  });

  it('has a working `Learn More` link with the default broker', function() {
    return view.render().then(function() {
      assert.lengthOf(view.$('.show-visible-url'), 0);
    });
  });

  it('has a `Learn More` link converted to text with `convertExternalLinksToText` capability', function() {
    broker.setCapability('convertExternalLinksToText', true);

    return view.render().then(function() {
      assert.lengthOf(view.$('.visible-url'), 1);
    });
  });
});
