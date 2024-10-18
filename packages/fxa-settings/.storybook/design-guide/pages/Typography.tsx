import React, { useState } from 'react';
import Page from '../Page';
import Copiable from '../Copiable';
import LinkExternal from 'fxa-react/components/LinkExternal';

/**
 * Note: we have a handful of concatenated classes here, which PurgeCSS will not observe
 * In order to fix this we need to make the full classes visible so they get picked up:
 *
 * font-body font-header font-mono
 * font-normal font-bold
 * text-xs text-sm text-base text-lg text-xl
 */

export const Typography = ({ config }) => {
  const twFontFamilies = config.theme.fontFamily;
  const twFontSizes = config.theme.fontSize;

  const FontSizeTable = ({
    fontFamilyShortName,
  }: {
    fontFamilyShortName: String;
  }) => {
    const [isBold, setBold] = useState(false);
    const toggleIsBold = () => setBold(!isBold);
    const [hasBreak, setBreak] = useState(false);
    const toggleHasBreak = () => setBreak(!hasBreak);

    const fontWeightClass = isBold ? 'font-bold' : 'font-normal';
    const toggleToFontWeightClass = isBold ? 'font-normal' : 'font-bold';

    return (
      <table className="flex flex-col">
        <thead>
          <tr className="flex mb-2">
            <th className="flex-1 text-left">class</th>
            <th className="flex-2 text-left">value</th>
            <th className="flex-7 text-left flex">
              <div className="flex-1">
                preview
                <span className="font-normal">
                  {' '}
                  with{' '}
                  <Copiable value={fontWeightClass}>
                    <code className="text-purple-700 font-normal">
                      {fontWeightClass}
                    </code>
                  </Copiable>
                </span>
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={toggleIsBold}
                  className="border border-grey-200 rounded-md px-2 py-1 shadow-sm text-xs font-normal hover:bg-grey-50"
                >
                  click to apply{' '}
                  <code className="text-grey-500">
                    {toggleToFontWeightClass}
                  </code>
                </button>
                <button
                  onClick={toggleHasBreak}
                  className="border border-grey-200 rounded-md px-2 py-1 shadow-sm text-xs font-normal ml-2 hover:bg-grey-50"
                >
                  click to {hasBreak ? 'remove' : 'add'}{' '}
                  <code className="text-grey-500">{'<br />'}</code>
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(twFontSizes).map((fontSize) => (
            <tr className="flex mb-1" key={fontSize}>
              <td className="flex-1">
                <Copiable value={`text-${fontSize}`}>
                  <code>{`text-${fontSize}`}</code>
                </Copiable>
              </td>
              <td className="flex-2">
                <code>{twFontSizes[fontSize]}</code> (
                <code>{parseFloat(twFontSizes[fontSize]) * 16}px</code>)
              </td>
              <td
                className={`text-${fontSize} font-${fontFamilyShortName} ${fontWeightClass} flex-7`}
              >
                The quick brown Firefox {hasBreak && <br />} jumps over the lazy
                dog. 🦊
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <Page title="Typography">
      <p className="my-2 max-w-4xl">
        When we redesigned Settings in 2019, we used <b>Metropolis</b> as our
        header font and <b>Inter</b> as our body font. These were removed in
        early 2024 since they are deprecated, see{' '}
        <LinkExternal
          href="https://mozilla-hub.atlassian.net/browse/FXA-9058"
          className="underline link-blue"
        >
          FXA-9058
        </LinkExternal>{' '}
        for more details. We are currently using <b>system fonts</b> for header
        and body copy, see{' '}
        <LinkExternal
          href="https://github.com/mozilla/fxa/blob/main/packages/fxa-react/configs/tailwind.js"
          className="underline link-blue"
        >
          the Tailwind config file
        </LinkExternal>{' '}
        "fontFamily" section to see fallbacks.
      </p>
      <p className="mt-2 mb-8 max-w-4xl">
        If we introduce custom font-faces in the future, we should keep the
        number of font-weights low as they otherwise would need to pull in
        additional custom fonts.
      </p>
      <div>
        {Object.keys(twFontFamilies).map((fontFamilyShortName) => (
          <div
            className="mb-6 border border-grey-200 rounded-md shadow-md"
            key={fontFamilyShortName}
          >
            <div className="bg-purple-700 rounded-t-sm p-2 flex justify-between">
              <Copiable value={`font-${fontFamilyShortName}`}>
                <code className="text-white flex-1">
                  {`font-${fontFamilyShortName}`}
                </code>
              </Copiable>
              <p className="text-grey-100 flex-2 text-right">
                <b>{twFontFamilies[fontFamilyShortName][0]}</b> is typically
                applied to <b>{fontFamilyShortName}</b> copy.
              </p>
            </div>
            <div className="rounded-b-md p-3 bg-white">
              <FontSizeTable {...{ fontFamilyShortName }} />
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
};

const typography = (config) => Typography(config);
export default typography;
