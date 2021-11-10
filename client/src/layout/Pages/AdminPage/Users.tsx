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

export type UsersProps = {};

const useUsersContainer = () => {
  const users = api.useFetchUsersQuery({});
  const [deleteUser] = api.useDeleteUserMutation();
  const [createUser] = api.useCreateUserMutation();

  return {
    users: { ...users, items: users.data?.items ?? [] },
    deleteUser,
    createUser,
  };
};

const roleNameMapper = (role: Role) =>
  (({ admin: "Администратор", user: "Пользователь" } as Record<Role, string>)[
    role
  ] ?? "Неизвестно");

const Users: React.FC<UsersProps> = (props) => {
  const { users, deleteUser, createUser } = useUsersContainer();

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      mapper: (v, item) => (
        <ActionBox onDelete={() => deleteUser({ id: item.id })} />
      ),
    },

    {
      key: "id",
      header: "ID",
      size: "30px",
    },
    {
      key: "role",
      header: "Роль",
      size: "150px",
      mapper: (v) => roleNameMapper(v),
    },
    { key: "username", header: "Логин", size: "150px" },
    { key: "name", header: "Имя" },
  ];

  const [bind] = useInput({});

  const tableItems = users.items.map((user) => user);

  // const noticeContext = React.useContext(NoticeContext);

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <Layout>
        <Form
          input={bind.input}
          onSubmit={(data) => {
            // onSubmit(data);
            createUser(data as any);
            // noticeContext.createNotice("Пользователь создан");
          }}
        >
          <Layout flow="row">
            <Dropdown
              required
              style={{ flex: "1" }}
              label="Роль"
              name="role"
              items={[
                { id: "user", label: "Пользователь" },
                { id: "admin", label: "Администратор" },
              ]}
              {...bind}
            />
            <Input
              required
              label="Логин пользователя"
              {...bind}
              name="username"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="Имя пользователя"
              {...bind}
              name="name"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="Пароль"
              {...bind}
              name="password"
              style={{ flex: "1" }}
              type="password"
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
          Список пользователей ({users.items.length})
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

export default Users;
