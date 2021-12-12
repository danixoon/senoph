import { api } from "store/slices/api";
import Icon from "components/Icon";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import React from "react";
import { extractStatus, parseItems } from "store/utils";
import { HoldingPageProps } from ".";
import ActionBox from "components/ActionBox";
import InfoBanner from "components/InfoBanner";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { getTableColumns } from "./utils";
import { extractItemsHook, getLocalDate } from "utils";
import Link from "components/Link";
import Span from "components/Span";

const useContainer = () => {
  const { holders, departments } = useFetchConfigMap();
  const [commit, commitInfo] = api.useCommitHoldingPhoneMutation();
  const holdingPhoneCommits = parseItems(
    api.useFetchHoldingPhoneCommitsQuery({})
  );

  const holdings = parseItems(
    api.useFetchHoldingsQuery(
      { ids: holdingPhoneCommits.data.items.map((v) => v.holdingId) },
      { skip: holdingPhoneCommits.data.items.length === 0 }
    )
  );

  const mappedHoldings = holdingPhoneCommits.data.items.map((item) => {
    const targetHolding = holdings.data.items.find(
      (holding) => holding.id === item.holdingId
    );
    return { ...item, ...targetHolding };
  });

  return {
    holdingPhoneCommits,
    commit,
    commitStatus: extractStatus(commitInfo),
    holders,
    departments,
    holdings: mappedHoldings,
  };
};

// type TableItem = GetItemType<Api.GetResponse<"get", "/holdings/commit">>;

const CommitPhoneContent: React.FC<HoldingPageProps> = (props) => {
  const { holdings, commit, commitStatus, departments, holders } =
    useContainer();

  const columns: TableColumn<ArrayElement<typeof holdings>>[] = [
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
      header: "ID",
      key: "id",
      size: "30px",
      mapper: (v, item) => (
        <Link href={`/holding/view?id=${item.holdingId}`}>#{item.holdingId}</Link>
      ),
    },
    {
      header: "Номер документа",
      key: "orderId",
      size: "150px",
      mapper: (v, item) => item.orderKey,
    },
    {
      header: "Дата документа",
      key: "orderDate",
      size: "150px",
      type: "date",
      mapper: (v, item) => item.orderDate,
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
    {
      header: "Дата изменения",
      key: "statusDate",
      size: "150px",
      // type: "date",
      mapper: (v, item) =>
        getLocalDate(
          new Date(
            Math.max(
              ...item.commits.map((v) => new Date(v.statusAt ?? 0).getTime())
            )
          )
        ),
    },
  ];

  return (
    <>
      {holdings.length === 0 ? (
        <InfoBanner
          // href="/phone/edit"
          // hrefContent="средство связи"
          text="Изменения движений отсутствуют."
        />
      ) : (
        <Table columns={columns} items={holdings} />
      )}
    </>
  );
};

export default CommitPhoneContent;
