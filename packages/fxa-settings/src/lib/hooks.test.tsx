/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import * as apolloClient from '@apollo/client';

import {
  useFocusOnTriggeringElementOnClose,
  useEscKeydownEffect,
  useChangeFocusEffect,
  useHandledMutation,
} from './hooks';

describe('useFocusOnTriggeringElementOnClose', () => {
  const Subject = ({
    revealed,
    triggerException,
  }: {
    revealed?: boolean;
    triggerException?: boolean | undefined;
  }) => {
    const triggerElement = useRef<HTMLButtonElement>(null);
    useFocusOnTriggeringElementOnClose(
      revealed,
      triggerElement,
      triggerException
    );

    return (
      <button ref={triggerElement} data-testid="trigger-element">
        Hi
      </button>
    );
  };

  it('changes focus as expected', () => {
    const { rerender, getByTestId } = render(<Subject revealed />);
    rerender(<Subject revealed={false} />);

    expect(document.activeElement).toBe(getByTestId('trigger-element'));
  });

  it('does nothing if `revealed` is not passed in', () => {
    const { rerender, getByTestId } = render(<Subject />);
    rerender(<Subject />);

    expect(document.activeElement).not.toBe(getByTestId('trigger-element'));
  });

  it('does nothing if `triggerException` is truthy', () => {
    const { rerender, getByTestId } = render(<Subject triggerException />);
    rerender(<Subject />);

    expect(document.activeElement).not.toBe(getByTestId('trigger-element'));
  });
});

describe('useEscKeydownEffect', () => {
  const onEscKeydown = jest.fn();
  const Subject = () => {
    useEscKeydownEffect(onEscKeydown);
    return <div>Hi mom</div>;
  };
  it('calls onEscKeydown on esc key press', () => {
    render(<Subject />);
    expect(onEscKeydown).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onEscKeydown).toHaveBeenCalled();
  });
});

describe('useChangeFocusEffect', () => {
  const Subject = () => {
    const elToFocusRef = useChangeFocusEffect();
    return (
      <div>
        <a href="#">some other focusable thing</a>
        <div ref={elToFocusRef} tabIndex={0} data-testid="el-to-focus" />
      </div>
    );
  };

  it('changes focus as expected', () => {
    render(<Subject />);
    expect(document.activeElement).toBe(screen.getByTestId('el-to-focus'));
  });
});

describe('useHandledMutation', () => {
  const query = {
    kind: 'Document',
    definitions: [],
  } as apolloClient.DocumentNode;

  beforeEach(() => {
    Object.defineProperty(apolloClient, 'useMutation', {
      value: jest.fn(),
    });
  });

  it('calls useMutation with the correct default params', () => {
    useHandledMutation(query);

    expect(apolloClient.useMutation).toHaveBeenCalledWith(query, {
      onError: expect.any(Function),
    });
  });

  it('calls useMutation with additional params', () => {
    useHandledMutation(query, { fetchPolicy: 'no-cache' });

    expect(apolloClient.useMutation).toHaveBeenCalledWith(query, {
      onError: expect.any(Function),
      fetchPolicy: 'no-cache',
    });
  });
});
