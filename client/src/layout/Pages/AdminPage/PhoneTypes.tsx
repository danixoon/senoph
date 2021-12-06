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
import { useTogglePayloadPopup } from "hooks/useTogglePopup";
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
  const [editPhoneType, editStatus] = api.useEditPhoneTypeMutation();

  return {
    phoneTypes: { ...phoneTypes, items: phoneTypes.data?.items ?? [] },
    deletePhoneType,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    editStatus: extractStatus(editStatus),
    createPhoneType,
    editPhoneType,
  };
};

const PhoneTypes: React.FC<PhoneTypesProps> = (props) => {
  const {
    phoneTypes,
    deletePhoneType,
    createPhoneType,
    editPhoneType,
    createStatus,
    deleteStatus,
    editStatus,
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

  const columns: TableColumn<DB.PhoneTypeAttributes>[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      mapper: (v, item) => (
        <ActionBox status={deleteStatus}>
          <SpoilerPopupButton onClick={() => editPopup.onToggle(true, item)}>
            Изменить
          </SpoilerPopupButton>
          <SpoilerPopupButton
            onClick={() => deletePhoneType({ id: item.id as number })}
          >
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
      key: "lifespan",
      header: "Срок службы",
      mapper: (v, item) => {
        const { lifespan } = item;
        if (lifespan == null) return "Не указан";

        if (lifespan < 12) return `${lifespan} мес.`;

        const years = Math.floor(lifespan / 12);
        const months = lifespan % 12;

        return `${years} л. ${months} мес.`;
      },
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

  const { state: editedPhoneType, ...editPopup } = useTogglePayloadPopup();

  // const noticeContext = React.useContext(NoticeContext);

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <PopupLayer>
        <ItemEditPopup
          {...editPopup}
          status={editStatus}
          defaults={editedPhoneType}
          onSubmit={(payload) =>
            editPhoneType({
              id: editedPhoneType.id,
              name: payload.name,
              description: payload.description,
              lifespan: payload.lifespan,
            })
          }
          items={[
            {
              name: "name",
              content: ({ bind, name, disabled }) => (
                <Input {...bind} required label="Наименование" name={name} />
              ),
            },
            {
              name: "lifespan",
              content: ({ bind, name, disabled }) => (
                <Input
                  {...bind}
                  label="Срок службы (в месяцах)"
                  type="number"
                  name={name}
                />
              ),
            },
            {
              name: "description",
              content: ({ bind, name, disabled }) => (
                <Input {...bind} label="Описание" name={name} />
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
