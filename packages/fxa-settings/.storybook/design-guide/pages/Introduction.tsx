import React from 'react';
import Page from '../Page';
import LinkExternal from 'fxa-react/components/LinkExternal';
import Copiable from '../Copiable';
import Snippet from '../Snippet';

const Introduction = () => (
  <Page title="Introduction🎨">
    <div className="flex">
      <div className="max-w-3xl pr-6">
        <p className="mb-4">
          The Firefox Accounts design guide is designed to be a central place
          for engineers to reference convenience classes provided by{' '}
          <LinkExternal
            href="https://tailwindcss.com/"
            className="text-blue-500 underline"
          >
            Tailwind
          </LinkExternal>
          , a utility-first CSS framework used in FxA. Additionally, it offers
          the UX and Visual Design team a place to check how various styles
          translate to the web.{' '}
          <LinkExternal
            href="https://github.com/mozilla/fxa/tree/master/packages/fxa-settings"
            className="text-blue-500 underline"
          >
            See the FxA Settings README
          </LinkExternal>{' '}
          for more detailed information on Tailwind and styling components (plus
          other helpful Settings info).
        </p>
        <p className="mb-4">
          This guide is especially useful to have side-by-side with your code
          editor and browser for quick copy-and-paste class references.
        </p>
        <p className="mb-4">
          When working on user interfaces that must be styled with Tailwind
          classes, engineers must search through the{' '}
          <code>tailwind.out.css</code> file outputted from{' '}
          <code>tailwind.config.js</code> to grep for available CSS classes.
          While this guide doesn't <em>completely</em> mitigate the need to
          reference these files, it does alleviate much of the burden around
          finding the correct class name to use as well as some mental math
          involved, particularly in the "spacing" section.
        </p>
        <p className="mb-4">
          Tailwind styles are in units of <code>rem</code>, or "root ems", and
          FxA adopts the general standard of <code>1rem</code> equaling{' '}
          <code>16px</code>. As designs are given in units of <code>px</code>,
          this guide provides a quick reference for, as an example, an element
          requiring <code>40px</code> of padding — to calculate the{' '}
          <code>rem</code> value needed and then to find the class, an engineer
          would need to calculate <code>40px / 16px</code>, then grep the{' '}
          <code>tailwind.out.css</code> file for <code>2.5rem</code> to see the
          needed class is <code>p-10</code>. Instead, they can check out the
          "Spacing" page and similar conveniences are offered on other pages.
        </p>
        <p className="mb-4">
          If an additional feature in this guide would be useful while working
          with Tailwind styles in FxA, file a GitHub issue for it.
        </p>
      </div>
      <div className="max-w-lg">
        <div className="shadow-md border border-black border-opacity-25 rounded bg-white mb-4">
          <div className="p-3 bg-grey-50 text-sm font-bold rounded-t">
            <img src="copy-icon.svg" className="inline-block w-6 h-6 mr-1" />
            Pro tip: Copy code samples
          </div>
          <div className="p-3">
            Hover over{' '}
            <Copiable value="max-w-2xl">
              <Snippet>monospace text</Snippet>
            </Copiable>{' '}
            or color swatches to quickly copy Tailwind classes and other useful
            examples to your clipboard.
          </div>
        </div>
      </div>
    </div>
  </Page>
);

export default Introduction;
