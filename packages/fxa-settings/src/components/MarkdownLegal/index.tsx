/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable jsx-a11y/heading-has-content */

import LinkExternal from 'fxa-react/components/LinkExternal';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

type MarkdownLegalProps = {
  markdown: string;
};

const commonHeadingClasses = 'font-header font-bold';
const commonListClasses = 'ltr:ml-5 rtl:mr-5 mb-5';

export const MarkdownLegal = ({ markdown }: MarkdownLegalProps) => (
  <ReactMarkdown
    children={markdown}
    // `rehypeRaw` allows HTML like `<i>whatever</i>` from MD to be rendered
    rehypePlugins={[rehypeRaw]}
    components={{
      h1: ({ node, ...props }) => (
        <h1 className={`${commonHeadingClasses} text-xl mb-4`} {...props} />
      ),
      h2: ({ node, ...props }) => (
        <h2 className={`${commonHeadingClasses} text-lg my-5`} {...props} />
      ),
      h3: ({ node, ...props }) => (
        <h3 className={`${commonHeadingClasses} my-5`} {...props} />
      ),
      h4: ({ node, ...props }) => (
        <h4 className={`${commonHeadingClasses} my-3 text-sm`} {...props} />
      ),
      p: ({ node, ...props }) => <p className="mb-5 text-sm" {...props} />,
      ol: ({ node, ...props }) => (
        <ol className={`${commonListClasses} list-decimal`} {...props} />
      ),
      ul: ({ node, ...props }) => (
        <ul
          className={`${commonListClasses} list-disc [&>ul]:list-circle`}
          {...props}
        />
      ),
      li: ({ node, ...props }) => <li className="text-sm" {...props} />,
      a: ({ node, children, ...props }) => {
        if (!props.href) {
          console.error('Bad link provided from the legal-docs repo');
          return <></>;
        }
        return (
          <LinkExternal
            className="link-blue"
            href={props.href}
            // not the best whitelist but all changes are reviewed in legal-docs repo
            rel={props.href.includes('.mozilla.org') ? 'author' : undefined}
          >
            {children}
          </LinkExternal>
        );
      },
    }}
  />
);

export default MarkdownLegal;
