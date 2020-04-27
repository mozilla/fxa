/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import AppErrorBoundary from ".";

describe("AppErrorBoundary", () => {
  beforeEach(() => {
    // HACK: Swallow the exception thrown by BadComponent
    // it bubbles up unnecesarily to jest and makes noise
    jest.spyOn(console, "error");
    (global.console.error as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    (global.console.error as jest.Mock).mockRestore();
  });

  it("renders children that do not cause exceptions", () => {
    const GoodComponent = () => <p data-testid="good-component">Hi</p>;

    const { queryByTestId } = render(
      <AppErrorBoundary>
        <GoodComponent />
      </AppErrorBoundary>
    );

    expect(queryByTestId("error-loading-app")).not.toBeInTheDocument();
  });

  it("renders a general error dialog on exception in child component", () => {
    const BadComponent = () => {
      throw new Error("bad");
    };

    const { queryByTestId } = render(
      <AppErrorBoundary>
        <BadComponent />
      </AppErrorBoundary>
    );

    expect(queryByTestId("error-loading-app")).toBeInTheDocument();
  });
});
