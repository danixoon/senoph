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
import { useInput } from "hooks/useInput";
import ItemEditPopup from "layout/Popups/ItemEditPopup";
import { NoticeContext } from "providers/NoticeProvider";
import PopupLayer from "providers/PopupLayer";
import React from "react";
import { api } from "store/slices/api";
import { extractStatus } from "store/utils";

export type PhoneTypesProps = {};

const useContainer = () => {
  const phoneTypes = api.useFetchPhoneTypesQuery({});
  const [deletePhoneType, deleteStatus] = api.useDeletePhoneTypeMutation();
  const [createPhoneType, createStatus] = api.useCreatePhoneTypeMutation();

  return {
    phoneTypes: { ...phoneTypes, items: phoneTypes.data?.items ?? [] },
    deletePhoneType,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    createPhoneType,
  };
};

const PhoneTypes: React.FC<PhoneTypesProps> = (props) => {
  const {
    phoneTypes,
    deletePhoneType,
    createPhoneType,
    createStatus,
    deleteStatus,
  } = useContainer();

  const noticeContext = React.useContext(NoticeContext);

  React.useEffect(() => {
    if (createStatus.isLoading) noticeContext.createNotice("Создание типа...");
    if (createStatus.isSuccess)
      noticeContext.createNotice("Тип успешно создан.");
    if (createStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при создании типа: (${createStatus.error?.name}) ${createStatus.error?.description}`
      );
  }, [createStatus.status]);

  React.useEffect(() => {
    if (deleteStatus.isLoading) noticeContext.createNotice("Удаление типа...");
    if (deleteStatus.isSuccess)
      noticeContext.createNotice("Тип успешно удален.");
    if (deleteStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при удалении типа: (${deleteStatus.error?.name}) ${deleteStatus.error?.description}`
      );
  }, [deleteStatus.status]);

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      mapper: (v, item) => (
        <ActionBox status={deleteStatus}>
          <SpoilerPopupButton onClick={() => deletePhoneType({ id: item.id })}>
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
      header: "Наименование типа",
      // size: "150px",
    },
    {
      key: "description",
      header: "Описание",
      // size: "150px",
    },
  ];

  const [bind] = useInput({});

  const tableItems = phoneTypes.items.map((type) => type);

  // const noticeContext = React.useContext(NoticeContext);

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
          ]}
        />
      </PopupLayer>
      <Layout>
        <Form
          input={bind.input}
          onSubmit={(data) => {
            // onSubmit(data);
            createPhoneType(data as any);
            // noticeContext.createNotice("Пользователь создан");
          }}
        >
          <Layout flow="row">
            <Input
              required
              label="Наименование"
              placeholder="Средство связи"
              {...bind}
              name="name"
              style={{ flex: "1" }}
            />
            <Input
              label="Описание"
              {...bind}
              placeholder="Дополнительная информация"
              name="description"
              style={{ flex: "1" }}
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
              {createStatus.isLoading ? <LoaderIcon /> : "Создать"}
            </Button>
          </Layout>
        </Form>
        <Hr />
        <Header align="right">
          Список типов средств связи ({phoneTypes.items.length})
        </Header>
        <Table items={tableItems} columns={columns} />
      </Layout>
    </>
  );
};

export default PhoneTypes;
