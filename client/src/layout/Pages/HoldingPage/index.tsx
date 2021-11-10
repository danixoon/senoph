import AltPopup from "components/AltPopup";
import Button from "components/Button";
import ClickInput from "components/ClickInput";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import Span from "components/Span";
import Table, { TableColumn } from "components/Table";
import HolderSelectionPopupContainer from "containers/HolderSelectionPopup";
import DepartmentSelectionPopupContainer from "containers/DepartmentSelectionPopup";
import { useDepartmentName } from "hooks/misc/useDepartmentName";
import { useHolderName } from "hooks/misc/useHolderName";

import { useFileInput, useInput } from "hooks/useInput";
import { useQueryInput } from "hooks/useQueryInput";
import { useTimeout } from "hooks/useTimeout";
import PopupLayout from "layout/PopupLayout";
import PopupLayer from "providers/PopupLayer";
import * as React from "react";
import { api } from "store/slices/api";

import "./style.styl";
import { useAppDispatch } from "store";
import { createNotice } from "store/slices/notice";
import { NoticeContext } from "providers/NoticeProvider";
import FileInput from "components/FileInput";
import { Route, Switch, useRouteMatch } from "react-router";
import { useLastHolder } from "hooks/api/useFetchHolder";
import Badge from "components/Badge";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";

export type HoldingPageProps = {
  phones: Api.Models.Phone[];
  holdings: Api.Models.Holding[];
  holdingHistory: Map<number, Api.Models.Holding[]>;
  phonesStatus: ApiStatus;
  holdingsStatus: ApiStatus;

  onSubmitHolding: (data: any) => void;
};

// const useFileInput = () => {
//   const [file, setFile] = React.useState<File | null>(() => null);

//   return {
//     input
//     onChange: (e: {
//       target: {
//         name: string;
//         files: File[];
//       };
//     }) => {},
//   };
// };

const CreateContent: React.FC<HoldingPageProps> = (props) => {
  const { phones, onSubmitHolding: onSubmit } = props;
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

  const [bind] = useInput({
    departmentId: null,
    reasonId: null,
    holderId: null,
  });

  const [bindFile] = useFileInput();

  // TODO: Make Holder fetching hook
  // const { holder } = useLastHolder(phone);

  const tableItems = phones.map((phone) => ({
    ...phone,
    modelName: phone.model?.name,
    holderName: getHolderName(phone.holder),
    departmentName: getDepartmentName(phone.holder?.departmentId),
  }));

  const [isHolderPopup, setHolderPopup] = React.useState(() => false);
  const handleHolderPopup = () => {
    setHolderPopup(!isHolderPopup);
  };

  const [isDepartmentPopup, setDepartmentPopup] = React.useState(() => false);
  const handleDepartmentPopup = () => {
    setDepartmentPopup(!isDepartmentPopup);
  };

  const noticeContext = React.useContext(NoticeContext);

  // const mapDepartmentName = (value: any) =>
  //   value === ""
  //     ? "Не выбрано"
  //     : models.find((m) => m.id === value)?.name ?? `Без имени (#${value})`;

  const { data: selectedHolder } = api.useFetchHoldersQuery(
    { id: bind.input.holderId as any },
    { skip: bind.input.holderId === null }
  );

  const mapHolderName = (holderId: any) =>
    holderId === ""
      ? "Не выбрано"
      : getHolderName(selectedHolder?.items[0]) ?? `Без имени (#${holderId})`;

  const mapDepartmentName = (depId: any) =>
    depId === "" ? "Не выбрано" : getDepartmentName(depId);

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
          onSubmit={(data) => {
            onSubmit(data);
            noticeContext.createNotice("Движение создано");
          }}
        >
          <Layout flow="row">
            <ClickInput
              required
              label="Подразделение"
              {...bind}
              name="departmentId"
              style={{ flex: "2" }}
              onClick={handleDepartmentPopup}
              mapper={mapDepartmentName}
            />
            <ClickInput
              required
              label="Новый владелец"
              {...bind}
              mapper={mapHolderName}
              name="holderId"
              onClick={handleHolderPopup}
              style={{ flex: "2" }}
              disabled={bind.input.departmentId === null}
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
              items={[
                { id: "dismissal", label: "Увольнение" },
                { id: "movement", label: "Переезд" },
                { id: "write-off", label: "Списание" },
                { id: "other", label: "Другое" },
              ]}
            />
            <Input
              style={{ flex: "2rem" }}
              disabled={bind.input.reasonId !== "other"}
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
              margin="md"
              type="submit"
              color="primary"
            >
              Создать
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
          isOpen={isHolderPopup}
          onToggle={handleHolderPopup}
          targetBind={bind}
          name="holderId"
        />
        <DepartmentSelectionPopupContainer
          isOpen={isDepartmentPopup}
          onToggle={handleDepartmentPopup}
          targetBind={bind}
          name="departmentId"
        />
      </PopupLayer>
    </>
  );
};

