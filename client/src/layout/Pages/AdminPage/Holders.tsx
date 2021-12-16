import ActionBox from "components/ActionBox";
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
import WithLoader from "components/WithLoader";
import { useDepartment } from "hooks/misc/department";
import { splitHolderName, useHolder } from "hooks/misc/holder";
import { useInput } from "hooks/useInput";
import { useTogglePayloadPopup } from "hooks/useTogglePopup";
import ItemEditPopup from "layout/Popups/ItemEditPopup";
import { NoticeContext } from "providers/NoticeProvider";
import PopupLayer from "providers/PopupLayer";
import TopBarLayer from "providers/TopBarLayer";
import React from "react";
import { api } from "store/slices/api";
import { extractStatus } from "store/utils";

export type HoldersProps = {};

const useContainer = () => {
  const holders = api.useFetchHoldersQuery({});
  const [deleteHolder, deleteStatus] = api.useDeleteHolderMutation();
  const [createHolder, createStatus] = api.useCreateHolderMutation();
  const [editHolder, editStatus] = api.useEditHolderMutation();
  const getHolderName = useHolder();

  return {
    holders: {
      ...holders,
      items: holders.data?.items ?? [],
      status: extractStatus(holders, true),
    },
    deleteHolder,
    createHolder,
    editHolder,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    editStatus: extractStatus(editStatus),
    getHolderName,
  };
};

const Holders: React.FC<HoldersProps> = (props) => {
  const {
    holders,
    deleteHolder,
    createHolder,
    editHolder,
    createStatus,
    deleteStatus,
    editStatus,
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

  const { state: editedHolder, ...editPopup } = useTogglePayloadPopup();

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      required: true,
      mapper: (v, item) => (
        <ActionBox status={deleteStatus}>
          <SpoilerPopupButton onClick={() => editPopup.onToggle(true, item)}>
            Изменить
          </SpoilerPopupButton>
          <SpoilerPopupButton onClick={() => deleteHolder({ id: item.id })}>
            Удалить
          </SpoilerPopupButton>
        </ActionBox>
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
      mapper: (v, item: Api.Models.Holder) => splitHolderName(item),
    },
    {
      key: "description",
      header: "Дополнение",
      mapper: (v, item: Api.Models.Holder) => item.description ?? "",
    },
  ];

  const [bind] = useInput({});

  const tableItems = holders.items.map((holder) => holder);

  // const noticeContext = React.useContext(NoticeContext);

  /*


  */
  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <PopupLayer>
        <ItemEditPopup
          {...editPopup}
          status={editStatus}
          defaults={editedHolder}
          onSubmit={(payload) =>
            editHolder({
              id: editedHolder.id,
              firstName: payload.firstName,
              lastName: payload.lastName,
              middleName: payload.middleName,
              description: payload.description,
            })
          }
          items={[
            {
              name: "lastName",
              content: ({ bind, name, disabled }) => (
                <Input {...bind} required label="Фамилия" name={name} />
              ),
            },
            {
              name: "firstName",
              nullable: true,
              content: ({ bind, name }) => (
                <Input {...bind} required label="Имя" name={name} />
              ),
            },
            {
              name: "middleName",
              nullable: true,
              content: ({ bind, name }) => (
                <Input {...bind} required label="Отчество" name={name} />
              ),
            },
            {
              name: "description",
              nullable: true,
              content: ({ bind, name }) => (
                <Input {...bind} label="Дополнение" name={name} />
              ),
            },
          ]}
        />
      </PopupLayer>
      <TopBarLayer>
        {/* <Layout> */}
        <Form
          style={{ flexFlow: "row", flex: "1" }}
          input={bind.input}
          onSubmit={(data) => {
            // onSubmit(data);
            createHolder(data as any);
            // noticeContext.createNotice("Пользователь создан");
          }}
        >
          {/* <Layout flow="row"> */}
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
          <Input
            label="Дополнение"
            placeholder="..."
            {...bind}
            name="description"
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
          {/* </Layout> */}
        </Form>
      </TopBarLayer>
      <Header align="right">Список владельцев ({holders.items.length})</Header>
      <WithLoader status={holders.status}>
        <Table items={tableItems} columns={columns} />
      </WithLoader>
      {/* </Layout> */}
    </>
  );
};

export default Holders;
