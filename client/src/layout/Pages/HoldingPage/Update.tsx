import qs from "query-string";
import { api } from "store/slices/api";
import Icon, { LoaderIcon } from "components/Icon";
import { push, replace } from "connected-react-router";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import React from "react";
import { useAppDispatch } from "store";
import { extractStatus, parseItems } from "store/utils";
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
import { defaultColumns } from "../PhonePage/Items";
import Header from "components/Header";
import Span from "components/Span";
import WithLoader from "components/WithLoader";
import Button from "components/Button";
import Hr from "components/Hr";
import Form from "components/Form";
import Layout from "components/Layout";
import { useNotice } from "hooks/useNotice";

const useContainer = () => {
  const dispatch = useAppDispatch();

  const location = useLocation<{ selectedId?: number }>();

  const { selectedId } = location.state ?? {};
  const { phoneIds } = qs.parse(location.search);

  const phoneIdsArray =
    typeof phoneIds === "string"
      ? phoneIds.split(",").map((v) => parseInt(v.trim()))
      : [];

  React.useEffect(() => {
    if (!selectedId && phoneIdsArray.length > 0)
      dispatch(
        replace({
          pathname: "/holding/view",
          state: {
            referrer: location.pathname,
            header: "Выберите движения для прикрепления",
            act: "select",
            referrerSearch: location.search,
          },
        })
      );
  }, []);

  const phones = parseItems(
    api.useFetchPhonesQuery(
      { ids: phoneIdsArray, offset: 0, amount: phoneIdsArray.length },
      { skip: phoneIdsArray.length === 0 }
    )
  );

  const holding = parseItems(
    api.useFetchHoldingsQuery(
      { ids: [selectedId ?? 0] },
      { skip: typeof selectedId === "undefined" }
    )
  );

  const [update, updateInfo] = api.useCreateHoldingChangeMutation();

  React.useEffect(() => {
    if (updateInfo.isSuccess) dispatch(push("/holding/phone/commit"));
  }, [updateInfo.status]);

  return {
    selectedId,
    phoneIds: phoneIdsArray,
    phones,
    holding: { data: holding.data.items[0], status: holding.status },
    change: {
      update,
      status: extractStatus(updateInfo),
    },
  };
};

const UpdateContent: React.FC<HoldingPageProps> = (props) => {
  const { selectedId, phoneIds, phones, holding, change } = useContainer();

  const handleUpdate = () => {
    if (typeof selectedId === "undefined") return;

    change.update({ action: "add", holdingId: selectedId, phoneIds });
  };

  useNotice(change.status, {
    success: "Средства успешно добавлены и ожидают подтверждения.",
  });

  return (
    <>
      {typeof selectedId === "undefined" ? (
        <InfoBanner
          href="/phone/edit"
          hrefContent="средства связи"
          text="Выберите добавляемые в движение"
        />
      ) : (
        <WithLoader status={change.status}>
          <Form input={{}} onSubmit={() => handleUpdate()}>
            <Layout flow="row" style={{ alignItems: "center" }}>
              <Span inline>
                Средства будут добавлены к{" "}
                {holding.data?.orderUrl ? (
                  <Link
                    native
                    inline
                    href={`/upload/${holding.data?.orderUrl}`}
                  >
                    движению
                  </Link>
                ) : (
                  "движению"
                )}{" "}
                с номером
                <strong> {holding.data?.orderKey} </strong>
                от{" "}
                <strong>
                  {new Date(holding.data?.orderDate).toLocaleDateString()}
                </strong>{" "}
              </Span>
              <Link
                style={{ marginLeft: "auto" }}
                href={`/holding/view#${holding.data?.id}`}
              >
                выбранное движение #{holding.data?.id}
              </Link>
              <Button
                type="submit"
                disabled={
                  change.status.isLoading || typeof selectedId === "undefined"
                }
                color="primary"
                style={{ marginLeft: "1rem" }}
              >
                {change.status.isLoading ? <LoaderIcon /> : "Добавить"}
              </Button>
            </Layout>
          </Form>
          <Hr />
          <Header align="right">
            Список добавляемых средств связи ({phones.data.items.length})
          </Header>
          <Table columns={defaultColumns} items={phones.data.items} />
        </WithLoader>
      )}
    </>
  );
};

export default UpdateContent;
