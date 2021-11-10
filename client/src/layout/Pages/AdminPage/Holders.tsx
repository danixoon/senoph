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
import { useDepartmentName } from "hooks/misc/useDepartmentName";
import { useHolderName } from "hooks/misc/useHolderName";
import { useInput } from "hooks/useInput";
import React from "react";
import { api } from "store/slices/api";

export type HoldersProps = {};

const useContainer = () => {
  const holders = api.useFetchHoldersQuery({});
  const departments = api.useFetchDepartmentsQuery({});
  const [deleteHolder] = api.useDeleteHolderMutation();
  const [createHolder] = api.useCreateHolderMutation();
  const getHolderName = useHolderName();
  const getDepartmentName = useDepartmentName();

  return {
    holders: { ...holders, items: holders.data?.items ?? [] },
    departments: { ...departments, items: departments.data?.items ?? [] },
    deleteHolder,
    createHolder,
    getHolderName,
    getDepartmentName,
  };
};

const Holders: React.FC<HoldersProps> = (props) => {
  const {
    holders,
    departments,
    deleteHolder,
    createHolder,
    getHolderName,
    getDepartmentName,
  } = useContainer();

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      mapper: (v, item) => (
        <ActionBox onDelete={() => deleteHolder({ id: item.id })} />
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

      // size: "150px",
    },
    {
      key: "departmentId",
      header: "Подразделение",
      mapper: (v) => getDepartmentName(v),
      // size: "150px",
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
              label="Имя"
              {...bind}
              name="firstName"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="Фамилия"
              {...bind}
              name="lastName"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="Отчество"
              {...bind}
              name="middleName"
              style={{ flex: "1" }}
            />
            <Dropdown
              required
              style={{ flex: "1" }}
              label="Подразделение"
              name="departmentId"
              items={departments.items.map((dep) => ({
                id: dep.id,
                label: dep.name,
              }))}
              {...bind}
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
          Список владельцев ({holders.items.length})
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

export default Holders;
