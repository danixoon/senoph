import { storiesOf } from "@storybook/react";
import React from "react";
import Link from ".";

storiesOf("Components/Text/Link", module)
  .add("simple-xs", () => <Link> Some xs text </Link>)
  .add("simple-sm", () => <Link size="sm"> Some sm text </Link>)
  .add("monospace-xs", () => <Link isMonospace> Some xs monospaced text </Link>)
  .add("monospace-sm", () => (
    <Link isMonospace size="sm">
      Some sm monospaced text
    </Link>
  ));
