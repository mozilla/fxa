import React from "react";
import { storiesOf } from "@storybook/react";
import AppErrorDialog from "./index";

storiesOf("components/AppErrorDialog", module).add("basic", () => (
  <AppErrorDialog error={new Error("Uh oh!")} />
));
