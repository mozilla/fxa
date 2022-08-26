/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Renderer, {
  flattenNestedObjects,
  splitPlainTextLine,
} from '../../../lib/senders/renderer';
import { NodeRendererBindings } from '../../../lib/senders/renderer/bindings-node';

chai.use(chaiAsPromised);

describe('Renderer', () => {
  it('fails with a bad localizer ftl basePath', () => {
    assert.throws(() => {
      let LocalizerBindings = new NodeRendererBindings({
        translations: {
          basePath: '/not/a/apth',
        },
      });
      new Renderer(LocalizerBindings);
    }, 'Invalid ftl translations basePath');
  });

  describe('splitPlainTextLine key value extraction', () => {
    const pair = {
      key: 'foo_2-Bar',
      val: 'foo - bar',
    };

    it('splits line with default format', () => {
      const { key, val } = splitPlainTextLine(`${pair.key} = "${pair.val}"`);

      assert.equal(key, pair.key);
      assert.equal(val, pair.val);
    });

    it('handles line with trailing whitespace', () => {
      const { key, val } = splitPlainTextLine(
        `  ${pair.key}  =  "${pair.val}"  `
      );
      assert.equal(key, pair.key);
      assert.equal(val, pair.val);
    });

    it('handles compact line format', () => {
      const { key, val } = splitPlainTextLine(`${pair.key}="${pair.val}"`);
      assert.equal(key, pair.key);
      assert.equal(val, pair.val);
    });

    it('handles escaped quote format', () => {
      const { key, val } = splitPlainTextLine(
        `${pair.key}="${pair.val} \"baz\" "`
      );
      assert.equal(key, pair.key);
      assert.equal(val, pair.val + ' "baz" ');
    });

    it('requires value to be quoted string', () => {
      const { key, val } = splitPlainTextLine(`${pair.key} = ${pair.val}`);
      assert.notExists(key);
      assert.notExists(val);
    });
  });

  describe('flattenNestedObjects', () => {
    it('flattens objects as expected', () => {
      const context = {
        property1: 'foo',
        object2: { property2: 'bar' },
      };

      assert.deepEqual(flattenNestedObjects(context), {
        property1: 'foo',
        property2: 'bar',
      });
    });

    it('flattens deeply nested objects as expected', () => {
      const context = {
        property1: 'foo',
        object1: { property2: 'bizz', object2: { property3: 'bazz' } },
        object3: { property4: 'qux', property5: 'xyz' },
      };

      assert.deepEqual(flattenNestedObjects(context), {
        property1: 'foo',
        property2: 'bizz',
        property3: 'bazz',
        property4: 'qux',
        property5: 'xyz',
      });
    });
  });

  describe('localizeAndRender', () => {
    const renderer = new Renderer(new NodeRendererBindings());

    const rendererContext = {
      acceptLanguage: 'it',
      cssPath: 'test',
      subject: 'test',
      template: 'test',
      templateValues: {},
    };

    it('localizes as expected without rendering if "<%" is not present', async () => {
      const result = await renderer.localizeAndRender(
        undefined,
        {
          id: 'manage-account',
          message: 'Manage account',
        },
        rendererContext
      );
      assert.equal(result, 'Gestisci account');
    });

    it('localizes and then renders if "<%" is present', async () => {
      const result = await renderer.localizeAndRender(
        undefined,
        {
          id: 'verifyShortCode-title-2',
          message: 'Open the internet with Firefox',
        },
        rendererContext
      );
      assert.equal(result, 'Esplora Internet con Firefox');
    });
  });
});
