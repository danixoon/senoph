import { api } from "store/slices/api";
import Icon from "components/Icon";
import { push } from "connected-react-router";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import React from "react";
import { useAppDispatch } from "store";
import { extractStatus } from "store/utils";
import { HoldingPageProps } from ".";
import ActionBox from "components/ActionBox";
import InfoBanner from "components/InfoBanner";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table from "components/Table";
import { getTableColumns } from "./utils";

const ViewContent: React.FC<
  HoldingPageProps & { onEdit: (id: number) => void }
> = (props) => {
  const { holdings, onEdit } = props;
  const [deleteHolding, deleteHoldingStatus] = api.useDeleteHoldingMutation();
  const { holders } = useFetchConfigMap();

  const dispatch = useAppDispatch();

  const columns = getTableColumns({
    status: extractStatus(deleteHoldingStatus),
    holders,
    controlMapper: (v, item) => (
      <ActionBox icon={Icon.Box} status={extractStatus(deleteHoldingStatus)}>
        {item.status !== null ? (
          <>
            <SpoilerPopupButton
              onClick={() => dispatch(push("/holding/commit"))}
            >
              Просмотреть
            </SpoilerPopupButton>
            <SpoilerPopupButton onClick={() => onEdit(item.id)}>
              Изменить
            </SpoilerPopupButton>
          </>
        ) : (
          <>
            <SpoilerPopupButton onClick={() => onEdit(item.id)}>
              Изменить
            </SpoilerPopupButton>
            <SpoilerPopupButton onClick={() => deleteHolding({ id: item.id })}>
              Удалить
            </SpoilerPopupButton>
          </>
        )}
      </ActionBox>
    ),
  });

  return (
    <>
      {holdings.length === 0 ? (
        <InfoBanner
          href="/phone/edit"
          hrefContent="средство связи"
          text="Движения отсутствуют. Создайте их, выбрав"
        />
      ) : (
        <Table columns={columns} items={holdings} />
      )}
    </>
  );
};

export default ViewContent;
