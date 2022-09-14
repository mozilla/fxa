/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';

describe('index', () => {
  const origError = global.console.error;
  let mockError: jest.Mock;

  beforeEach(() => {
    jest.resetModules();

    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);
    mockError = jest.fn();
    global.console.error = mockError;
  });

  afterEach(() => {
    global.console.error = origError;
  });

  it('should render as expected', () => {
    jest.mock('./lib/config', () => ({
      __esModule: true,
      ...jest.requireActual('./lib/config'),
      readConfigFromMeta: jest.fn(),
    }));
    require('./index');

    const root = document.getElementById('root')!;
    // Assert that these mock components are nested as expected
    let currRoot: any = root;
    ['StrictMode', 'AppErrorBoundary', 'ApolloProvider', 'App'].forEach(
      (name) => {
        currRoot = currRoot?.querySelector(`*[data-testid="${name}"]`);
        expect(currRoot).toBeDefined();
      }
    );
  });

  it('should log initialization errors', () => {
    jest.mock('./lib/config', () => ({
      __esModule: true,
      ...jest.requireActual('./lib/config'),
      readConfigFromMeta: jest.fn(() => {
        throw new Error('uh oh');
      }),
    }));
    require('./index');

    expect(mockError).toHaveBeenCalled();
  });
});

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  StrictMode: mockComponent('StrictMode'),
}));

jest.mock('fxa-react/components/AppErrorBoundary', () => ({
  __esModule: true,
  default: mockComponent('AppErrorBoundary'),
}));

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  ApolloProvider: mockComponent('ApolloProvider'),
}));

jest.mock('./App', () => ({
  __esModule: true,
  default: mockComponent('App'),
}));

function mockComponent(testid: string) {
  return (props: { children: ReactNode }) => (
    <div data-testid={testid}>{props.children}</div>
  );
}
