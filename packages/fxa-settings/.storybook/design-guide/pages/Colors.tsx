/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Copiable from '../Copiable';
import Page from '../Page';
import Snippet from '../Snippet';

const Swatch = ({
  color,
  hex,
  shade,
}: {
  color: string;
  hex: string;
  shade?: string;
}) => {
  let copyValue = `bg-${color}`;
  if (shade) {
    copyValue += `-${shade}`;
  }

  return (
    <div className="w-32 text-center mr-2 shadow-md rounded border border-black/25 bg-white">
      <div className="p-2">
        {shade && (
          <Copiable value={copyValue}>
            <span className="block pb-1 text-base font-bold">{shade}</span>
          </Copiable>
        )}
        <Copiable value={shade ? hex : copyValue}>
          <span className="block text-xs">{hex.toUpperCase()}</span>
        </Copiable>
      </div>
      <span
        className="block rounded-b w-full h-6 border-t border-black/25"
        style={{ backgroundColor: hex }}
      />
    </div>
  );
};

const Colors = ({ config }) => {
  const twColors = config.theme.colors;
  // don't bother swatching transparent
  delete twColors.transparent;

  return (
    <Page title="Colors">
      <p className="pb-3 max-w-4xl">
        We use a color palette based on Mozilla Protocol's colors, with subtle
        modifications to suit our needs. Refer to the{' '}
        <a
          href="https://bit.ly/fxa-settings-colors"
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 underline"
        >
          Figma doc
        </a>{' '}
        to learn more.
      </p>
      <p className="pb-6 max-w-4xl">
        Color classes can be derived by combining the property (such as{' '}
        <Snippet>bg</Snippet> for background or <Snippet>text</Snippet> for text
        color) with the name of the color and optionally the shade. Some
        examples:
      </p>
      <div className="leading-6 flex flex-wrap shadow-md border border-black/25 rounded max-w-2xl p-3 pt-1 mb-8 bg-white gap-3">
        <Copiable value="bg-blue-100">
          <code className="mt-2 inline-block rounded-sm px-1 bg-blue-100 text-sm mr-2">
            bg-blue-100
          </code>
        </Copiable>
        <Copiable value="tablet:focus:bg-violet-300">
          <code className="mt-2 inline-block text-sm mr-2">
            <a
              href="#top"
              className="px-1 inline-block tablet:focus:bg-violet-300 rounded-sm"
              target="_self"
            >
              tablet:focus:bg-violet-300
            </a>
          </code>
        </Copiable>
        <Copiable value="text-green-800">
          <code className="mt-2 inline-block text-green-800 text-sm rounded-sm mr-2">
            text-green-800
          </code>
        </Copiable>
        <Copiable value="bg-black">
          <code className="mt-2 inline-block rounded-sm px-1 bg-black text-sm mr-2 text-white">
            bg-black
          </code>
        </Copiable>
        <Copiable value="border-red-400">
          <code className="mt-2 inline-block text-sm border rounded-sm px-1 border-red-400 mr-2">
            border-red-400
          </code>
        </Copiable>
        <Copiable value="hover:text-pink-500">
          <code className="mt-2 inline-block text-sm rounded-sm mr-2 hover:text-pink-500">
            hover:text-pink-500
          </code>
        </Copiable>
        <Copiable value="desktopXl:text-orange-700">
          <code className="mt-2 inline-block text-sm rounded-sm mr-2 desktopXl:text-orange-700">
            desktopXl:text-orange-700
          </code>
        </Copiable>
      </div>
      {Object.keys(twColors).map((name) => (
        <div
          className="mb-6 flex flex-column gap-2 items-end flex-wrap"
          key={name}
        >
          <h2 className="pr-5 font-bold w-full">
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </h2>
          {typeof twColors[name] === 'string' ? (
            <Swatch color={name} hex={twColors[name]} />
          ) : (
            Object.keys(twColors[name]).map((shade) => (
              <Swatch
                {...{ color: name, hex: twColors[name][shade], shade }}
                key={shade}
              />
            ))
          )}
        </div>
      ))}
    </Page>
  );
};

const colors = (config) => Colors(config);
export default colors;
