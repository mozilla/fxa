/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Renderer, { splitPlainTextLine } from '../../../lib/senders/renderer';
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
});
