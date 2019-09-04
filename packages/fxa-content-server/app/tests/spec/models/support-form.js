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
      planId: '123done_9001',
      topic: '345finished',
      subject: '',
      message: '678completed',
    });
  });

  it('requires a plan', function() {
    supportForm.set('plan', '');
    assert.isFalse(supportForm.isValid());
  });

  it('requires a plan id', function() {
    supportForm.set('planId', '');
    assert.isFalse(supportForm.isValid());
  });

  it('requires a topic', function() {
    supportForm.set('topic', '');
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
