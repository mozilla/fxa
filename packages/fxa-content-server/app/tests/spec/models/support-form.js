/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SupportForm from 'models/support-form';
import { assert } from 'chai';

describe('models/support-form', function() {
  let supportForm;

  beforeEach(function() {
    supportForm = new SupportForm({
      plan: '123done',
      productName: 'FxA - Best Product Ever',
      topic: '345finished',
      issue: 'Billing',
      subject: '',
      message: '678completed',
    });
  });

  it('requires a product name', function() {
    supportForm.set('productName', '');
    assert.isFalse(supportForm.isValid());
  });

  it('requires a topic', function() {
    supportForm.set('topic', '');
    assert.isFalse(supportForm.isValid());
  });

  it('requires an issue', function() {
    supportForm.set('issue', '');
    assert.isFalse(supportForm.isValid());
  });

  it('requires a message', function() {
    supportForm.set('message', '');
    assert.isFalse(supportForm.isValid());
  });

  it('does not require a subject', function() {
    assert.isTrue(supportForm.isValid());
  });
});
