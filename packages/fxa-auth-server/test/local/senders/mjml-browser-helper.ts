import { assert } from 'chai';
import { transformMjIncludeTags } from '../../../lib/senders/emails/mjml-browser-helper';

describe('converts <mj-include> to <mj-style> tag', () => {
  function compact(mjml: string) {
    // New lines and white space should have no effect
    return mjml.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
  }

  function test(testCase: { pre: string; post: string }) {
    assert.equal(
      compact(transformMjIncludeTags(testCase.pre)),
      compact(testCase.post)
    );
  }

  it('converts mj-include in head', () => {
    test({
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
    test({
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
    test({
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
    test({
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

  it('ignores non css type', () => {
    test({
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
    test({
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
    test({
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
      assert.throws(() => {
        transformMjIncludeTags(`<mjml>
          <mj-head>
            <mj-include
              path="./test.css"
              type="css"
          </mj-head>
          </mjml>`);
      }, 'Malformed <mj-include> tag');
    });

    it('missing <mjml> tag', () => {
      assert.throws(() => {
        transformMjIncludeTags(`<mj-head>
          <mj-include
            path="./test.css"
            type="css" />
        </mj-head>`);
      }, 'Missing <mjml> tag');
    });

    it('missing </mjml> tag', () => {
      assert.throws(() => {
        transformMjIncludeTags(`<mjml>
          <mj-head>
            <mj-include
              path="./test.css"
              type="css" />
          </mj-head>`);
      }, 'Missing </mjml> tag');
    });

    it('missing <mj-head> tag', () => {
      assert.throws(() => {
        transformMjIncludeTags(`<mjml>
            <mj-include
              path="./test.css"
              type="css" />
          </mj-head>
        </mjml>`);
      }, 'Missing <mj-head> tag');
    });
    it('missing </mj-head> tag', () => {
      assert.throws(() => {
        transformMjIncludeTags(`<mjml>
            <mj-head>
              <mj-include
                path="./test.css"
                type="css" />
          </mjml>`);
      }, 'Missing </mj-head> tag');
    });
  });
});
