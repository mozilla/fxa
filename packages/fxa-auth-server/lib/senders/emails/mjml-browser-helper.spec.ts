/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { transformMjIncludeTags } from './mjml-browser-helper';

describe('converts <mj-include> to <mj-style> tag', () => {
  function compact(mjml: string) {
    return mjml
      .replace(/\n/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s*</g, '><')
      .trim();
  }

  function check(testCase: { pre: string; post: string }) {
    expect(compact(transformMjIncludeTags(testCase.pre))).toBe(
      compact(testCase.post)
    );
  }

  it('converts mj-include in head', () => {
    check({
      pre: `<mjml>
  <mj-head>
    <mj-include path="./test.css" type="css" />
  </mj-head>
</mjml>`,
      post: `<mjml>
  <mj-head>
    <mj-include path="./test.css" type="css" />
    <mj-style> <%- include('/test.css') %> </mj-style>
  </mj-head>
</mjml>`,
    });
  });

  it('converts mj-include in body', () => {
    check({
      pre: `<mjml>
  <mj-body>
    <mj-include path="./test.css" type="css" />
  </mj-body>
</mjml>`,
      post: `<mjml>
  <mj-head>
    <mj-style> <%- include('/test.css') %> </mj-style>
  </mj-head>
  <mj-body>
    <mj-include path="./test.css" type="css" />
  </mj-body>
</mjml>`,
    });
  });

  it('converts multiple mj-includes', () => {
    check({
      pre: `<mjml>
  <mj-head>
    <mj-include path="./test1.css" type="css" />
    <mj-include path="./test2.css" type="css" />
  </mj-head>
  <mj-body>
    <mj-include path="./test3.css" type="css" />
    <mj-include path="./test4.css" type="css" />
  </mj-body>
</mjml>`,
      post: `<mjml>
  <mj-head>
    <mj-include path="./test1.css" type="css" />
    <mj-include path="./test2.css" type="css" />
    <mj-style> <%- include('/test1.css') %> </mj-style>
    <mj-style> <%- include('/test2.css') %> </mj-style>
    <mj-style> <%- include('/test3.css') %> </mj-style>
    <mj-style> <%- include('/test4.css') %> </mj-style>
  </mj-head>
  <mj-body>
    <mj-include path="./test3.css" type="css" />
    <mj-include path="./test4.css" type="css" />
  </mj-body>
</mjml>`,
    });
  });

  it('converts multi-line mj-include', () => {
    check({
      pre: `<mjml>
  <mj-head>
    <mj-include
      path="./test.css"
      css-inline="inline"
      type="css" />
  </mj-head>
</mjml>`,
      post: `<mjml>
  <mj-head>
    <mj-include
      path="./test.css"
      css-inline="inline"
      type="css" />
    <mj-style inline="inline" > <%- include('/test.css') %> </mj-style>
  </mj-head>
</mjml>`,
    });
  });

  it('handles multiple includes on one line', () => {
    check({
      pre: `<mjml><mj-head><mj-include path="./test1.css" type="css" /><mj-include path="./test2.css" type="css" /></mj-head></mjml>`,
      post: `<mjml>
        <mj-head>
          <mj-include path="./test1.css" type="css" />
          <mj-include path="./test2.css" type="css" />
          <mj-style> <%- include('/test1.css') %> </mj-style>
          <mj-style> <%- include('/test2.css') %> </mj-style>
        </mj-head>
      </mjml>`,
    });
  });

  it('ignores non css type', () => {
    check({
      pre: `<mjml>
              <mj-head>
                <mj-include path="./test.css" />
              </mj-head>
            </mjml>`,
      post: `<mjml>
              <mj-head>
                <mj-include path="./test.css" />
              </mj-head>
            </mjml>`,
    });
  });

  it('respects inline tag', () => {
    check({
      pre: `<mjml>
  <mj-head>
    <mj-include path="./test.css" type="css" css-inline="inline" />
  </mj-head>
</mjml>`,
      post: `<mjml>
  <mj-head>
    <mj-include path="./test.css" type="css" css-inline="inline" />
    <mj-style inline="inline" > <%- include('/test.css') %> </mj-style>
  </mj-head>
</mjml>`,
    });
  });

  it('handles single quoted attributes', () => {
    check({
      pre: `<mjml>
  <mj-head>
    <mj-include path='./test.css' type='css' css-inline='inline' />
  </mj-head>
</mjml>`,
      post: `<mjml>
  <mj-head>
    <mj-include path='./test.css' type='css' css-inline='inline' />
    <mj-style inline="inline" > <%- include('/test.css') %> </mj-style>
  </mj-head>
</mjml>`,
    });
  });

  describe('errors', () => {
    it('malformed <mj-include>', () => {
      expect(() => {
        transformMjIncludeTags(`<mjml>
          <mj-head>
            <mj-include
              path="./test.css"
              type="css"
          </mj-head>
          </mjml>`);
      }).toThrow('Malformed <mj-include> tag');
    });

    it('missing <mjml> tag', () => {
      expect(() => {
        transformMjIncludeTags(`<mj-head>
          <mj-include
            path="./test.css"
            type="css" />
        </mj-head>`);
      }).toThrow('Missing <mjml> tag');
    });

    it('missing </mjml> tag', () => {
      expect(() => {
        transformMjIncludeTags(`<mjml>
          <mj-head>
            <mj-include
              path="./test.css"
              type="css" />
          </mj-head>`);
      }).toThrow('Missing </mjml> tag');
    });

    it('missing <mj-head> tag', () => {
      expect(() => {
        transformMjIncludeTags(`<mjml>
            <mj-include
              path="./test.css"
              type="css" />
          </mj-head>
        </mjml>`);
      }).toThrow('Missing <mj-head> tag');
    });

    it('missing </mj-head> tag', () => {
      expect(() => {
        transformMjIncludeTags(`<mjml>
            <mj-head>
              <mj-include
                path="./test.css"
                type="css" />
          </mjml>`);
      }).toThrow('Missing </mj-head> tag');
    });
  });
});
