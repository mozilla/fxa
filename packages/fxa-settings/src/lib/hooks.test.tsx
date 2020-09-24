/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import * as apolloClient from '@apollo/client';

import { AlertBarRootAndContextProvider } from './AlertBarContext';
import AlertBar, { typeClasses } from '../components/AlertBar';
import {
  useFocusOnTriggeringElementOnClose,
  useEscKeydownEffect,
  useChangeFocusEffect,
  useMutation,
  useAlertBar,
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
    useMutation(query);

    expect(apolloClient.useMutation).toHaveBeenCalledWith(query, {
      onError: expect.any(Function),
    });
  });

  it('calls useMutation with additional params', () => {
    useMutation(query, { fetchPolicy: 'no-cache' });

    expect(apolloClient.useMutation).toHaveBeenCalledWith(query, {
      onError: expect.any(Function),
      fetchPolicy: 'no-cache',
    });
  });
});

describe('useAlertBar', () => {
  let alertBar: any;

  const TestAlertBar = () => {
    alertBar = useAlertBar();

    return (
      <AlertBarRootAndContextProvider>
        {alertBar.visible && (
          <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
            {alertBar.content}
          </AlertBar>
        )}
      </AlertBarRootAndContextProvider>
    );
  };

  beforeEach(() => {
    render(<TestAlertBar />);
  });

  it('defaults to hidden, can show and hide again', () => {
    expect(screen.queryByTestId('alert-bar')).not.toBeInTheDocument();

    act(alertBar.show);
    expect(screen.queryByTestId('alert-bar')).toBeInTheDocument();

    act(alertBar.hide);
    expect(screen.queryByTestId('alert-bar')).not.toBeInTheDocument();

    act(alertBar.show);
    act(() => {
      fireEvent.click(screen.getByTestId('alert-bar-dismiss'));
    });
    expect(alertBar.visible).toBeFalsy();
  });

  test('success method works', () => {
    const phrase = 'You did it, kid';
    act(() => {
      alertBar.success(phrase);
    });

    const alertBarInner = screen.getByTestId('alert-bar-inner');
    expect(alertBarInner.getAttribute('class')).toContain(typeClasses.success);
    expect(alertBarInner).toHaveTextContent(phrase);
    expect(alertBar.type).toEqual('success');
  });

  test('error method works', () => {
    const phrase = 'Better luck next time';
    act(() => {
      alertBar.error(phrase);
    });

    const alertBarInner = screen.getByTestId('alert-bar-inner');
    expect(alertBarInner.getAttribute('class')).toContain(typeClasses.error);
    expect(alertBarInner).toHaveTextContent(phrase);
    expect(alertBar.type).toEqual('error');
  });

  test('info method works', () => {
    const phrase = 'Howdy, partner';
    act(() => {
      alertBar.info(phrase);
    });

    const alertBarInner = screen.getByTestId('alert-bar-inner');
    expect(alertBarInner.getAttribute('class')).toContain(typeClasses.info);
    expect(alertBarInner).toHaveTextContent(phrase);
    expect(alertBar.type).toEqual('info');
  });
});
