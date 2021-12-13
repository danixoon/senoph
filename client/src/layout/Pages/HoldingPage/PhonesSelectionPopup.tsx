import React from "react";
import Icon from "components/Icon";
import Button from "components/Button";
import Span from "components/Span";
import Link from "components/Link";
import ItemSelectionPopup from "layout/Popups/ItemSelectionPopup";
import { PopupProps } from "components/Popup";
import { api } from "store/slices/api";
import { parseItems } from "store/utils";

const PhonesSelectionPopup: React.FC<{ holdingId?: number } & PopupProps> = (
  props
) => {
  const { holdingId, ...rest } = props;

  const items = parseItems(
    api.useFetchPhonesFromHoldingQuery(
      { holdingId: holdingId as number },
      { skip: typeof holdingId !== "number" }
    )
  );
  const [commit] = api.useCreateHoldingChangeMutation();

  return (
    <ItemSelectionPopup
      {...rest}
      header="Прикреплённые средства связи"
      onSelect={(item) => {}}
      items={items.data.items.map((item) => ({
        id: item.id.toString(),
        content: (
          <>
            <Button
              onClick={() => {
                commit({ action: "remove", holdingId: holdingId as number, phoneIds: [item.id] });
              }}
              inverted
              style={{ marginRight: "1rem" }}
            >
              <Icon.X />
            </Button>
            <Link href={`/phone/view?selectedId=${item.id}`}>
              {item.model?.name ?? `#${item.id}`}
            </Link>
            <Span
              size="xs"
              style={{ marginLeft: "auto", marginRight: "1rem" }}
              font="monospace"
            >
              {item.inventoryKey ?? "Инвентарный отсутствует"}
            </Span>
          </>
        ),
        name: item.model?.name ?? `#${item.id}`,
      }))}
    />
  );
};

export default PhonesSelectionPopup;
