import { api } from "store/slices/api";
import Icon, { LoaderIcon } from "components/Icon";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import React from "react";
import { extractStatus } from "store/utils";
import ActionBox from "components/ActionBox";
import InfoBanner from "components/InfoBanner";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table from "components/Table";
import { getTableColumns, useHoldingWithHistory } from "./utils";
import TopBarLayer from "providers/TopBarLayer";
import ButtonGroup from "components/ButtonGroup";
import Button from "components/Button";
import Badge from "components/Badge";
import { useSelection } from "./useSelection";

const useContainer = () => {
  const holdings = useHoldingWithHistory({ status: "pending" });
  const [commitHolding, commitStatus] = api.useCommitHoldingMutation();
  const { holders, departments } = useFetchConfigMap();

  return {
    holdings,
    holders,
    departments,
    holding: {
      commit: { exec: commitHolding, status: extractStatus(commitStatus) },
    },
  };
};

const CommitContent: React.FC<{}> = (props) => {
  const { holdings, holding, holders, departments } = useContainer();

  const handleCommit = (action: CommitActionType, ids: number[]) =>
    !holding.commit.status.isLoading && holding.commit.exec({ action, ids });

  const selection = useSelection(holdings.data.items);

  const columns = getTableColumns({
    holders,
    departments,
    status: extractStatus(holdings.status),
    controlMapper: (v, item) => (
      <ActionBox icon={Icon.Box} status={extractStatus(holding.commit.status)}>
        <SpoilerPopupButton onClick={() => handleCommit("approve", [item.id])}>
          Подтвердить
        </SpoilerPopupButton>
        <SpoilerPopupButton onClick={() => handleCommit("decline", [item.id])}>
          Отменить
        </SpoilerPopupButton>
      </ActionBox>
    ),
    selection,
  });

  return (
    <>
      {holdings.data.total === 0 ? (
        <InfoBanner
          href="/phone/edit"
          hrefContent="средство связи"
          text="Движения для потдверждения отсутствуют. Создайте их, выбрав"
        />
      ) : (
        <>
          <TopBarLayer>
            <ButtonGroup>
              <Button
                disabled={
                  selection.selection.length === 0 ||
                  holding.commit.status.isLoading
                }
                margin="none"
                onClick={() => handleCommit("approve", selection.selection)}
              >
                Подтвердить
              </Button>
              <Badge
                margin="none"
                color="secondary"
                style={{ borderRadius: 0 }}
              >
                {holding.commit.status.isLoading ? (
                  <LoaderIcon />
                ) : (
                  
                  selection.selection.length
                )}
              </Badge>
              <Button
                disabled={
                  selection.selection.length === 0 ||
                  holding.commit.status.isLoading
                }
                margin="none"
                onClick={() => handleCommit("decline", selection.selection)}
              >
                Отменить
              </Button>
            </ButtonGroup>
          </TopBarLayer>
          <Table columns={columns} items={holdings.data.items} />
        </>
      )}
    </>
  );
};

export default CommitContent;
