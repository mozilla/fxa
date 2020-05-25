/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import checkEmailDomain from 'lib/email-domain-validator';
import p from 'lib/promise';
import sinon from 'sinon';
import Tooltip from 'views/tooltip';
import TopEmailDomains from 'lib/top-email-domains';
import xhr from 'lib/xhr';

// This is from the email-domain-validator module
const REJECTION_CODE = '__INVALID_EMAIL_DOMAIN__';

const EMAIL_SELECTOR = 'input[type=email]';
const TOOLTIP_SELECTOR = '.tooltip-suggest';
let $el;
let view;

const shouldReject = () => assert.fail('The promise should have rejected');

describe('lib/email-domain-validator', () => {
  beforeEach(() => {
    view = {
      logEvent: sinon.stub(),
      logFlowEvent: sinon.stub(),
      showValidationError: sinon.stub(),
    };

    $('body').append(
      '<div class="input-row test-input"><input type="email" id="email" name="email"/></div>'
    );
    $el = $(EMAIL_SELECTOR);
  });

  afterEach(() => {
    $('.test-input').remove();
  });

  it('should check the list of top domains', () => {
    $el.val('quuz@popular.mail.co.gd');
    sinon.stub(TopEmailDomains, 'has').returns(true);
    sinon.spy(xhr, 'ajax');
    return checkEmailDomain($el, view).then(() => {
      assert.isTrue(TopEmailDomains.has.calledOnceWith('popular.mail.co.gd'));
      assert.isFalse(xhr.ajax.called);
      assert.isTrue(
        view.logFlowEvent.calledWith('email-domain-validation.skipped')
      );
      xhr.ajax.restore();
      TopEmailDomains.has.restore();
    });
  });

  it('should check if the domain has previously failed validation and reject', () => {
    sinon.stub(xhr, 'ajax').returns(Promise.resolve({ result: 'none' }));
    $el.val('quuz@failed.once.is.enough.co.gd');

    return (
      checkEmailDomain($el, view)
        .then(shouldReject)
        // catch first failure
        .catch(() =>
          checkEmailDomain($el, view)
            .then(shouldReject)
            .catch(() => {
              assert.isTrue(xhr.ajax.calledOnce);
              assert.isTrue(
                view.logFlowEvent.calledWith(
                  'email-domain-validation.triggered'
                )
              );
              assert.isTrue(
                view.logFlowEvent.calledWith('email-domain-validation.block')
              );
              xhr.ajax.restore();
            })
        )
    );
  });

  it('should check if the domain has been previously resolved with an A record and resolve', () => {
    sinon.stub(xhr, 'ajax').returns(Promise.resolve({ result: 'A' }));
    $el.val('quuz@two.As.makes.it.right.co.gd');

    return (
      checkEmailDomain($el, view)
        .then(shouldReject)
        // catch first failure
        .catch(() =>
          checkEmailDomain($el, view).then(() => {
            assert.isTrue(xhr.ajax.calledOnce);
            assert.isTrue(
              view.logFlowEvent.calledWith('email-domain-validation.triggered')
            );
            assert.isTrue(
              view.logFlowEvent.calledWith('email-domain-validation.warn')
            );
            assert.isTrue(
              view.logFlowEvent.calledWith('email-domain-validation.ignored')
            );
            xhr.ajax.restore();
          })
        )
    );
  });

  it('should resolve on a successful MX record lookup', () => {
    sinon.stub(xhr, 'ajax').returns(Promise.resolve({ result: 'MX' }));
    $el.val('quuz@great.success.co.gd');

    return checkEmailDomain($el, view).then(() => {
      xhr.ajax.calledOnceWith({
        contentType: 'application/json',
        dataType: 'json',
        data: { domain: 'great.success.co.gd' },
        type: 'POST',
        url: '/validate-email-domain',
      });

      assert.isTrue(
        view.logEvent.calledWith('emailDomainValidation.triggered')
      );
      assert.isTrue(view.logEvent.calledWith('emailDomainValidation.success'));
      assert.isTrue(
        view.logFlowEvent.calledWith('email-domain-validation.triggered')
      );
      assert.isTrue(
        view.logFlowEvent.calledWith('email-domain-validation.success')
      );
      xhr.ajax.restore();
    });
  });

  it('should reject and show a tooltip on a successful A record lookup', () => {
    sinon.stub(xhr, 'ajax').returns(Promise.resolve({ result: 'A' }));
    const renderSpy = sinon.spy(Tooltip.prototype, 'render');
    $el.val('quuz@no.MX.but.yes.A.co.gd');

    return checkEmailDomain($el, view)
      .then(() => assert.fail('The promise should have rejected'))
      .catch((err) => {
        assert.equal(err, REJECTION_CODE);

        return (
          p
            // wait for tooltip
            .delay(50)
            .then(() => {
              assert.isTrue(
                view.logEvent.calledWith('emailDomainValidation.triggered')
              );
              assert.isTrue(
                view.logEvent.calledWith('emailDomainValidation.fallback')
              );
              assert.isTrue(
                view.logFlowEvent.calledWith(
                  'email-domain-validation.triggered'
                )
              );
              assert.isTrue(
                view.logFlowEvent.calledWith('email-domain-validation.warn')
              );

              assert.isTrue(renderSpy.calledOnce);

              renderSpy.restore();
              xhr.ajax.restore();

              const $tooltipEl = $(TOOLTIP_SELECTOR);
              assert.equal($tooltipEl.length, 1);
              assert.equal($tooltipEl.text(), 'Mistyped email?✕');

              $tooltipEl.find('.dismiss').click();
              assert.equal($(TOOLTIP_SELECTOR).length, 0);
              assert.isTrue(
                view.logEvent.calledWith('emailDomainValidation.dimissed')
              );
            })
        );
      });
  });

  it('should reject and show a validation error on a successful "none" result', () => {
    sinon.stub(xhr, 'ajax').returns(Promise.resolve({ result: 'none' }));
    sinon.spy(AuthErrors, 'toInvalidEmailDomainError');
    $el.val('quuz@no.records.co.gd');

    return checkEmailDomain($el, view)
      .then(() => assert.fail('The promise should have rejected'))
      .catch((err) =>
        p.delay(50).then(() => {
          assert.equal(err, REJECTION_CODE);
          assert.isTrue(
            AuthErrors.toInvalidEmailDomainError.calledOnceWith(
              'no.records.co.gd'
            )
          );
          assert.isTrue(
            view.showValidationError.calledOnceWith(
              $el,
              AuthErrors.toInvalidEmailDomainError.returnValues[0]
            )
          );

          assert.isTrue(
            view.logEvent.calledWith('emailDomainValidation.triggered')
          );
          assert.isTrue(view.logEvent.calledWith('emailDomainValidation.fail'));
          assert.isTrue(
            view.logFlowEvent.calledWith('email-domain-validation.triggered')
          );
          assert.isTrue(
            view.logFlowEvent.calledWith('email-domain-validation.block')
          );

          AuthErrors.toInvalidEmailDomainError.restore();
          xhr.ajax.restore();
        })
      );
  });
});
