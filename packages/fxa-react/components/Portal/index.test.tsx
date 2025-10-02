/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Portal from './index';

it('renders children in a new element outside original DOM parent', () => {
  const { container } = render(
    <div data-testid="portal-parent">
      <Portal id="foo">
        <div data-testid="children">Hi mom</div>
      </Portal>
    </div>
  );
  const childrenEl = screen.getByTestId('children');
  expect(screen.getByTestId('portal-parent')).not.toContainElement(childrenEl);
  const containerParent = container.parentNode as ParentNode;
  expect(containerParent.querySelector('#foo')).toContainElement(childrenEl);
});

it('renders multiple instances with the same ID to the same DOM parent', () => {
  const { container } = render(
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
  expect(fooPortal).toContainElement(screen.getByTestId('p1'));
  expect(fooPortal).toContainElement(screen.getByTestId('p2'));
  expect(fooPortal).not.toContainElement(screen.getByTestId('p3'));
});

it('applies a11y improvements when id is set to "modal"', () => {
  document.body.innerHTML = `
    <div data-testid="root"></div>
    <div data-testid="adjacent-to-root"></div>
  `;

  const headerId = 'some-header-id';
  const descId = 'some-desc-id';

  render(
    <Portal id="modal">
      <div id={headerId}>Message for mom</div>
      <p id={descId}>Hi mom</p>
    </Portal>
  );

  const body = document.body;
  const root = screen.getByTestId('root');
  const adjacentToRoot = screen.getByTestId('adjacent-to-root');
  const modal = body.querySelector('#modal');

  expect(body.classList).toContain('overflow-hidden');

  expect(root).toHaveAttribute('aria-hidden', 'true');
  expect(adjacentToRoot).toHaveAttribute('aria-hidden', 'true');

  expect(root.classList).toContain('pointer-events-none');
  expect(adjacentToRoot.classList).toContain('pointer-events-none');

  expect(modal).not.toHaveAttribute('aria-hidden', 'true');
});
