import React, { useContext } from 'react';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { defaultAppContext, AppContext, AppContextType } from './AppContext';
import { renderWithLocalizationProvider } from './test-utils';

afterEach(cleanup);

const MOCK_LANG = 'xx-pirate';

it('passes along given app-global props', () => {
  const Subject = () => {
    const { config, accessToken, getScreenInfo } = useContext(AppContext);
    return (
      <div>
        <span data-testid="lang">{config.lang}</span>
        <span data-testid="screeninfo">{'' + getScreenInfo().clientWidth}</span>
        <span data-testid="accesstoken">{accessToken}</span>
      </div>
    );
  };

  const appContextValue: AppContextType = {
    ...defaultAppContext,
    config: {
      ...defaultAppContext.config,
      lang: MOCK_LANG,
    },
    accessToken: 'lettherightonein',
  };

  const { getByTestId } = renderWithLocalizationProvider(
    <AppContext.Provider value={appContextValue}>
      <Subject />
    </AppContext.Provider>
  );

  expect(getByTestId('lang')).toHaveTextContent(MOCK_LANG);
  expect(getByTestId('screeninfo')).toHaveTextContent('undefined');
  expect(getByTestId('accesstoken')).toHaveTextContent('lettherightonein');
});
