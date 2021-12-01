import qs from "query-string";
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
import { useQueryInput } from "hooks/useQueryInput";
import { useStoreQueryInput } from "hooks/useStoreQueryInput";

const useContainer = () => {
  const [deleteHolding, deleteHoldingStatus] = api.useDeleteHoldingMutation();
  const { holders, departments } = useFetchConfigMap();

  const dispatch = useAppDispatch();

  const location = useLocation<{ selectedId?: number }>();
  const history = useHistory();

  const { selectedId } = location.state ?? {};
  const { phoneIds } = qs.parse(location.search);
  const [input, updateInput] = React.useState(() => ({
    phoneIds: [] as number[],
  }));
  const [queryBind] = useStoreQueryInput(input, (q) =>
    updateInput({
      ...input,
      phoneIds:
        q.phoneIds?.split(",").map((v) => parseInt(v)) ?? input.phoneIds,
    })
  );

  return { selectedId, queryBind, phoneIds: input.phoneIds };
};

const UpdateContent: React.FC<HoldingPageProps> = (props) => {
  const { holdings } = props;

  const { selectedId, phoneIds } = useContainer();

  console.log(phoneIds);

  return (
    <>
      {typeof selectedId === "undefined" ? (
        <InfoBanner
          href="/phone/edit"
          hrefContent="средства связи"
          text="Для начала выберите добавляемые в движение"
        />
      ) : (
        <>
          Обновляемое движение #{selectedId} средствами {phoneIds?.join(", ")}{" "}
        </>
      )}
    </>
  );
};

export default UpdateContent;
