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
import { useTogglePayloadPopup } from "hooks/useTogglePopup";
import ItemEditPopup from "layout/Popups/ItemEditPopup";
import { NoticeContext } from "providers/NoticeProvider";
import PopupLayer from "providers/PopupLayer";
import TopBarLayer from "providers/TopBarLayer";
import React from "react";
import { api } from "store/slices/api";
import { extractStatus } from "store/utils";
import columnTypes from "utils/columns";

export type DepartmentsProps = {};

const useDepartmentsContainer = () => {
  const placements = api.useFetchPlacementsQuery({});
  const departments = api.useFetchDepartmentsQuery({});
  const [deleteDepartment, deleteStatus] = api.useDeleteDepartmentMutation();
  const [createDepartment, createStatus] = api.useCreateDepartmentMutation();
  const [editDepartment, editStatus] = api.useEditDepartmentMutation();

  return {
    departments: {
      ...departments,
      items: departments.data?.items ?? [],
      status: extractStatus(departments, true),
    },
    placements: { ...placements, items: placements.data?.items ?? [] },
    deleteDepartment,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    editStatus: extractStatus(editStatus),
    createDepartment,
    editDepartment,
  };
};

const Departments: React.FC<DepartmentsProps> = (props) => {
  const {
    departments,
    placements,
    deleteDepartment,
    createDepartment,
    editDepartment,
    deleteStatus,
    editStatus,
    createStatus,
  } = useDepartmentsContainer();

  const noticeContext = React.useContext(NoticeContext);

  React.useEffect(() => {
    if (createStatus.isLoading)
      noticeContext.createNotice("???????????????? ??????????????????????????...");
    if (createStatus.isSuccess)
      noticeContext.createNotice("?????????????????????????? ?????????????? ??????????????.");
    if (createStatus.isError)
      noticeContext.createNotice(
        `?????????????????? ???????????? ?????? ???????????????? ??????????????????????????: (${createStatus.error?.name}) ${createStatus.error?.description}`
      );
  }, [createStatus.status]);

  React.useEffect(() => {
    if (deleteStatus.isLoading)
      noticeContext.createNotice("???????????????? ??????????????????????????...");
    if (deleteStatus.isSuccess)
      noticeContext.createNotice("?????????????????????????? ?????????????? ??????????????.");
    if (deleteStatus.isError)
      noticeContext.createNotice(
        `?????????????????? ???????????? ?????? ???????????????? ??????????????????????????: (${deleteStatus.error?.name}) ${deleteStatus.error?.description}`
      );
  }, [deleteStatus.status]);

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      required: true,
      mapper: (v, item) => (
        <ActionBox status={deleteStatus}>
          <SpoilerPopupButton
            onClick={() =>
              editPopup.onToggle(true, {
                id: item.id,
                name: item.name,
                placementId: item.placementId,
                description: item.description,
              })
            }
          >
            ????????????????
          </SpoilerPopupButton>
          <SpoilerPopupButton onClick={() => deleteDepartment({ id: item.id })}>
            ??????????????
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
      header: "??????????????????????????",
      // size: "150px",
    },
    {
      key: "placementId",
      header: "????????????????????????????",
      mapper: (v, item: Api.Models.Department) =>
        item.placement?.name ?? "???? ????????????",
      // size: "150px",
    },
    {
      key: "description",
      header: "????????????????",
      // size: "150px",
    },
    ...columnTypes.entityDates(),
  ];

  const [bind] = useInput({});

  const tableItems = departments.items.map((department) => department);

  // const noticeContext = React.useContext(NoticeContext);

  const { state: editedDepartment, ...editPopup } = useTogglePayloadPopup();

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <PopupLayer>
        <ItemEditPopup
          {...editPopup}
          status={editStatus}
          defaults={editedDepartment}
          onSubmit={(payload) =>
            editDepartment({ id: editedDepartment.id, ...payload })
          }
          items={[
            {
              name: "name",
              content: ({ bind, name, disabled }) => (
                <Input
                  {...bind}
                  required
                  label="????????????????????????"
                  name={name}
                  disabled={disabled}
                />
              ),
            },
            {
              name: "placementId",
              nullable: true,
              content: ({ bind, name, disabled }) => (
                <Dropdown
                  {...bind}
                  items={placements.items.map((place) => ({
                    label: place.name,
                    id: place.id,
                  }))}
                  label="????????????????????????????"
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
                  label="????????????????"
                  name={name}
                  disabled={disabled}
                />
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
              // onSubmit(data);
              createDepartment(data as any);
              // noticeContext.createNotice("???????????????????????? ????????????");
            }}
          >
            <Input
              required
              placeholder="?????????????????? ?????????? ?? ????"
              label="????????????????"
              {...bind}
              name="name"
              style={{ flex: "1" }}
            />
            <Dropdown
              style={{ flex: "1" }}
              label="????????????????????????????"
              items={placements.items.map((item) => ({
                id: item.id,
                label: item.name,
              }))}
              name="placementId"
              {...bind}
            />
            <Input
              label="????????????????"
              placeholder="???????????????????????????? ????????????????????"
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
              {createStatus.isLoading ? <LoaderIcon /> : "??????????????"}
            </Button>
          </Form>
          <Header align="right">
            ???????????? ?????????????????????????? ({departments.items.length})
          </Header>
        </Layout>
      </TopBarLayer>
      <WithLoader status={departments.status}>
        <Table stickyTop={91} items={tableItems} columns={columns} />
      </WithLoader>
    </>
  );
};
export default Departments;
