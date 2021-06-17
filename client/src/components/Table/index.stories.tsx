import { storiesOf } from "@storybook/react";
import { useInput } from "hooks/useInput";
import PopupLayerProvider from "providers/PopupLayerProvider";
import React from "react";
import Table from ".";

storiesOf("Components/Containers/Table", module).add("simple", () => {
  // const bind = useInput({ selectedId: 0 });
  return (
    <Table
      // {...bind}
      // name="selectedId"
      items={[
        { id: 0, name: "Pupa" },
        { id: 1, name: "Loopa" },
        { id: 2, name: "Loopa Lupov" },
        { id: 3, name: "Loopa Zoopa" },
        { id: 4, name: "Loopa Owo", props: { onClick: () => alert("yeah") } },
      ]}
      columns={[
        { key: "id", name: "Id.", sortable: true },
        { key: "name", name: "Name", sortable: true },
      ]}
    />
  );
});
