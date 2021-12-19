import React from "react";
import Icon from "components/Icon";
import Button from "components/Button";
import Span from "components/Span";
import Link from "components/Link";
import ItemSelectionPopup from "layout/Popups/ItemSelectionPopup";
import { PopupProps } from "components/Popup";
import { api } from "store/slices/api";
import { extractStatus, parseItems, useStatus } from "store/utils";
import { useNotice } from "hooks/useNotice";
import { useInput } from "hooks/useInput";
import { clearObject } from "utils";
import Input from "components/Input";

const PhonesHoldingSelectionPopup: React.FC<
  { holdingId?: number } & PopupProps
> = (props) => {
  const { holdingId, ...rest } = props;

  const [bind, setBind] = useInput<any>({});

  const items = parseItems(
    api.useFetchPhonesFromHoldingQuery(
      clearObject({
        holdingId: holdingId as number,
        ids: bind.input.id ? [bind.input.id] : undefined,
        inventoryKey: bind.input.inventoryKey,
      }),
      { skip: typeof holdingId !== "number" }
    )
  );

  const [commit, commitInfo] = api.useCreateHoldingChangeMutation();

  // console.log(commitInfo);

  const status = useStatus(extractStatus(commitInfo), items.status);
  useNotice(status);

  return (
    <ItemSelectionPopup
      {...rest}
      status={status}
      header="Прикреплённые средства связи"
      onSelect={(item) => {}}
      items={items.data.items.map((item) => ({
        id: item.id.toString(),
        content: (
          <>
            <Button
              onClick={() => {
                commit({
                  action: "remove",
                  holdingId: holdingId as number,
                  phoneIds: [item.id],
                });
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
    >
      <Input {...bind} style={{ flex: "1" }} name="id" placeholder="ID" />
      <Input
        {...bind}
        style={{ flex: "1" }}
        name="inventoryKey"
        placeholder="Инвентарный номер"
      />
    </ItemSelectionPopup>
  );
};

export default PhonesHoldingSelectionPopup;
