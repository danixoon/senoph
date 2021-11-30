import { api } from "store/slices/api";
import Icon from "components/Icon";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import React from "react";
import { extractStatus } from "store/utils";
import { HoldingPageProps } from ".";
import ActionBox from "components/ActionBox";
import InfoBanner from "components/InfoBanner";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { getTableColumns } from "./utils";
import { extractItemsHook } from "utils";
import Link from "components/Link";
import Span from "components/Span";

const useContainer = () => {
  const holdingPhoneCommits = api.useFetchHoldingPhoneCommitsQuery({});
  const { items: holdingPhoneItems, status: holdingPhoneStatus } =
    extractItemsHook(holdingPhoneCommits);

  return { holdingPhoneItems, holdingPhoneStatus };
};

type TableItem = GetItemType<Api.GetResponse<"get", "/holdings/commit">>;
const columns: TableColumn<TableItem>[] = [
  {
    key: "id",
    header: "ID",
  },
  {
    key: "addedIds",
    header: "Добавление",
    props: { style: { whiteSpace: "normal" } },
    mapper: (v, row) => {
      return row.commits.map((item, i) => (
        <>
          <Link
            style={{ display: "inline" }}
            href={`/phone/view?selectedId=${item}`}
          >
            <Span strike={item.status === "delete-pending"}>
              {`#${item.phoneId}`}
            </Span>
          </Link>
          {i !== row.commits.length - 1 ? ", " : ""}
        </>
      ));
    },
  },
];

const CommitPhoneContent: React.FC<HoldingPageProps> = (props) => {
  const { holdingPhoneItems, holdingPhoneStatus } = useContainer();
  const { items } = holdingPhoneItems;

  return (
    <>
      {items.length === 0 ? (
        <InfoBanner
          // href="/phone/edit"
          // hrefContent="средство связи"
          text="Изменения движений отсутствуют."
        />
      ) : (
        <Table columns={columns} items={items} />
      )}
    </>
  );
};

export default CommitPhoneContent;
