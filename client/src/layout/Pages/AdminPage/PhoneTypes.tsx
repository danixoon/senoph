import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { useInput } from "hooks/useInput";
import React from "react";
import { api } from "store/slices/api";

export type PhoneTypesProps = {};

const useContainer = () => {
  const phoneTypes = api.useFetchPhoneTypesQuery({});
  const [deletePhoneType] = api.useDeletePhoneTypeMutation();
  const [createPhoneType] = api.useCreatePhoneTypeMutation();

  return {
    phoneTypes: { ...phoneTypes, items: phoneTypes.data?.items ?? [] },
    deletePhoneType,
    createPhoneType,
  };
};

const PhoneTypes: React.FC<PhoneTypesProps> = (props) => {
  const { phoneTypes, deletePhoneType, createPhoneType } =
    useContainer();

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      mapper: (v, item) => (
        <ActionBox onDelete={() => deletePhoneType({ id: item.id })} />
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

const ActionBox = (props: { onDelete: () => void }) => {
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
          Удалить
        </SpoilerPopupButton>
      </SpoilerPopup>
    </Button>
  );
};

export default PhoneTypes;
