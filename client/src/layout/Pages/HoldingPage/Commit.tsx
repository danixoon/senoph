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
import { useSelection } from "../../../hooks/useSelection";
import { useAuthor } from "hooks/misc/author";
import { useTogglePayloadPopup } from "hooks/useTogglePopup";
import PhonesSelectionPopup from "layout/Popups/PhonesSelectionPopup";
import PopupLayer from "providers/PopupLayer";
import { useNotice } from "hooks/useNotice";

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

  const getUser = useAuthor();
  const phonesPopup = useTogglePayloadPopup();

  useNotice(holding.commit.status);

  const columns = getTableColumns({
    onOpen: (id) => phonesPopup.onToggle(true, id),
    getUser,
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
          <PopupLayer>
            <PhonesSelectionPopup
              {...phonesPopup}
              holdingId={phonesPopup.state}
            />
          </PopupLayer>
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
          <Table stickyTop={41} columns={columns} items={holdings.data.items} />
        </>
      )}
    </>
  );
};

export default CommitContent;
