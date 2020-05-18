import React from "react";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import Survey, { CreateHandleIframeTask } from "./index";

const surveyURL = "https://my-survey-url.mozilla.org/";

afterEach(cleanup);

describe("Survey", () => {
  it("renders as expected", () => {
    const subject = () => {
      return render(<Survey {...{ surveyURL }} />);
    };

    const { queryByTestId } = subject();

    const surveyContainer = queryByTestId("survey-component");
    expect(surveyContainer).toBeVisible();
  });

  it("hides iframe and renders survey complete message", () => {
    const subject = () => {
      return render(<Survey {...{ surveyURL }} surveyComplete />);
    };

    const { queryByTestId } = subject();

    const surveyIframe = queryByTestId("survey-iframe");
    expect(surveyIframe).toBeNull();

    const surveyCompleteMsg = queryByTestId("survey-complete-msg");
    expect(surveyCompleteMsg).toBeVisible();
  });

  it("creates the iframe message handler correctly with default survey completion message", () => {
    const stub = jest.fn();
    const handleIframeTask = CreateHandleIframeTask(stub);

    handleIframeTask(new MessageEvent("noop", {}));
    expect(stub).not.toBeCalled();

    handleIframeTask(new MessageEvent("correct", { data: "survey complete" }));
    expect(stub).toBeCalled();
  });

  it("creates the iframe message handler correctly with custom survey completion message", () => {
    const stub = jest.fn();
    const handleIframeTask = CreateHandleIframeTask(stub, "it is done!");

    handleIframeTask(new MessageEvent("noop", {}));
    expect(stub).not.toBeCalled();

    handleIframeTask(new MessageEvent("correct", { data: "it is done!" }));
    expect(stub).toBeCalled();
  });
});
