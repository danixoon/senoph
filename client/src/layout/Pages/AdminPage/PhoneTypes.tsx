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

export type PhoneTypesProps = {};

const useContainer = () => {
  const phoneTypes = api.useFetchPhoneTypesQuery({});
  const [deletePhoneType, deleteStatus] = api.useDeletePhoneTypeMutation();
  const [createPhoneType, createStatus] = api.useCreatePhoneTypeMutation();
  const [editPhoneType, editStatus] = api.useEditPhoneTypeMutation();

  return {
    phoneTypes: {
      ...phoneTypes,
      items: phoneTypes.data?.items ?? [],
      status: extractStatus(phoneTypes, true),
    },
    deletePhoneType,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    editStatus: extractStatus(editStatus),
    createPhoneType,
    editPhoneType,
  };
};

const PhoneTypes: React.FC<PhoneTypesProps> = (props) => {
  const {
    phoneTypes,
    deletePhoneType,
    createPhoneType,
    editPhoneType,
    createStatus,
    deleteStatus,
    editStatus,
  } = useContainer();

  const noticeContext = React.useContext(NoticeContext);

  React.useEffect(() => {
    if (createStatus.isLoading) noticeContext.createNotice("???????????????? ????????...");
    if (createStatus.isSuccess)
      noticeContext.createNotice("?????? ?????????????? ????????????.");
    if (createStatus.isError)
      noticeContext.createNotice(
        `?????????????????? ???????????? ?????? ???????????????? ????????: (${createStatus.error?.name}) ${createStatus.error?.description}`
      );
  }, [createStatus.status]);

  React.useEffect(() => {
    if (deleteStatus.isLoading) noticeContext.createNotice("???????????????? ????????...");
    if (deleteStatus.isSuccess)
      noticeContext.createNotice("?????? ?????????????? ????????????.");
    if (deleteStatus.isError)
      noticeContext.createNotice(
        `?????????????????? ???????????? ?????? ???????????????? ????????: (${deleteStatus.error?.name}) ${deleteStatus.error?.description}`
      );
  }, [deleteStatus.status]);

  const columns: TableColumn<DB.PhoneTypeAttributes>[] = [
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
          <SpoilerPopupButton
            onClick={() => deletePhoneType({ id: item.id as number })}
          >
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
      header: "???????????????????????? ????????",
      // size: "150px",
    },
    {
      key: "lifespan",
      header: "???????? ????????????",
      mapper: (v, item) => {
        const { lifespan } = item;
        if (lifespan == null) return "???? ????????????";

        if (lifespan < 12) return `${lifespan} ??????.`;

        const years = Math.floor(lifespan / 12);
        const months = lifespan % 12;

        return `${years} ??. ${months} ??????.`;
      },
      // size: "150px",
    },
    {
      key: "description",
      header: "????????????????",
      // size: "150px",
    },
    ...columnTypes.entityDates() as any,
  ];

  const [bind] = useInput({});

  const tableItems = phoneTypes.items.map((type) => type);

  const { state: editedPhoneType, ...editPopup } = useTogglePayloadPopup();

  // const noticeContext = React.useContext(NoticeContext);

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <PopupLayer>
        <ItemEditPopup
          {...editPopup}
          status={editStatus}
          defaults={editedPhoneType}
          onSubmit={(payload) =>
            editPhoneType({
              id: editedPhoneType.id,
              name: payload.name,
              description: payload.description,
              lifespan: payload.lifespan,
            })
          }
          items={[
            {
              name: "name",
              content: ({ bind, name, disabled }) => (
                <Input {...bind} required label="????????????????????????" name={name} />
              ),
            },
            {
              name: "lifespan",
              content: ({ bind, name, disabled }) => (
                <Input
                  {...bind}
                  label="???????? ???????????? (?? ??????????????)"
                  type="number"
                  name={name}
                />
              ),
            },
            {
              name: "description",
              content: ({ bind, name, disabled }) => (
                <Input {...bind} label="????????????????" name={name} />
              ),
            },
          ]}
        />
      </PopupLayer>
      <TopBarLayer>
        <Layout flex="1">
          <Form
            style={{ flex: "1", flexFlow: "row" }}
            input={bind.input}
            onSubmit={(data) => {
              // onSubmit(data);
              createPhoneType(data as any);
              // noticeContext.createNotice("???????????????????????? ????????????");
            }}
          >
            {/* <Layout flow="row"> */}
            <Input
              required
              label="????????????????????????"
              placeholder="???????????????? ??????????"
              {...bind}
              name="name"
              style={{ flex: "1" }}
            />
            <Input
              label="????????????????"
              {...bind}
              placeholder="???????????????????????????? ????????????????????"
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
              {createStatus.isLoading ? <LoaderIcon /> : "??????????????"}
            </Button>
            {/* </Layout> */}
          </Form>
          <Header align="right">
            ???????????? ?????????? ?????????????? ?????????? ({phoneTypes.items.length})
          </Header>
        </Layout>
        {/* <Hr /> */}
      </TopBarLayer>

      <WithLoader status={phoneTypes.status}>
        <Table stickyTop={86} items={tableItems} columns={columns} />
      </WithLoader>
      {/* </Layout> */}
    </>
  );
};

export default PhoneTypes;
