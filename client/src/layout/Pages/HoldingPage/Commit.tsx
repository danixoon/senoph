import { api } from "store/slices/api";
import Icon from "components/Icon";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import React from "react";
import { extractStatus } from "store/utils";
import { HoldingPageProps } from ".";
import ActionBox from "components/ActionBox";
import InfoBanner from "components/InfoBanner";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table from "components/Table";
import { getTableColumns } from "./utils";

const CommitContent: React.FC<HoldingPageProps> = (props) => {
  const { holdings } = props;
  const [commitHolding, status] = api.useCommitHoldingMutation();
  const { holders } = useFetchConfigMap();

  const handleCommit = (action: CommitActionType, id: number) =>
    !status.isLoading && commitHolding({ action, ids: [id] });

  const columns = getTableColumns({
    holders,
    status: extractStatus(status),
    controlMapper: (v, item) => (
      <ActionBox icon={Icon.Box} status={extractStatus(status)}>
        <SpoilerPopupButton onClick={() => handleCommit("approve", item.id)}>
          Подтвердить
        </SpoilerPopupButton>
        <SpoilerPopupButton onClick={() => handleCommit("decline", item.id)}>
          Отменить
        </SpoilerPopupButton>
      </ActionBox>
    ),
  });

  return (
    <>
      {holdings.length === 0 ? (
        <InfoBanner
          href="/phone/edit"
          hrefContent="средство связи"
          text="Движения для потдверждения отсутствуют. Создайте их, выбрав"
        />
      ) : (
        <Table columns={columns} items={holdings} />
      )}
    </>
  );
};

export default CommitContent;
