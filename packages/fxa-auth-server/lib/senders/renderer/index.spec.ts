/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Renderer, {
  flattenNestedObjects,
  splitPlainTextLine,
} from './index';
import { NodeRendererBindings } from './bindings-node';

describe('Renderer', () => {
  it('fails with a bad localizer ftl basePath', () => {
    expect(() => {
      const bindings = new NodeRendererBindings({
        translations: { basePath: '/not/a/apth' },
      });
      new Renderer(bindings); // eslint-disable-line no-new
    }).toThrow('Invalid ftl translations basePath');
  });

  describe('splitPlainTextLine key value extraction', () => {
    const pair = { key: 'foo_2-Bar', val: 'foo - bar' };

    it('splits line with default format', () => {
      const { key, val } = splitPlainTextLine(`${pair.key} = "${pair.val}"`);
      expect(key).toBe(pair.key);
      expect(val).toBe(pair.val);
    });

    it('handles line with trailing whitespace', () => {
      const { key, val } = splitPlainTextLine(
        `  ${pair.key}  =  "${pair.val}"  `
      );
      expect(key).toBe(pair.key);
      expect(val).toBe(pair.val);
    });

    it('handles compact line format', () => {
      const { key, val } = splitPlainTextLine(`${pair.key}="${pair.val}"`);
      expect(key).toBe(pair.key);
      expect(val).toBe(pair.val);
    });

    it('handles escaped quote format', () => {
      const { key, val } = splitPlainTextLine(
        `${pair.key}="${pair.val} "baz" "`
      );
      expect(key).toBe(pair.key);
      expect(val).toBe(pair.val + ' "baz" ');
    });

    it('requires value to be quoted string', () => {
      const { key, val } = splitPlainTextLine(`${pair.key} = ${pair.val}`);
      expect(key).toBeUndefined();
      expect(val).toBeUndefined();
    });
  });

  describe('flattenNestedObjects', () => {
    it('flattens objects as expected', () => {
      const context = {
        property1: 'foo',
        object2: { property2: 'bar' },
      };
      expect(flattenNestedObjects(context)).toEqual({
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
      expect(flattenNestedObjects(context)).toEqual({
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
        { id: 'subplat-cancel', message: 'Cancel subscription' },
        rendererContext
      );
      expect(result).toBeTruthy();
      expect(result).not.toBe('Cancel subscription');
    });

    it('renders EJS when "<%" is present in the localized string', async () => {
      const result = await renderer.localizeAndRender(
        undefined,
        { id: 'nonexistent-key-for-ejs-test', message: 'Hello <%- "World" %>' },
        rendererContext
      );
      expect(result).toBe('Hello World');
    });
  });
});
