import { api } from "store/slices/api";
import Icon, { LoaderIcon } from "components/Icon";
import { push } from "connected-react-router";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import React from "react";
import { useAppDispatch } from "store";
import { extractStatus, parseItems } from "store/utils";
import ActionBox from "components/ActionBox";
import InfoBanner from "components/InfoBanner";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table from "components/Table";
import { getTableColumns, useHoldingWithHistory } from "./utils";
import Link from "components/Link";
import { useHistory, useLocation, useRouteMatch } from "react-router";
import { useQueryInput } from "hooks/useQueryInput";
import Form from "components/Form";
import Input from "components/Input";
import Button from "components/Button";
import Hr from "components/Hr";
import Header from "components/Header";
import Dropdown from "components/Dropdown";
import HolderSelectionPopupContainer from "containers/HolderSelectionPopup";
import { useTogglePayloadPopup, useTogglePopup } from "hooks/useTogglePopup";
import ClickInput from "components/ClickInput";
import PopupLayer from "providers/PopupLayer";
import WithLoader from "components/WithLoader";
import PhonesSelectionPopup from "./PhonesSelectionPopup";

const useContainer = () => {
  const { holders, departments } = useFetchConfigMap();
  const [deleteHolding, deleteHoldingInfo] = api.useDeleteHoldingMutation();

  const filterHook = useQueryInput<any>({});

  const holdings = useHoldingWithHistory(filterHook[0].input);

  const location = useLocation<any>();

  return {
    deleteHolding: {
      status: extractStatus(deleteHoldingInfo),
      exec: deleteHolding,
    },
    filterHook,
    holders,
    holdings,
    departments,
    act: ((location.state?.act as any) ?? "view") as "view" | "select",
  };
};

const ViewContent: React.FC<{}> = (props) => {
  const { filterHook, holders, departments, act, deleteHolding, holdings } =
    useContainer();

  const [bindFilter, setFilter] = filterHook;
  const isSelecting = act === "select";
  const dispatch = useAppDispatch();

  const location = useLocation<any>();
  const history = useHistory();

  const phonesPopup = useTogglePayloadPopup();

  const columns = getTableColumns({
    status: deleteHolding.status,
    holders,
    departments,
    controlMapper: (v, item) =>
      isSelecting ? (
        <> </>
      ) : (
        <ActionBox key="ok" icon={Icon.Box} status={deleteHolding.status}>
          {item.status !== null ? (
            <>
              <SpoilerPopupButton
                onClick={() => dispatch(push("/holding/commit"))}
              >
                Просмотреть
              </SpoilerPopupButton>
              <SpoilerPopupButton
                onClick={() => phonesPopup.onToggle(true, item.id)}
              >
                Изменить
              </SpoilerPopupButton>
            </>
          ) : (
            <>
              <SpoilerPopupButton
                onClick={() => phonesPopup.onToggle(true, item.id)}
              >
                Изменить
              </SpoilerPopupButton>
              <SpoilerPopupButton
                onClick={() => deleteHolding.exec({ id: item.id })}
              >
                Удалить
              </SpoilerPopupButton>
            </>
          )}
        </ActionBox>
      ),
  });

  const holderPopup = useTogglePopup();
  const holderName = React.useRef<string | undefined>(undefined);

  return (
    <>
      <PopupLayer>
        <PhonesSelectionPopup {...phonesPopup} holdingId={phonesPopup.state} />
        <HolderSelectionPopupContainer
          {...holderPopup}
          onSelect={(id, name) => {
            holderName.current = name;
            setFilter({ ...bindFilter.input, holderId: id });
          }}
        />
      </PopupLayer>
      <Header unsized align="right">
        Фильтр
      </Header>
      <Form style={{ flexFlow: "column wrap", maxHeight: "100px" }} input={{}}>
        <Input
          {...bindFilter}
          blurrable
          name="id"
          label="ID"
          placeholder="1234"
        />
        <Input
          {...bindFilter}
          blurrable
          name="orderKey"
          label="Номер документа"
          placeholder="1234"
        />
        <Input
          {...bindFilter}
          blurrable
          type="date"
          name="orderDate"
          label="Дата документа"
        />
        <Dropdown
          {...bindFilter}
          style={{ flex: "1" }}
          items={Array.from(departments.values()).map((v) => ({
            label: v.name,
            id: v.id,
          }))}
          name="departmentId"
          label="Подразделение"
        />
        <ClickInput
          input={{ holderName: holderName.current }}
          name="holderName"
          label="Владелец"
          clearable
          onClear={() => {
            holderName.current = undefined;
            setFilter({
              ...bindFilter.input,
              holderId: undefined,
              holderName: undefined,
            });
          }}
          onActive={() => holderPopup.onToggle()}
        />
        <Dropdown
          {...bindFilter}
          style={{ flex: "1" }}
          items={[
            { id: "create-pending", label: "Ожидает создания" },
            { id: "delete-pending", label: "Ожидает удаления" },
            { id: "based", label: "Подтверждённые" },
          ]}
          name="status"
          label="Статус"
        />
      </Form>
      <Hr />
      <WithLoader status={holdings.status}>
        {holdings.data.total === 0 ? (
          <InfoBanner
            href="/phone/edit"
            hrefContent="средства связи"
            text="Движения по запросу отсутствуют. Вы можете создать их, выбрав"
          />
        ) : (
          <>
            <Header align="right">Результаты ({holdings.data.total})</Header>
            <Table
              onSelect={
                isSelecting
                  ? (item) => {
                      const { referrer, referrerSearch } = location.state ?? {};
                      if (!referrer) return;
                      dispatch(
                        push({
                          pathname: referrer,
                          search: referrerSearch,
                          state: { selectedId: item.id },
                        })
                      );
                    }
                  : undefined
              }
              // selectedId={2}
              columns={columns}
              items={holdings.data.items}
            />
          </>
        )}
      </WithLoader>
    </>
  );
};

export default ViewContent;
