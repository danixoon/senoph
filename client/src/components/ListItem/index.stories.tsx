import { storiesOf } from "@storybook/react";
import Badge from "components/Badge";
import React from "react";
import ListItem from ".";
import PopupLayerProvider from "providers/PopupLayerProvider";
import Link from "components/Link";

storiesOf("Components/Text/List Item", module).add("simple-xs", () => (
  <PopupLayerProvider>
    <ListItem label="ID">
      <Link altLabel={{ text: "ого нихуя умная система" }} isMonospace>
        #5e064bcd674976450ca574da
      </Link>
    </ListItem>
    <ListItem label="Статус">
      <Badge> данечка </Badge>
      <Badge> данечка </Badge>
      <Badge> данечка </Badge>
      <Badge
        altLabel={{ text: "пупа лупа" }}
        color="primary"
        isWarn
        onClick={() => {}}
      >
        данечка
      </Badge>
    </ListItem>
    <ListItem label="Имя бота">
      <Badge> данечка </Badge>
      <Badge> данечка </Badge>
      <Badge> данечка </Badge>
      <Badge
        altLabel={{ text: "пупа лупа" }}
        color="primary"
        isWarn
        onClick={() => {}}
      >
        данечка
      </Badge>
    </ListItem>
  </PopupLayerProvider>
));
