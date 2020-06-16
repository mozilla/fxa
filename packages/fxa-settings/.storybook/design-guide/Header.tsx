import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';

const Header = () => {
  return (
    <div className="bg-grey-50 flex items-center justify-between sticky z-20 top-0 pt-8  pb-5 border-b border-grey-400 border-opacity-25 px-2 -ml-2 -mr-2">
      <div className="flex items-center">
        <img src="logo.svg" className="mr-3" />
        <h1 className="text-xl font-bold text-grey-600">Design Guide</h1>
      </div>
      <div>
        <LinkExternal
          href="https://github.com/mozilla/fxa"
          className="opacity-75 hover:opacity-100 focus:opacity-100"
        >
          <img src="github-icon.svg" className="w-8 h-8" />
        </LinkExternal>
      </div>
    </div>
  );
};

export default Header;
