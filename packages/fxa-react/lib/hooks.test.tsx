/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { useClickOutsideEffect, useBooleanState } from "./hooks";

describe("useBooleanStateResult", () => {
  const Subject = ({ initialState = false }: { initialState?: boolean }) => {
    const [state, setTrue, setFalse] = useBooleanState(initialState);
    return (
      <div>
        <div data-testid="result">{state ? "true" : "false"}</div>
        <button onClick={setTrue}>setTrue</button>
        <button onClick={setFalse}>setFalse</button>
      </div>
    );
  };

  it("updates state with callbacks as expected", () => {
    const { getByTestId, getByText } = render(<Subject />);
    expect(getByTestId("result")).toHaveTextContent("false");
    fireEvent.click(getByText("setTrue"));
    expect(getByTestId("result")).toHaveTextContent("true");
    fireEvent.click(getByText("setFalse"));
    expect(getByTestId("result")).toHaveTextContent("false");
  });

  it("accepts an initial value", () => {
    const { getByTestId } = render(<Subject initialState={true} />);
    expect(getByTestId("result")).toHaveTextContent("true");
  });
});

describe("useClickOutsideEffect", () => {
  type SubjectProps = {
    onDismiss: Function;
  };

  const Subject = ({ onDismiss }: SubjectProps) => {
    const dialogInsideRef = useClickOutsideEffect<HTMLDivElement>(onDismiss);
    return (
      <div>
        <div data-testid="outside">Outside</div>
        <div data-testid="inside" ref={dialogInsideRef}>
          Inside
        </div>
      </div>
    );
  };

  it("triggers onDismiss on a click outside", () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(<Subject onDismiss={onDismiss} />);
    const outside = getByTestId("outside");
    fireEvent.click(outside);
    expect(onDismiss).toBeCalled();
  });

  it("does not trigger onDismiss on a click inside", () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(<Subject onDismiss={onDismiss} />);
    const inside = getByTestId("inside");
    fireEvent.click(inside);
    expect(onDismiss).not.toBeCalled();
  });
});
