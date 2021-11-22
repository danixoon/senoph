import Button from "components/Button";
import ClickInput from "components/ClickInput";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import Link from "components/Link";
import Span from "components/Span";
import Table, { TableColumn } from "components/Table";
import HolderSelectionPopupContainer from "containers/HolderSelectionPopup";
import { useDepartmentName } from "hooks/misc/useDepartmentName";
import { splitHolderName, useHolderName } from "hooks/misc/useHolderName";

import { useFileInput, useInput } from "hooks/useInput";
import PopupLayer from "providers/PopupLayer";
import * as React from "react";
import { api } from "store/slices/api";

import "./style.styl";

import { Route, Switch, useRouteMatch } from "react-router";
import Badge from "components/Badge";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";
import InfoBanner from "components/InfoBanner";
import { extractStatus } from "store/utils";
import { useTogglePopup } from "hooks/useTogglePopup";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import ActionBox from "components/ActionBox";
import { useAppDispatch } from "store";
import { push } from "connected-react-router";

type HoldingItem = Api.Models.Holding & { prevHolders: Api.Models.Holder[] };

export type HoldingPageProps = {
  phones: Api.Models.Phone[];
  holdings: HoldingItem[];
  phonesStatus: ApiStatus;
  holdingsStatus: ApiStatus;
  holdingCreationStatus: ApiStatus;

  onSubmitHolding: (data: any) => void;
};

const reasonMap = [
  { id: "initial", label: "Назначение" },
  { id: "order", label: "По приказу" },
  { id: "dismissal", label: "Увольнение" },
  { id: "movement", label: "Переезд" },
  { id: "write-off", label: "Списание" },
  { id: "other", label: "Другое" },
];
const getReason = (id: string) =>
  reasonMap.find((r) => r.id === id)?.label ?? `#${id}`;

const CreateContent: React.FC<HoldingPageProps> = (props) => {
  const { phones, holdingCreationStatus, onSubmitHolding: onSubmit } = props;
  const columns: TableColumn[] = [
    {
      key: "id",
      header: "ID",
      size: "30px",
      mapper: (v, item) => (
        <Link href={`/phone/view?selectedId=${item.id}`}>
          <Span font="monospace">{`#${v}`}</Span>
        </Link>
      ),
    },
    { key: "modelName", header: "Модель", size: "150px" },
    { key: "inventoryKey", header: "Инвентарный номер", size: "300px" },
    { key: "holderName", header: "Владелец" },
    { key: "departmentName", header: "Отделение" },
  ];
  const getHolderName = useHolderName();
  const getDepartmentName = useDepartmentName();

  const [bind, setInput] = useInput({
    departmentId: null,
    reasonId: null,
    holderId: null,
    holderName: null,
  });

  const [bindFile] = useFileInput();

  const tableItems = phones.map((phone) => ({
    ...phone,
    modelName: phone.model?.name,
    holderName: getHolderName(phone.holder),
    departmentName: getDepartmentName(phone.holder?.departmentId),
  }));

  const bindHoldingPopup = useTogglePopup();

  const { data: selectedHolder } = api.useFetchHoldersQuery(
    { id: bind.input.holderId as any },
    { skip: bind.input.holderId === null }
  );

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <Layout>
        <Form
          json={false}
          input={{
            ...bind.input,
            ...bindFile.files,
            phoneIds: phones.map((phone) => phone.id),
          }}
          mapper={({ departmentId, ...input }) => input}
          onSubmit={(data) => {
            onSubmit(data);
          }}
        >
          <Layout flow="row">
            <ClickInput
              required
              {...bind}
              name="holderName"
              label="Новый владелец"
              onActive={() => bindHoldingPopup.onToggle()}
              style={{ flex: "2" }}
            />
            <Input
              required
              label="Дата приказа"
              {...bind}
              type="date"
              name="orderDate"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="Файл приказа"
              {...bindFile}
              name="orderFile"
              style={{ flex: "1" }}
              type="file"
              inputProps={{ accept: ".pdf" }}
            />
          </Layout>
          <Layout flow="row">
            <Dropdown
              required
              style={{ flex: "1" }}
              label="Причина"
              {...bind}
              name="reasonId"
              items={reasonMap}
            />
            <Input
              style={{ flex: "2rem" }}
              required={bind.input.reasonId === "other"}
              label="Описание"
              {...bind}
              name="description"
            />

            <Button
              style={{
                marginTop: "auto",
                marginLeft: "auto",
                padding: "0 4rem",
              }}
              disabled={holdingCreationStatus.isLoading}
              margin="md"
              type="submit"
              color="primary"
            >
              {holdingCreationStatus.isLoading ? <LoaderIcon /> : "Создать"}
            </Button>
          </Layout>
        </Form>
        <Hr />
        <Header align="right">
          Затрагиваемые средства связи ({phones.length})
        </Header>
        <Table items={tableItems} columns={columns} />
      </Layout>
      <PopupLayer>
        <HolderSelectionPopupContainer
          {...bindHoldingPopup}
          onSelect={(id, name) =>
            setInput({ ...bind.input, holderName: name, holderId: id })
          }
        />
      </PopupLayer>
    </>
  );
};

