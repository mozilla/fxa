import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { config } from '../../lib/config';
import {
  AppContext,
  defaultAppContext,
} from '../../lib/AppContext';

import AppLayout, { SignInLayout, SettingsLayout } from './index';

afterEach(cleanup);

describe('AppLayout', () => {

  const subject = () => {
    const appContextValue = {
      ...defaultAppContext,
      config: {
        ...config,
        legalDocLinks: {
          privacyNotice: 'https://example.me/privacy',
          termsOfService: 'https://example.me/terms',
        }
      }
    };

    return render(
      <AppContext.Provider value={appContextValue}>
        <AppLayout>
          <div data-testid="children">Testing</div>
        </AppLayout>
      </AppContext.Provider>
    )
  };

  const { queryByTestId, getByText } = subject();

  it ('renders as expected', () => {
    for (const id of ['legal-footer', 'about-moz-footer']) {
      expect(queryByTestId(id)).toBeInTheDocument();
    }

    const tosLink = getByText('Terms of Service');
    expect(tosLink).toHaveAttribute('href', 'https://example.me/terms');
    const privacyLink = getByText('Privacy Notice');
    expect(privacyLink).toHaveAttribute('href', 'https://example.me/privacy');
  })
});

describe('SignInLayout', () => {
  const subject = () =>
    render(
      <SignInLayout>
        <div data-testid="children">Testing</div>
      </SignInLayout>
    );

  it('renders as expected', () => {
    const { queryByTestId } = subject();
    for (const id of ['stage', 'children']) {
      expect(queryByTestId(id)).toBeInTheDocument();
    }
  });
});

describe('SettingsLayout', () => {
  const CONTENT_URL = 'https://accounts.example.com';

  const subject = () => {
    const appContextValue = {
      ...defaultAppContext,
      config: {
        ...config,
        servers: {
          ...config.servers,
          content: {
            url: CONTENT_URL
          }
        }
      }
    };

    return render(
      <AppContext.Provider value={appContextValue}>
        <SettingsLayout>
          <div data-testid="children">Testing</div>
        </SettingsLayout>
      </AppContext.Provider>
    )
  };

  it('renders as expected', () => {
    const { queryByTestId, getByText } = subject();
    for (const id of ['stage', 'breadcrumbs', 'children']) {
      expect(queryByTestId(id)).toBeInTheDocument();
    }

    const homeLink = getByText('Account Home');
    expect(homeLink).toHaveAttribute('href', `${CONTENT_URL}/settings`);
    expect(document.body).toHaveClass('settings');
  });
});
