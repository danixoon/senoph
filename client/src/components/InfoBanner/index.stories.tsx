import { storiesOf } from "@storybook/react";
import React from "react";
import InfoBanner from ".";

storiesOf("Components/Text/Link", module).add("simple-xs", () => (
  <InfoBanner text="" href="" hrefContent="">
    Some xs text
  </InfoBanner>
));