type HoldingTableItem = Api.Models.Holding & {
  prevHolders: Api.Models.Holder[];
};
const getTableColumns: (args: {
  status: ApiStatus;
  holders: Map<number, Api.Models.Holder>;
  controlMapper: (v: any, item: HoldingTableItem) => React.ReactNode;
}) => TableColumn[] = ({ status, holders, controlMapper }) => [
  {
    key: "control",
    size: "30px",
    header: "",
    mapper: controlMapper,
  },

  { key: "orderDate", header: "Приказ от", size: "100px", type: "date" },
  {
    key: "holderId",
    header: "Владелец",
    mapper: (v, item: HoldingTableItem) => {
      const holder = holders.get(item.holderId);
      return (
        <Layout>
          {item.prevHolders.map((holder) => (
            <Span strike key={holder.id}>
              {splitHolderName(holder)}
            </Span>
          ))}
          <Span>{holder ? splitHolderName(holder) : <LoaderIcon />}</Span>
        </Layout>
      );
    },
  },
  {
    key: "phoneIds",
    header: "Средства связи",
    mapper: (v, item: HoldingTableItem) => {
      return item.phoneIds.map((id, i) => (
        <>
          <Link
            style={{ display: "inline" }}
            href={`/phone/view?selectedId=${id}`}
          >{`#${id}`}</Link>
          {i !== item.phoneIds.length - 1 ? ", " : ""}
        </>
      ));
    },
  },
  {
    key: "reasonId",
    header: "Причина",
    size: "150px",
    mapper: (v, item) => <Badge>{getReason(item.reasonId)}</Badge>,
  },
  {
    key: "status",
    header: "Статус",
    size: "150px",
    mapper: (v, item) => {
      let status = "Произвидено";
      if (item.status === "create-pending") status = "Ожидает создания";
      else if (item.status === "delete-pending") status = "Ожидает удаления";
      return <Badge>{status}</Badge>;
    },
  },
];

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

const ViewContent: React.FC<HoldingPageProps> = (props) => {
  const { holdings } = props;
  const [deleteHolding, deleteHoldingStatus] = api.useDeleteHoldingMutation();
  const { holders } = useFetchConfigMap();

  const dispatch = useAppDispatch();

  const columns = getTableColumns({
    status: extractStatus(deleteHoldingStatus),
    holders,
    controlMapper: (v, item) => (
      <ActionBox icon={Icon.Box} status={extractStatus(deleteHoldingStatus)}>
        {item.status !== null ? (
          <SpoilerPopupButton onClick={() => dispatch(push("/holding/commit"))}>
            Просмотреть
          </SpoilerPopupButton>
        ) : (
          <SpoilerPopupButton onClick={() => deleteHolding({ id: item.id })}>
            Удалить
          </SpoilerPopupButton>
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

const HoldingPage: React.FC<HoldingPageProps> = (props) => {
  const { phones } = props;

  const { path } = useRouteMatch();

  return (
    <Layout flex="1" className="holding-page">
      <Switch>
        <Route path={`${path}/create`}>
          {phones.length === 0 ? (
            <InfoBanner
              href="/phone/edit"
              hrefContent="средство связи"
              text="Для создания движения выберите"
            />
          ) : (
            <CreateContent {...props} />
          )}
        </Route>
        <Route path={`${path}/commit`}>
          <CommitContent
            {...props}
            holdings={props.holdings.filter((p) => p.status !== null)}
          />
        </Route>
        <Route path={`${path}/view`}>
          <ViewContent {...props} />
        </Route>
      </Switch>
    </Layout>
  );
};

export default HoldingPage;
