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
import { useDepartment } from "hooks/misc/department";
import { splitHolderName, useHolder } from "hooks/misc/holder";
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

export type HoldersProps = {};

const useContainer = () => {
  const holders = api.useFetchHoldersQuery({});
  const [deleteHolder, deleteStatus] = api.useDeleteHolderMutation();
  const [createHolder, createStatus] = api.useCreateHolderMutation();
  const [editHolder, editStatus] = api.useEditHolderMutation();
  const getHolderName = useHolder();

  return {
    holders: {
      ...holders,
      items: holders.data?.items ?? [],
      status: extractStatus(holders, true),
    },
    deleteHolder,
    createHolder,
    editHolder,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    editStatus: extractStatus(editStatus),
    getHolderName,
  };
};

const Holders: React.FC<HoldersProps> = (props) => {
  const {
    holders,
    deleteHolder,
    createHolder,
    editHolder,
    createStatus,
    deleteStatus,
    editStatus,
    getHolderName,
  } = useContainer();

  const noticeContext = React.useContext(NoticeContext);

  React.useEffect(() => {
    if (createStatus.isLoading)
      noticeContext.createNotice("???????????????? ??????????????????...");
    if (createStatus.isSuccess)
      noticeContext.createNotice("???????????????? ?????????????? ????????????.");
    if (createStatus.isError)
      noticeContext.createNotice(
        `?????????????????? ???????????? ?????? ???????????????? ??????????????????: (${createStatus.error?.name}) ${createStatus.error?.description}`
      );
  }, [createStatus.status]);

  React.useEffect(() => {
    if (deleteStatus.isLoading)
      noticeContext.createNotice("???????????????? ??????????????????...");
    if (deleteStatus.isSuccess)
      noticeContext.createNotice("???????????????? ?????????????? ????????????.");
    if (deleteStatus.isError)
      noticeContext.createNotice(
        `?????????????????? ???????????? ?????? ???????????????? ??????????????????: (${deleteStatus.error?.name}) ${deleteStatus.error?.description}`
      );
  }, [deleteStatus.status]);

  const { state: editedHolder, ...editPopup } = useTogglePayloadPopup();

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      required: true,
      mapper: (v, item) => (
        <ActionBox status={deleteStatus}>
          <SpoilerPopupButton onClick={() => editPopup.onToggle(true, item)}>
            ????????????????
          </SpoilerPopupButton>
          <SpoilerPopupButton onClick={() => deleteHolder({ id: item.id })}>
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
      header: "??????",
      mapper: (v, item: Api.Models.Holder) => splitHolderName(item),
    },
    {
      key: "description",
      header: "????????????????????",
      mapper: (v, item: Api.Models.Holder) => item.description ?? "",
    },
    ...columnTypes.entityDates(),
  ];

  const [bind] = useInput({});

  const tableItems = holders.items.map((holder) => holder);

  // const noticeContext = React.useContext(NoticeContext);

  /*


  */
  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <PopupLayer>
        <ItemEditPopup
          {...editPopup}
          status={editStatus}
          defaults={editedHolder}
          onSubmit={(payload) =>
            editHolder({
              id: editedHolder.id,
              firstName: payload.firstName,
              lastName: payload.lastName,
              middleName: payload.middleName,
              description: payload.description,
            })
          }
          items={[
            {
              name: "lastName",
              content: ({ bind, name, disabled }) => (
                <Input {...bind} required label="??????????????" name={name} />
              ),
            },
            {
              name: "firstName",
              nullable: true,
              content: ({ bind, name }) => (
                <Input {...bind} required label="??????" name={name} />
              ),
            },
            {
              name: "middleName",
              nullable: true,
              content: ({ bind, name }) => (
                <Input {...bind} required label="????????????????" name={name} />
              ),
            },
            {
              name: "description",
              nullable: true,
              content: ({ bind, name }) => (
                <Input {...bind} label="????????????????????" name={name} />
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
              createHolder(data as any);
              // noticeContext.createNotice("???????????????????????? ????????????");
            }}
          >
            {/* <Layout flow="row"> */}
            <Input
              required
              placeholder="????????????"
              label="??????????????"
              {...bind}
              name="lastName"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="??????"
              placeholder="????????"
              {...bind}
              name="firstName"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="????????????????"
              placeholder="????????????????"
              {...bind}
              name="middleName"
              style={{ flex: "1" }}
            />
            <Input
              label="????????????????????"
              placeholder="..."
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
            {/* </Layout> */}
          </Form>
          <Header align="right">
            ???????????? ???????????????????? ({holders.items.length})
          </Header>
        </Layout>
      </TopBarLayer>
      <WithLoader status={holders.status}>
        <Table stickyTop={86} items={tableItems} columns={columns} />
      </WithLoader>
      {/* </Layout> */}
    </>
  );
};

export default Holders;
