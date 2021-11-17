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
import { NoticeContext } from "providers/NoticeProvider";
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
        <ActionBox
          status={deleteStatus}
          onDelete={() => deletePhoneType({ id: item.id })}
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
              {...bind}
              name="name"
              style={{ flex: "1" }}
            />
            <Input
              label="Описание"
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
          Список типов средств связи ({phoneTypes.items.length})
        </Header>
        <Table items={tableItems} columns={columns} />
      </Layout>
    </>
  );
};

const ActionBox = (props: { status: ApiStatus; onDelete: () => void }) => {
  const { status } = props;
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
        <SpoilerPopupButton
          onClick={() => !status.isLoading && props.onDelete()}
        >
          {status.isLoading ? <LoaderIcon /> : "Удалить"}
        </SpoilerPopupButton>
      </SpoilerPopup>
    </Button>
  );
};

export default PhoneTypes;
