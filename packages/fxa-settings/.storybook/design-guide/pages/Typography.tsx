import React, { useState } from 'react';
import Page from '../Page';
import Copiable from '../Copiable';

/**
 * Note: we have a handful of concatenated classes here, which PurgeCSS will not observe
 * In order to fix this we need to make the full classes visible so they get picked up:
 *
 * font-body font-header font-mono
 * font-normal font-bold
 * text-xs text-sm text-base text-lg text-xl text-xxl text-xxxl
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
                <code className="text-grey-500">{toggleToFontWeightClass}</code>
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
        {Object.keys(twFontSizes).map((fontSize) => (
          <tr className="flex mb-1">
            <td className="flex-1">
              <Copiable value={`text-${fontSize}`}>
                <code>{`text-${fontSize}`}</code>
              </Copiable>
            </td>
            <td className="flex-2">
              <code>{twFontSizes[fontSize]}</code> (
              <code>{parseInt(twFontSizes[fontSize]) / 16}rem</code>)
            </td>
            <td
              className={`text-${fontSize} font-${fontFamilyShortName} ${fontWeightClass} flex-7`}
            >
              The quick brown Firefox {hasBreak && <br />} jumps over the lazy
              dog. 🦊
            </td>
          </tr>
        ))}
      </table>
    );
  };

  return (
    <Page title="Typography">
      <p className="mt-2 mb-8 max-w-4xl">
        Because we use custom font-faces, we keep the number of font-weights low
        as they would need to pull in additional custom fonts.
      </p>
      <div>
        {Object.keys(twFontFamilies).map((fontFamilyShortName) => (
          <div className="mb-6 border border-grey-200 rounded-md shadow-md">
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

export default Typography;