const ActionBox = (props: { commit: (action: CommitActionType) => void }) => {
  const { commit } = props;
  const [target, setTarget] = React.useState<HTMLElement | null>(() => null);

  const [isOpen, setIsOpen] = React.useState(() => false);

  return (
    <Button
      ref={(r) => setTarget(r)}
      color="primary"
      inverted
      onClick={() => setIsOpen(true)}
    >
      <Icon.Box />
      <SpoilerPopup
        target={isOpen ? target : null}
        position="right"
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as any))
            e.preventDefault();
          else setIsOpen(false);
        }}
      >
        <SpoilerPopupButton onClick={() => commit("approve")}>
          Подтвердить
        </SpoilerPopupButton>
        <SpoilerPopupButton onClick={() => commit("decline")}>
          Отменить
        </SpoilerPopupButton>
      </SpoilerPopup>
    </Button>
  );
};

const ViewContent: React.FC<HoldingPageProps> = (props) => {
  const getReasonName = (reasonId: HoldingReason) => {
    switch (reasonId) {
      case "initial":
        return "Первичное";
      case "write-off":
        return "Списание";
      case "movement":
        return "Перемещение";
      case "dismissal":
        return "Увольнение";
      default:
        return reasonId;
    }
  };

  const getHolderName = useHolderName();
  const [commitHolding, status] = api.useCommitHoldingMutation();

  const columns: TableColumn[] = [
    {
      key: "control",
      size: "30px",
      header: "",
      mapper: (v, item: ArrayElement<typeof tableItems>) => (
        <ActionBox
          commit={(action) =>
            !status.isLoading && commitHolding({ action, ids: [item.id] })
          }
        />
      ),
    },
    // {
    //   key: "id",
    //   header: "ID",
    //   size: "30px",
    //   mapper: (v, item) => (
    //     <Link href={`/phone/view?selectedId=${item.id}`}>
    //       <Span font="monospace">{`#${v}`}</Span>
    //     </Link>
    //   ),
    // },
    { key: "orderDate", header: "Приказ от", size: "100px", type: "date" },
    {
      key: "holderId",
      header: "Владелец",
      mapper: (v, item: ArrayElement<typeof tableItems>) => {
        return (
          <Layout>
            {item.prevHolders.map((holder) => (
              <Span strike key={holder.id}>
                {getHolderName(holder)}
              </Span>
            ))}
            <Span>{getHolderName(item.holder)}</Span>
          </Layout>
        );
      },
    },
    {
      key: "phoneIds",
      header: "Средства связи",
      mapper: (v, item: ArrayElement<typeof tableItems>) => {
        return item.phoneIds.map((id, i) => (
          <>
            <Link href={`/phone/view?selectedId=${id}`}>{`#${id}`}</Link>
            {i !== item.phoneIds.length - 1 ? ", " : ""}
          </>
        ));
      },
    },
    {
      key: "reasonId",
      header: "Причина",
      size: "150px",
      mapper: (v, item) => <Badge>{`${getReasonName(v)}`}</Badge>,
    },

    // { key: "departmentName", header: "Отделение" },
  ];

  const tableItems = props.holdings.map((holding) => {
    const prevHolders: Api.Models.Holder[] = [];
    for (const id of holding.phoneIds) {
      const prevItem = [...(props.holdingHistory.get(id) ?? [])]
        .sort((h1, h2) =>
          (h1.createdAt as string) < (h2.createdAt as string) ? 1 : -1
        )
        .shift();

      if (
        prevItem?.holder &&
        !prevHolders.find((h) => h.id === prevItem.holderId)
      )
        prevHolders.push(prevItem.holder as Api.Models.Holder);
    }
    return { ...holding, prevHolders };
  });

  // type TableItem = ;

  return (
    <>
      <Table columns={columns} items={tableItems} />
    </>
  );
};

const Info: React.FC<{ text: string; href: string; hrefContent: string }> = (
  props
) => (
  <Label style={{ margin: "auto" }}>
    <Span>{props.text}</Span>
    <Link href={`${props.href}`} style={{ marginLeft: "0.2rem" }}>
      {props.hrefContent}
    </Link>
  </Label>
);

const HoldingPage: React.FC<HoldingPageProps> = (props) => {
  const { phones } = props;

  const { path } = useRouteMatch();

  return (
    <Layout flex="1" className="holding-page">
      <Switch>
        <Route path={`${path}/create`}>
          {phones.length === 0 ? (
            <Info
              href="/phone/edit"
              hrefContent="средство связи"
              text="Для создания движения"
            />
          ) : (
            <CreateContent {...props} />
          )}
        </Route>
        <Route path={`${path}/view`}>
          <ViewContent {...props} />
        </Route>
      </Switch>
    </Layout>
  );
};

export default HoldingPage;
