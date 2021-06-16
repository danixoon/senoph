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

storiesOf("Components/Popups/Popup", module).add("popup-sm", () => {
  const [isOpen, setOpen] = React.useState(() => false);
  const togglePopup = () => setOpen(!isOpen);
  return (
    <>
      <PopupLayerProvider>
        <Button onClick={togglePopup}> Попапик </Button>
        <PopupLayer>
          <Popup isOpen={isOpen} onToggle={setOpen}>
            <Layout
              style={{
                display: "flex",
                flexFlow: "column",
                alignItems: "center",
              }}
            >
              <Label style={{ margin: "30px" }} size="md">
                Я текст типа да угу
              </Label>
              <ButtonGroup style={{ width: "100%" }}>
                <Button size="md" color="primary" onClick={togglePopup}>
                  Да
                </Button>
                <Button size="md" onClick={togglePopup}>
                  Нет
                </Button>
              </ButtonGroup>
            </Layout>
          </Popup>
        </PopupLayer>
      </PopupLayerProvider>
    </>
  );
});
