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
import Form from "components/Form";
import Input from "components/Input";
import Button from "components/Button";
import Hr from "components/Hr";
import Header from "components/Header";
import Dropdown from "components/Dropdown";
import HolderSelectionPopupContainer from "containers/HolderSelectionPopup";
import { useTogglePopup } from "hooks/useTogglePopup";
import ClickInput from "components/ClickInput";
import PopupLayer from "providers/PopupLayer";

const ViewContent: React.FC<
  HoldingPageProps & { onEdit: (id: number) => void; act?: "view" | "select" }
> = (props) => {
  const { holdings, onEdit, act = "view", filterHook } = props;
  const [deleteHolding, deleteHoldingStatus] = api.useDeleteHoldingMutation();
  const { holders, departments } = useFetchConfigMap();

  const [bindFilter, setFilter] = filterHook;

  const isSelecting = act === "select";
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
        <ActionBox key="ok" icon={Icon.Box} status={extractStatus(deleteHoldingStatus)}>
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

  const holderPopup = useTogglePopup();

  const holderName = React.useRef<string | undefined>(undefined);

  return (
    <>
      <PopupLayer>
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
          name="orderKey"
          label="Номер документа"
          placeholder="1234"
        />
        <Input
          {...bindFilter}
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
      {holdings.length === 0 ? (
        <InfoBanner
          href="/phone/edit"
          hrefContent="средства связи"
          text="Движения по запросу отсутствуют. Вы можете создать их, выбрав"
        />
      ) : (
        <>
          <Header align="right">Результаты ({holdings.length})</Header>
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
            selectedId={2}
            columns={columns}
            items={holdings}
          />
        </>
      )}
    </>
  );
};

export default ViewContent;
