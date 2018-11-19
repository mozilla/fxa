/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {assert} = require('chai');
const BaseView = require('views/base');
const Cocktail = require('cocktail');
const SaveOptionsMixin = require('views/mixins/save-options-mixin');
const sinon = require('sinon');

const View = BaseView.extend({});

Cocktail.mixin(
  View,
  SaveOptionsMixin
);

describe('views/mixins/save-options-mixin', () => {
  let view;
  let sandbox;
  const appendToElement = '.element';
  const text = 'some random text';

  beforeEach(() => {
    view = new View({});
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('should print text', () => {
    let printDocument;
    beforeEach(() => {
      printDocument = {
        close: () => {},
        document: {
          close: () => {},
          write: () => {}
        },
        focus: () => {},
        print: () => {}
      };
      sandbox.spy(printDocument.document, 'write');
      sandbox.spy(printDocument, 'print');

      sandbox.stub(view.window, 'open').callsFake(() => {
        return printDocument;
      });
      sandbox.spy(view, '_displaySuccess');
      view.print(text);
    });

    it('prints text', () => {
      assert.equal(view.window.open.called, true, 'open window called');
      assert.include(printDocument.document.write.args[0][0], text, 'window contains recovery key');
      assert.equal(printDocument.print.called, true, 'called print');
    });

    it('display success', () => {
      assert.equal(view._displaySuccess.called, true, 'display success called');
    });
  });

  describe('should copy text', () => {
    beforeEach(() => {
      sandbox.stub(view.window.document, 'execCommand').callsFake(() => {});
      sandbox.spy(view, '_displaySuccess');
      view.copy(text, appendToElement);
    });

    it('copy text', () => {
      assert.equal(view.window.document.execCommand.called, true, 'execCommand called');
    });

    it('display success', () => {
      assert.equal(view._displaySuccess.called, true, 'display success called');
    });
  });

  describe('should download text', () => {
    beforeEach(() => {
      sandbox.stub(view.window.document, 'getElementById').callsFake(() => {
        return {
          click: () => {}
        };
      });
      sandbox.spy(view, '_displaySuccess');
      view.download(text, 'somefile@example.com', appendToElement);
    });

    it('download text', () => {
      assert.equal(view.window.document.getElementById.called, true, 'getElementById called');
    });

    it('display success', () => {
      assert.equal(view._displaySuccess.called, true, 'display success called');
    });
  });
});
