/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const { assert } = require('chai');

describe('lib/senders/templates/index:', () => {
  let templates;

  before(() => {
    templates = require(`${ROOT_DIR}/lib/senders/templates`);
  });

  it('interface is correct', () => {
    assert.equal(typeof templates, 'object');
    assert.equal(Object.keys(templates).length, 2);
    assert.equal(typeof templates.generateTemplateName, 'function');
    assert.equal(templates.generateTemplateName.length, 1);
    assert.equal(typeof templates.init, 'function');
    assert.equal(templates.init.length, 0);
  });

  it('templates.generateTemplateName converts from snake case to camel case', () =>
    assert.equal(
      templates.generateTemplateName('this_is-a_Test'),
      'thisIs-aTestEmail'
    ));

  it('templates.generateTemplateName does not alter SMS template names', () =>
    assert.equal(
      templates.generateTemplateName('sms.another_test'),
      'sms.another_test'
    ));

  describe('templates.init:', () => {
    let result;

    before(() => templates.init().then(r => (result = r)));

    it('result is correct', () => {
      assert.equal(typeof result, 'object');
      const keys = Object.keys(result);
      assert.equal(keys.length, 29);
      keys.forEach(key => {
        const fn = result[key];
        assert.equal(typeof fn, 'function');
        assert.equal(fn.length, 1);
      });
    });
  });
});
