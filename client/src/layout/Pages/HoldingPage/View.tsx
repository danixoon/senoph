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
import Link from "components/Link";
import { useHistory, useLocation, useRouteMatch } from "react-router";

const ViewContent: React.FC<
  HoldingPageProps & { onEdit: (id: number) => void; act?: "view" | "select" }
> = (props) => {
  const { holdings, onEdit, act = "view" } = props;
  const [deleteHolding, deleteHoldingStatus] = api.useDeleteHoldingMutation();
  const { holders, departments } = useFetchConfigMap();

  const isSelecting = act !== "select";
  const dispatch = useAppDispatch();

  const location = useLocation<any>();
  const history = useHistory();

  const columns = getTableColumns({
    status: extractStatus(deleteHoldingStatus),
    holders,
    departments,
    controlMapper: (v, item) =>
      isSelecting ? (
        <> </>
      ) : (
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
              <SpoilerPopupButton
                onClick={() => deleteHolding({ id: item.id })}
              >
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
        <Table
          onSelect={
            isSelecting
              ? (item) => {
                  const { referrer } = location.state ?? {};
                  if (!referrer) return;

                  history.replace({
                    pathname: referrer,
                    state: { selectedId: item.id },
                  });
                }
              : undefined
          }
          selectedId={2}  
          columns={columns}
          items={holdings}
        />
      )}
    </>
  );
};

export default ViewContent;
