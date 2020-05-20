import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Portal from './index';

afterEach(cleanup);

it('renders children in a new element outside original DOM parent', () => {
  const { container, getByTestId } = render(
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
  expect(containerParent.querySelector('#foo')).toHaveAttribute(
    'role',
    'dialog'
  );
});

it('renders multiple instances with the same ID to the same DOM parent', () => {
  const { container, getByTestId } = render(
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

it('applies a11y improvements when id is set to "modal"', () => {
  document.body.innerHTML = `
    <div data-testid="root"></div>
    <div data-testid="adjacent-to-root"></div>
  `;

  const headerId = 'some-header-id';
  const descId = 'some-desc-id';

  const { getByTestId } = render(
    <Portal id="modal" {...{ headerId, descId }}>
      <div>Hi mom</div>
    </Portal>
  );

  const body = document.body;
  const root = getByTestId('root');
  const adjacentToRoot = getByTestId('adjacent-to-root');
  const modal = body.querySelector('#modal');

  expect(body.classList).toContain('overflow-hidden');

  expect(root).toHaveAttribute('aria-hidden', 'true');
  expect(adjacentToRoot).toHaveAttribute('aria-hidden', 'true');

  expect(root.classList).toContain('pointer-events-none');
  expect(adjacentToRoot.classList).toContain('pointer-events-none');

  expect(modal).not.toHaveAttribute('aria-hidden', 'true');
  expect(modal).toHaveAttribute('aria-labelledby', headerId);
  expect(modal).toHaveAttribute('aria-describedby', descId);
});
