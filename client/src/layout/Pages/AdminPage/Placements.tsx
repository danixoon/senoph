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
import { useTogglePayloadPopup } from "hooks/useTogglePopup";
import ItemEditPopup from "layout/Popups/ItemEditPopup";
import { NoticeContext } from "providers/NoticeProvider";
import PopupLayer from "providers/PopupLayer";
import TopBarLayer from "providers/TopBarLayer";
import React from "react";
import { api } from "store/slices/api";
import { extractStatus } from "store/utils";
import columnTypes from "utils/columns";

export type PlacementsProps = {};

const usePlacementsContainer = () => {
  const placements = api.useFetchPlacementsQuery({});
  const [deletePlacement, deleteStatus] = api.useDeletePlacementMutation();
  const [createPlacement, createStatus] = api.useCreatePlacementMutation();
  const [editPlacement, editStatus] = api.useEditPlacementMutation();

  return {
    placements: {
      ...placements,
      items: placements.data?.items ?? [],
      status: extractStatus(placements, true),
    },
    deletePlacement,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    editStatus: extractStatus(editStatus),
    createPlacement,
    editPlacement,
  };
};

const Departments: React.FC<PlacementsProps> = (props) => {
  const {
    placements,
    deletePlacement,
    createPlacement,
    deleteStatus,
    createStatus,
    editPlacement,
    editStatus,
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
      required: true,
      mapper: (v, item: Api.Models.Placement) => (
        <ActionBox status={deleteStatus}>
          <SpoilerPopupButton onClick={() => editPopup.onToggle(true, item)}>
            Изменить
          </SpoilerPopupButton>
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
    ...columnTypes.entityDates(),
  ];

  const [bind] = useInput({});

  const tableItems = placements.items.map((department) => department);

  const { state: editedPlacement, ...editPopup } = useTogglePayloadPopup();

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <PopupLayer>
        <ItemEditPopup
          {...editPopup}
          status={editStatus}
          defaults={editedPlacement}
          onSubmit={(payload) =>
            editPlacement({
              id: editedPlacement.id,
              name: payload.name,
              description: payload.descriotion,
            })
          }
          items={[
            {
              name: "name",
              content: ({ bind, name, disabled }) => (
                <Input
                  {...bind}
                  required
                  label="Наименование"
                  name={name}
                  disabled={disabled}
                />
              ),
            },
            {
              name: "description",
              content: ({ bind, name, disabled }) => (
                <Input
                  {...bind}
                  label="Описание"
                  name={name}
                  disabled={disabled}
                />
              ),
            },
          ]}
        />
      </PopupLayer>
      {/* <Layout> */}
      <TopBarLayer>
        <Layout flex="1">
          <Form
            input={bind.input}
            style={{ flex: "1", flexFlow: "row" }}
            onSubmit={(data) => {
              // onSubmit(data);
              createPlacement(data as any);
              // noticeContext.createNotice("Пользователь создан");
            }}
          >
            {/* <Layout flow="row"> */}
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
            {/* </Layout> */}
          </Form>
          <Header align="right">
            Список местоположений ({placements.items.length})
          </Header>
        </Layout>
      </TopBarLayer>
      {/* <Hr /> */}

      <WithLoader status={placements.status}>
        <Table stickyTop={86} items={tableItems} columns={columns} />
      </WithLoader>
    </>
  );
};

export default Departments;
