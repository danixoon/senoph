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
import { useNotice } from "hooks/useNotice";
import { NoticeContext } from "providers/NoticeProvider";
import React from "react";
import { api } from "store/slices/api";
import { extractStatus } from "store/utils";

export type PlacementsProps = {};

const usePlacementsContainer = () => {
  const placements = api.useFetchPlacementsQuery({});
  const [deletePlacement, deleteStatus] = api.useDeletePlacementMutation();
  const [createPlacement, createStatus] = api.useCreatePlacementMutation();

  return {
    placements: { ...placements, items: placements.data?.items ?? [] },
    deletePlacement,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    createPlacement,
  };
};

const Departments: React.FC<PlacementsProps> = (props) => {
  const {
    placements,
    deletePlacement,
    createPlacement,
    deleteStatus,
    createStatus,
  } = usePlacementsContainer();

  const noticeContext = React.useContext(NoticeContext);

  useNotice(deleteStatus, {
    success: "Местоположение успешно удалено",
    error: "Ошибка удаления подразделения",
  });

  useNotice(createStatus, {
    success: "Местоположение успешно создано",
    error: "Ошибка создания подразделения",
  });

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      mapper: (v, item: Api.Models.Placement) => (
        <ActionBox status={deleteStatus}>
          <SpoilerPopupButton onClick={() => deletePlacement({ id: item.id })}>
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
      header: "Наименование",
      // size: "150px",
    },
    {
      key: "description",
      header: "Описание",
      // size: "150px",
    },
  ];

  const [bind] = useInput({});

  const tableItems = placements.items.map((department) => department);

  // const noticeContext = React.useContext(NoticeContext);

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <Layout>
        <Form
          input={bind.input}
          onSubmit={(data) => {
            // onSubmit(data);
            createPlacement(data as any);
            // noticeContext.createNotice("Пользователь создан");
          }}
        >
          <Layout flow="row">
            <Input
              required
              placeholder="Консультативный корпус"
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
          Список местоположений ({placements.items.length})
        </Header>
        <Table items={tableItems} columns={columns} />
      </Layout>
    </>
  );
};

export default Departments;
