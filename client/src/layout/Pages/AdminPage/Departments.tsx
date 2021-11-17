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

export type DepartmentsProps = {};

const useDepartmentsContainer = () => {
  const departments = api.useFetchDepartmentsQuery({});
  const [deleteDepartment, deleteStatus] = api.useDeleteDepartmentMutation();
  const [createDepartment, createStatus] = api.useCreateDepartmentMutation();

  return {
    departments: { ...departments, items: departments.data?.items ?? [] },
    deleteDepartment,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    createDepartment,
  };
};

const Departments: React.FC<DepartmentsProps> = (props) => {
  const {
    departments,
    deleteDepartment,
    createDepartment,
    deleteStatus,
    createStatus,
  } = useDepartmentsContainer();

  const noticeContext = React.useContext(NoticeContext);

  React.useEffect(() => {
    if (createStatus.isLoading)
      noticeContext.createNotice("Создание подразделения...");
    if (createStatus.isSuccess)
      noticeContext.createNotice("Подразделение успешно создано.");
    if (createStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при создании подразделения: (${createStatus.error?.name}) ${createStatus.error?.description}`
      );
  }, [createStatus.status]);

  React.useEffect(() => {
    if (deleteStatus.isLoading)
      noticeContext.createNotice("Удаление подразделения...");
    if (deleteStatus.isSuccess)
      noticeContext.createNotice("Подразделение успешно удалено.");
    if (deleteStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при удалении подразделения: (${deleteStatus.error?.name}) ${deleteStatus.error?.description}`
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
          onDelete={() => deleteDepartment({ id: item.id })}
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
      header: "Подразделение",
      // size: "150px",
    },
    {
      key: "description",
      header: "Описание",
      // size: "150px",
    },
  ];

  const [bind] = useInput({});

  const tableItems = departments.items.map((department) => department);

  // const noticeContext = React.useContext(NoticeContext);

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <Layout>
        <Form
          input={bind.input}
          onSubmit={(data) => {
            // onSubmit(data);
            createDepartment(data as any);
            // noticeContext.createNotice("Пользователь создан");
          }}
        >
          <Layout flow="row">
            <Input
              required
              placeholder="Отделение связи и ИТ"
              label="Название"
              {...bind}
              name="name"
              style={{ flex: "1" }}
            />
            <Input
              label="Описание"
              placeholder="Дополнительная информация"
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
          </Layout>
        </Form>
        <Hr />
        <Header align="right">
          Список подразделений ({departments.items.length})
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
          {status.isLoading ? <LoaderIcon /> : "Удаление"}
        </SpoilerPopupButton>
      </SpoilerPopup>
    </Button>
  );
};

export default Departments;
