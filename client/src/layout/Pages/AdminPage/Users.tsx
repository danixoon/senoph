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
import { useInput } from "hooks/useInput";
import { useNotice } from "hooks/useNotice";
import { useTogglePayloadPopup, useTogglePopup } from "hooks/useTogglePopup";
import ItemEditPopup from "layout/Popups/ItemEditPopup";
import { NoticeContext } from "providers/NoticeProvider";
import PopupLayer from "providers/PopupLayer";
import TopBarLayer from "providers/TopBarLayer";
import React from "react";
import { api } from "store/slices/api";
import { extractStatus } from "store/utils";
import columnTypes from "utils/columns";

export type UsersProps = {};

const useUsersContainer = () => {
  const users = api.useFetchUsersQuery({});
  const [deleteUser, deleteStatus] = api.useDeleteUserMutation();
  const [createUser, createStatus] = api.useCreateUserMutation();
  const [editUser, editStatus] = api.useEditUserMutation();

  return {
    users: {
      ...users,
      items: users.data?.items ?? [],
      status: extractStatus(users, true),
    },
    deleteUser,
    createUser,
    editUser,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    editStatus: extractStatus(editStatus),
  };
};

const roleNameMapper = (role: Role) =>
  (({ admin: "Администратор", user: "Пользователь" } as Record<Role, string>)[
    role
  ] ?? "Неизвестно");

const Users: React.FC<UsersProps> = (props) => {
  const {
    users,
    deleteUser,
    createUser,
    editUser,
    createStatus,
    deleteStatus,
    editStatus,
  } = useUsersContainer();

  const noticeContext = React.useContext(NoticeContext);

  React.useEffect(() => {
    if (createStatus.isLoading)
      noticeContext.createNotice("Создание пользователя...");
    if (createStatus.isSuccess)
      noticeContext.createNotice("Пользователь успешно создан.");
    if (createStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при создании пользователя: (${createStatus.error?.name}) ${createStatus.error?.description}`
      );
  }, [createStatus.status]);

  React.useEffect(() => {
    if (deleteStatus.isLoading)
      noticeContext.createNotice("Удаление пользователя...");
    if (deleteStatus.isSuccess)
      noticeContext.createNotice("Пользователь успешно удален.");
    if (deleteStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при удалении пользователя: (${deleteStatus.error?.name}) ${deleteStatus.error?.description}`
      );
  }, [deleteStatus.status]);

  const { state: editedUser, ...editPopup } = useTogglePayloadPopup();

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
          <SpoilerPopupButton onClick={() => deleteUser({ id: item.id })}>
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
      key: "role",
      header: "Роль",
      size: "150px",
      mapper: (v) => roleNameMapper(v),
    },
    { key: "username", header: "Логин", size: "150px" },
    { key: "name", header: "Имя" },
    ...columnTypes.entityDates(),
  ];

  const [bind] = useInput({});

  const tableItems = users.items.map((user) => user);

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <PopupLayer>
        <ItemEditPopup
          {...editPopup}
          status={editStatus}
          defaults={editedUser}
          onSubmit={(payload) => editUser({ id: editedUser.id, ...payload })}
          items={[
            {
              name: "username",
              content: ({ bind, name }) => (
                <Input {...bind} required label="Логин" name={name} />
              ),
            },
            {
              name: "name",
              content: ({ bind, name }) => (
                <Input {...bind} required label="Имя" name={name} />
              ),
            },
            {
              name: "role",
              content: ({ bind, name }) => (
                <Dropdown
                  {...bind}
                  required
                  items={[
                    { label: "Администратор", id: "admin" },
                    { label: "Пользователь", id: "user" },
                  ]}
                  label="Роль"
                  name={name}
                />
              ),
            },
            {
              name: "password",
              content: ({ bind, name }) => (
                <Input {...bind} label="Пароль" type="password" name={name} />
              ),
            },
          ]}
        />
      </PopupLayer>
      <TopBarLayer>
        <Layout flex="1">
          <Form
            style={{ flexFlow: "row", flex: "1" }}
            input={bind.input}
            onSubmit={(data) => {
              createUser(data as any);
            }}
          >
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
              placeholder="Ivan"
              label="Логин пользователя"
              {...bind}
              name="username"
              style={{ flex: "1" }}
            />
            <Input
              required
              placeholder="Иван Иванович"
              label="Имя пользователя"
              {...bind}
              name="name"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="Пароль"
              placeholder="*********"
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
              {createStatus.isLoading ? <LoaderIcon /> : "Создать"}
            </Button>
          </Form>
          <Header align="right">
            Список пользователей ({users.items.length})
          </Header>
        </Layout>
      </TopBarLayer>
      <WithLoader status={users.status}>
        <Table stickyTop={91} items={tableItems} columns={columns} />
      </WithLoader>
    </>
  );
};

// const ActionBox = (props: { status: ApiStatus; onDelete: () => void }) => {
//   // const { commit } = props;
//   const [target, setTarget] = React.useState<HTMLElement | null>(() => null);
//   const [isOpen, setIsOpen] = React.useState(() => false);

//   return (
//     <Button
//       ref={(r) => setTarget(r)}
//       color="primary"
//       inverted
//       onClick={() => setIsOpen(true)}
//     >
//       <Icon.Box />
//       <SpoilerPopup
//         target={isOpen ? target : null}
//         position="right"
//         onBlur={(e) => {
//           if (e.currentTarget.contains(e.relatedTarget as any))
//             e.preventDefault();
//           else setIsOpen(false);
//         }}
//       >
//         <SpoilerPopupButton
//           onClick={() => !props.status.isLoading && props.onDelete()}
//         >
//           {props.status.isLoading ? <LoaderIcon /> : "Удалить"}
//         </SpoilerPopupButton>
//       </SpoilerPopup>
//     </Button>
//   );
// };

export default Users;
