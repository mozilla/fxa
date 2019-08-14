import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Portal from './Portal';

afterEach(cleanup);

it('renders children in a new element outside original DOM parent', () => {
  const { debug, container, getByTestId } = render(
    <div data-testid="portal-parent">
      <Portal id="foo">
        <div data-testid="children">Hi mom</div>
      </Portal>
    </div>
  );
  const childrenEl = getByTestId('children');
  expect(getByTestId('portal-parent')).not.toContainElement(childrenEl);
  const containerParent = container.parentNode as ParentNode;
  expect(containerParent.querySelector('#foo')).toContainElement(childrenEl);
});

it('renders multiple instances with the same ID to the same DOM parent', () => {
  const { debug, container, getByTestId } = render(
    <div data-testid="portal-parent">
      <Portal id="foo">
        <div data-testid="p1">Hi mom</div>
      </Portal>
      <Portal id="foo">
        <div data-testid="p2">Hi dad</div>
      </Portal>
      <Portal id="bar">
        <div data-testid="p3">Hooray</div>
      </Portal>
    </div>
  );

  const containerParent = container.parentNode as ParentNode;
  const portals = containerParent.querySelectorAll('.portal');
  expect(portals.length).toEqual(2);

  const fooPortal = containerParent.querySelector('#foo');
  expect(fooPortal).toContainElement(getByTestId('p1'));
  expect(fooPortal).toContainElement(getByTestId('p2'));
  expect(fooPortal).not.toContainElement(getByTestId('p3'));
});
