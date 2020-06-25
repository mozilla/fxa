import React from 'react';
import Page from '../Page';
import Copiable from '../Copiable';
import LinkExternal from 'fxa-react/components/LinkExternal';
import Snippet from '../Snippet';

/**
 * Note: we have a handful of concatenated classes here, which PurgeCSS will not observe
 * In order to fix this we need to make the full classes visible so they get picked up:
 *
 * max-w-mobileLandscape max-w-tablet max-w-desktop max-w-desktopXl
 * mobileLandscape:bg-green-400 tablet:bg-green-400 desktop:bg-green-400 desktopXl:bg-green-400
 * mobileLandscape:bg-white tablet:bg-white desktop:bg-white desktopXl:bg-white
 */

const descriptions = {
  mobileLandscape: 'Landscape-oriented mobile phones',
  tablet: 'Portrait-oriented tablets except for XL tablets*',
  desktop:
    'Portrait-oriented XL tablets*, all landscape-oriented tablets, and standard desktops',
  desktopXl: 'Large desktops',
};

const BreakpointExample = ({ size, screens }) => (
  <div
    className={`shadow-md mb-4 rounded border border-black border-opacity-25 max-w-${size}`}
  >
    <div
      className={`rounded-t bg-grey-100 text-grey-600 px-3 text-sm flex flex-col tablet:flex-row justify-between py-2 ${size}:bg-green-400`}
    >
      {typeof screens[size] === 'string' && (
        <span className="font-bold">(min-width: {screens[size]})</span>
      )}
      {typeof screens[size] === 'object' && screens[size].raw != null && (
        <span className="font-bold">{screens[size].raw}</span>
      )}

      <code className="tablet:px-1 rounded-sm">
        <Copiable value={`${size}:bg-green-400`}>
          <span
            className={`tablet:px-1 rounded-sm ${size}:bg-white ${size}:bg-opacity-75 ${size}:text-black`}
          >
            {size}:bg-green-400
          </span>
        </Copiable>
      </code>
    </div>
    <p className={`rounded-b bg-white p-3 border-t-0 max-w-${size}`}>
      <Copiable value={size}>
        <Snippet>{size}</Snippet>
      </Copiable>{' '}
      {descriptions[size]}
    </p>
  </div>
);

const Breakpoints = ({ config }) => {
  const screens = config.theme.screens;

  return (
    <Page title="Breakpoints">
      <div className="max-w-4xl mb-8">
        <p className="mb-4">
          We have a standard set of breakpoints based on our most common
          demographic's resolutions. Resize your window to see when each
          breakpoint becomes active. Refer to this{' '}
          <LinkExternal
            href="https://bit.ly/fxa-breakpoints"
            className="text-blue-500 underline"
          >
            Google doc
          </LinkExternal>{' '}
          to learn more.
        </p>

        <p>
          To invoke a style at specific breakpoint you will write the class
          prefixed with the desired breakpoint name. e.g.{' '}
          <Copiable value="breakpointName:className">
            <Snippet>breakpointName:className</Snippet>
          </Copiable>
          . Note that because our breakpoints generally all operate as min-width
          media queries, once a class is active at a specified breakpoint's
          minimum window width it will continue to be active across other larger
          breakpoints unless overridden. Similarly,{' '}
          <span className="font-bold">
            a class applied without a breakpoint prefix will be active across
            all breakpoints, including portrait-oriented mobile phones,
          </span>{' '}
          unless overridden.
        </p>
      </div>

      {Object.keys(screens).map((size) => (
        <BreakpointExample {...{ size, screens }} />
      ))}

      <p>
        <small>
          *"XL tablets" refer to those with a width of <code>1024px</code> or
          higher. As of June 2020, this only affects the iPad Pro 12.9.
        </small>
      </p>

      <p className="py-4 max-w-4xl">All together now:</p>

      {/* NOTE: this section is not dynamic */}
      <div
        className={`shadow-md mb-4 rounded border border-black border-opacity-25 p-3 w-full text-white bg-yellow-700 mobileLandscape:bg-green-800 tablet:bg-violet-600 desktop:bg-blue-800 desktopXl:bg-red-700 overflow-scroll whitespace-no-wrap`}
      >
        <Copiable value="bg-yellow-700 mobileLandscape:bg-green-800 tablet:bg-violet-600 desktop:bg-blue-800 desktopXl:bg-red-700">
          <code className="px-2 py-1 rounded-sm bg-white bg-opacity-75 text-black mobileLandscape:bg-transparent mobileLandscape:text-white">
            bg-yellow-700
          </code>{' '}
          <code className="px-2 py-1 rounded-sm mobileLandscape:bg-white mobileLandscape:text-black mobileLandscape:bg-opacity-75 tablet:bg-transparent tablet:text-white bg-opacity-75">
            mobileLandscape:bg-green-800
          </code>{' '}
          <code className="px-2 py-1 rounded-sm tablet:bg-white tablet:text-black tablet:bg-opacity-75 desktop:bg-transparent desktop:text-white bg-opacity-75">
            tablet:bg-violet-600
          </code>{' '}
          <code className="px-2 py-1 rounded-sm desktop:bg-white desktop:text-black desktop:bg-opacity-75 desktopXl:bg-transparent desktopXl:text-white">
            desktop:bg-blue-800
          </code>{' '}
          <code className="px-2 py-1 rounded-sm desktopXl:bg-white desktopXl:text-black desktopXl:bg-opacity-75">
            desktopXl:bg-red-700
          </code>
        </Copiable>
      </div>
    </Page>
  );
};

export default Breakpoints;
