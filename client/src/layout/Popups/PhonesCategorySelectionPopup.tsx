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

const PhonesCategorySelectionPopup: React.FC<
  { categoryId?: number } & PopupProps
> = (props) => {
  const { categoryId, ...rest } = props;

  const [bind, setBind] = useInput<any>({});

  const items = parseItems(
    api.useFetchPhonesFromCategoryQuery(
      clearObject({
        categoryId: categoryId as number,
        ids: bind.input.id ? [bind.input.id] : undefined,
        inventoryKey: bind.input.inventoryKey,
      }),
      { skip: typeof categoryId !== "number" }
    )
  );

  const [commit, commitInfo] = api.useCreateCategoryChangeMutation();

  const commitStatus = extractStatus(commitInfo, true);
  const status = useStatus(commitStatus, items.status);

  useNotice(commitStatus);

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
                  categoryId: categoryId as number,
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

export default PhonesCategorySelectionPopup;
