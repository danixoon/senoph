import { storiesOf } from "@storybook/react";
import Badge from "components/Badge";
import React, { useRef } from "react";
import Popup from ".";
import Layout from "components/Layout";
import Label from "components/Label";
import PopupLayer from "providers/PopupLayer";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import PopupLayerProvider from "providers/PopupLayerProvider";

storiesOf("Components/Popups/Notice", module).add("popup-sm", () => {
  const [isOpen, setOpen] = React.useState(() => false);
  const togglePopup = () => setOpen(!isOpen);
  return <></>;
});
