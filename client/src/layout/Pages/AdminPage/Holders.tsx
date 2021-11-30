import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { useDepartmentName } from "hooks/misc/useDepartmentName";
import { useHolderName } from "hooks/misc/useHolderName";
import { useInput } from "hooks/useInput";
import { NoticeContext } from "providers/NoticeProvider";
import React from "react";
import { api } from "store/slices/api";
import { extractStatus } from "store/utils";

export type HoldersProps = {};

const useContainer = () => {
  const holders = api.useFetchHoldersQuery({});
  const [deleteHolder, deleteStatus] = api.useDeleteHolderMutation();
  const [createHolder, createStatus] = api.useCreateHolderMutation();
  const getHolderName = useHolderName();

  return {
    holders: { ...holders, items: holders.data?.items ?? [] },
    deleteHolder,
    createHolder,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    getHolderName,
  };
};

const Holders: React.FC<HoldersProps> = (props) => {
  const {
    holders,
    deleteHolder,
    createHolder,
    createStatus,
    deleteStatus,
    getHolderName,
  } = useContainer();

  const noticeContext = React.useContext(NoticeContext);

  React.useEffect(() => {
    if (createStatus.isLoading)
      noticeContext.createNotice("Создание владельца...");
    if (createStatus.isSuccess)
      noticeContext.createNotice("Владелец успешно создан.");
    if (createStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при создании владельца: (${createStatus.error?.name}) ${createStatus.error?.description}`
      );
  }, [createStatus.status]);

  React.useEffect(() => {
    if (deleteStatus.isLoading)
      noticeContext.createNotice("Удаление владельца...");
    if (deleteStatus.isSuccess)
      noticeContext.createNotice("Владелец успешно удален.");
    if (deleteStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при удалении владельца: (${deleteStatus.error?.name}) ${deleteStatus.error?.description}`
      );
  }, [deleteStatus.status]);

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      mapper: (v, item) => (
        <ActionBox
          status={deleteStatus}
          onDelete={() => deleteHolder({ id: item.id })}
        />
      ),
    },
    {
      key: "id",
      header: "ID",
      size: "30px",
    },
    {
      key: "name",
      header: "ФИО",
      mapper: (v, item: Api.Models.Holder) => getHolderName(item),
    },
  ];

  const [bind] = useInput({});

  const tableItems = holders.items.map((holder) => holder);

  // const noticeContext = React.useContext(NoticeContext);

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <Layout>
        <Form
          input={bind.input}
          onSubmit={(data) => {
            // onSubmit(data);
            createHolder(data as any);
            // noticeContext.createNotice("Пользователь создан");
          }}
        >
          <Layout flow="row">
            <Input
              required
              placeholder="Иванов"
              label="Фамилия"
              {...bind}
              name="lastName"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="Имя"
              placeholder="Иван"
              {...bind}
              name="firstName"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="Отчество"
              placeholder="Иванович"
              {...bind}
              name="middleName"
              style={{ flex: "1" }}
            />
            <Button
              style={{
                marginTop: "auto",
                marginLeft: "auto",
                padding: "0 4rem",
              }}
              disabled={createStatus.isLoading}
              margin="md"
              type="submit"
              color="primary"
            >
              {createStatus.isLoading ? <LoaderIcon /> : "Создать"}
            </Button>
          </Layout>
        </Form>
        <Hr />
        <Header align="right">
          Список владельцев ({holders.items.length})
        </Header>
        <Table items={tableItems} columns={columns} />
      </Layout>
    </>
  );
};

const ActionBox = (props: { status: ApiStatus; onDelete: () => void }) => {
  // const { commit } = props;
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
        <SpoilerPopupButton onClick={() => props.onDelete()}>
          {props.status.isLoading ? <LoaderIcon /> : "Удалить"}
        </SpoilerPopupButton>
      </SpoilerPopup>
    </Button>
  );
};

export default Holders;
