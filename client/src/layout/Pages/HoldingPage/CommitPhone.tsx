import { api } from "store/slices/api";
import Icon, { LoaderIcon } from "components/Icon";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import React from "react";
import { extractStatus, parseItems } from "store/utils";
import ActionBox from "components/ActionBox";
import InfoBanner from "components/InfoBanner";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { getTableColumns } from "./utils";
import { extractItemsHook, getLocalDate } from "utils";
import Link from "components/Link";
import Span from "components/Span";
import { useSelection } from "../../../hooks/useSelection";
import ButtonGroup from "components/ButtonGroup";
import TopBarLayer from "providers/TopBarLayer";
import Badge from "components/Badge";
import Button from "components/Button";
import columnTypes from "utils/columns";
import { useAuthor } from "hooks/misc/author";
import { useNotice } from "hooks/useNotice";

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
    return { ...item, ...targetHolding, authorId: item.authorId };
  });

  const getUser = useAuthor();

  return {
    holdingPhoneCommits,
    commit,
    commitStatus: extractStatus(commitInfo),
    holders,
    departments,
    holdings: mappedHoldings,
    getUser,
  };
};

// type TableItem = GetItemType<Api.GetResponse<"get", "/holdings/commit">>;

const CommitPhoneContent: React.FC<{}> = (props) => {
  const { holdings, commit, getUser, commitStatus, departments, holders } =
    useContainer();

  const selection = useSelection(holdings as any);

  useNotice(commitStatus);

  const columns: TableColumn<ArrayElement<typeof holdings>>[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      required: true,
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
        <Link href={`/holding/view?ids=${item.holdingId}`}>
          #{item.holdingId}
        </Link>
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
    columnTypes.selection({ selection }),
    columnTypes.author({ getUser }),
  ];

  const commitSelected = (action: CommitActionType) => {
    const payloads: any[] = [];
    const targetHoldings = holdings.filter((v) =>
      selection.selection.includes(v.id)
    );

    for (const holding of targetHoldings) {
      payloads.push({
        action,
        holdingId: holding.id,
        phoneIds: holding.commits.map((v) => v.phoneId),
      });
    }

    for (const payload of payloads) {
      commit(payload);
    }
  };

  return (
    <>
      {holdings.length === 0 ? (
        <InfoBanner
          // href="/phone/edit"
          // hrefContent="средство связи"
          text="Изменения движений отсутствуют."
        />
      ) : (
        <>
          <TopBarLayer>
            <ButtonGroup>
              <Button
                disabled={
                  selection.selection.length === 0 || commitStatus.isLoading
                }
                margin="none"
                onClick={() => commitSelected("approve")}
              >
                Подтвердить
              </Button>
              <Badge
                margin="none"
                color="secondary"
                style={{ borderRadius: 0 }}
              >
                {commitStatus.isLoading ? (
                  <LoaderIcon />
                ) : (
                  selection.selection.length
                )}
              </Badge>
              <Button
                disabled={
                  selection.selection.length === 0 || commitStatus.isLoading
                }
                margin="none"
                onClick={() => commitSelected("decline")}
              >
                Отменить
              </Button>
            </ButtonGroup>
          </TopBarLayer>
          <Table stickyTop={41} columns={columns} items={holdings} />
        </>
      )}
    </>
  );
};

export default CommitPhoneContent;
