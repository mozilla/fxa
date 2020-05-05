import React from "react";
import { storiesOf } from "@storybook/react";
import LinkExternal from "./index";

storiesOf("components/LinkExternal", module).add("basic", () => (
  <LinkExternal href="https://mozilla.org">
    Keep the internet open and accessible to all.
  </LinkExternal>
));
