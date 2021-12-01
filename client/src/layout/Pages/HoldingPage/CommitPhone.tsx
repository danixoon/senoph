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
  const [commit, commitInfo] = api.useCommitHoldingPhoneMutation();
  const holdingPhoneCommits = api.useFetchHoldingPhoneCommitsQuery({});
  const { items: holdingPhoneItems, status: holdingPhoneStatus } =
    extractItemsHook(holdingPhoneCommits);

  return {
    holdingPhoneItems,
    holdingPhoneStatus,
    commit,
    commitStatus: extractStatus(commitInfo),
  };
};

type TableItem = GetItemType<Api.GetResponse<"get", "/holdings/commit">>;

const CommitPhoneContent: React.FC<HoldingPageProps> = (props) => {
  const { holdingPhoneItems, holdingPhoneStatus, commit, commitStatus } =
    useContainer();
  const { items } = holdingPhoneItems;

  const columns: TableColumn<TableItem>[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      mapper: (v, item) => (
        <ActionBox icon={Icon.Box} status={commitStatus}>
          <SpoilerPopupButton
            onClick={() =>
              commit({
                action: "approve",
                holdingId: item.holdingId,
                phoneIds: item.commits.map((c) => c.phoneId),
              })
            }
          >
            Подтвердить
          </SpoilerPopupButton>
          <SpoilerPopupButton
            onClick={() =>
              commit({
                action: "decline",
                holdingId: item.holdingId,
                phoneIds: item.commits.map((c) => c.phoneId),
              })
            }
          >
            Отменить
          </SpoilerPopupButton>
        </ActionBox>
      ),
    },
    {
      key: "holdingId",
      header: "ID",
      size: "30px",
    },
    {
      key: "addedIds",
      header: "Изменения",
      props: { style: { whiteSpace: "normal" } },
      mapper: (v, row) => {
        return row.commits.map((item, i) => (
          <>
            <Link
              style={{ display: "inline" }}
              href={`/phone/view?selectedId=${item.phoneId}`}
            >
              <Span inline strike={item.status === "delete-pending"}>
                {`#${item.phoneId}`}
              </Span>
            </Link>
            {i !== row.commits.length - 1 ? ", " : ""}
          </>
        ));
      },
    },
  ];

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
