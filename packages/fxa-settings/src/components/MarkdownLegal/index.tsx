/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable jsx-a11y/heading-has-content */

import React, { ComponentProps, ReactNode } from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

type MarkdownLegalProps = {
  markdown: string;
};

type MdComponentProps<T extends keyof React.JSX.IntrinsicElements> =
  ComponentProps<T> & { node?: unknown };

const commonHeadingClasses = 'font-header font-bold';
const commonListClasses = 'ltr:ml-5 rtl:mr-5 mb-5';

export const MarkdownLegal = ({ markdown }: MarkdownLegalProps) => (
  <ReactMarkdown
    children={markdown}
    // `rehypeRaw` allows HTML like `<i>whatever</i>` from MD to be rendered
    rehypePlugins={[rehypeRaw]}
    components={{
      h1: ({ node, ...props }: MdComponentProps<'h1'>) => (
        <h1 className={`${commonHeadingClasses} text-xl mb-4`} {...props} />
      ),
      h2: ({ node, ...props }: MdComponentProps<'h2'>) => (
        <h2 className={`${commonHeadingClasses} text-lg my-5`} {...props} />
      ),
      h3: ({ node, ...props }: MdComponentProps<'h3'>) => (
        <h3 className={`${commonHeadingClasses} my-5`} {...props} />
      ),
      h4: ({ node, ...props }: MdComponentProps<'h4'>) => (
        <h4 className={`${commonHeadingClasses} my-3 text-sm`} {...props} />
      ),
      p: ({ node, ...props }: MdComponentProps<'p'>) => (
        <p className="mb-5 text-sm" {...props} />
      ),
      ol: ({ node, ...props }: MdComponentProps<'ol'>) => (
        <ol className={`${commonListClasses} list-decimal`} {...props} />
      ),
      ul: ({ node, ...props }: MdComponentProps<'ul'>) => (
        <ul
          className={`${commonListClasses} list-disc [&>ul]:list-circle`}
          {...props}
        />
      ),
      li: ({ node, ...props }: MdComponentProps<'li'>) => (
        <li className="text-sm" {...props} />
      ),
      a: ({
        node,
        children,
        ...props
      }: MdComponentProps<'a'> & { children?: ReactNode }) => {
        if (!props.href) {
          console.error('Bad link provided from the legal-docs repo');
          return <></>;
        }
        return (
          <LinkExternal
            className="link-blue"
            href={props.href}
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
