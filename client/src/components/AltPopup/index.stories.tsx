import { storiesOf } from "@storybook/react";
import Badge from "components/Badge";
import React, { useRef } from "react";
import AltPopup from ".";
import Layout from "components/Layout";
import PopupLayerProvider from "providers/PopupLayerProvider";

storiesOf("Components/Popups/Alt Popup", module).add("left", () => {
  const ref = useRef<HTMLElement>();
  return (
    <>
      <PopupLayerProvider>
        <Layout>
          <Badge
            altLabel={{ text: "Необходимо ответить" }}
            onClick={() => {}}
            color="primary"
          >
            Приветик Приветик Приветик Приветик
          </Badge>
        </Layout>
      </PopupLayerProvider>
    </>
  );
});
