import ActionBox from "components/ActionBox";
import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import InfoBanner from "components/InfoBanner";
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
import React from "react";
import { api } from "store/slices/api";
import { extractStatus, mergeStatuses, parseItems } from "store/utils";

export type BackupsProps = {};

const useContainer = () => {
  const backups = api.useFetchBackupsQuery({});
  const [createBackup, createStatus] = api.useCreateBackupMutation();
  const [revertBackup, revertStatus] = api.useRevertBackupMutation();
  const [removeBackup, removeStatus] = api.useRemoveBackupMutation();

  return {
    backups: {
      ...parseItems(backups),
      revert: { status: extractStatus(revertStatus), exec: revertBackup },
      create: { status: extractStatus(createStatus), exec: createBackup },
      remove: { status: extractStatus(removeStatus), exec: removeBackup },
    },
  };
};

const Departments: React.FC<BackupsProps> = (props) => {
  const { backups } = useContainer();

  useNotice(backups.revert.status, {
    success: "Резеврная копия успешно восстановлена",
    error: "Ошибка восстановления резеврной копии",
  });

  useNotice(backups.create.status, {
    success: "Резервная копия успешно создана",
    error: "Ошибка создания резеврной копии",
  });

  const columns: TableColumn<Api.Models.Backup>[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      mapper: (v, item: Api.Models.Backup) => (
        <ActionBox
          status={mergeStatuses(backups.revert.status, backups.remove.status)}
        >
          <SpoilerPopupButton
            onClick={() => backups.revert.exec({ id: item.id })}
          >
            Восстановить
          </SpoilerPopupButton>
          <SpoilerPopupButton
            onClick={() => backups.revert.exec({ id: item.id })}
          >
            Скачать
          </SpoilerPopupButton>
          <SpoilerPopupButton
            onClick={() => backups.remove.exec({ id: item.id })}
          >
            Удалить
          </SpoilerPopupButton>
        </ActionBox>
      ),
    },
    {
      key: "id",
      header: "ID",
      // size: "300px",
    },
    {
      key: "tag",
      header: "Метка",
      size: "100px",
    },
    {
      key: "date",
      header: "Дата",
      type: "local-date",
      size: "100px",
    },
    {
      key: "size",
      header: "Размер",
      mapper: (v, item) => {
        const mbytes = item.size / 1024 / 1024;
        return `${mbytes.toFixed(2)} мб.`;
      },
    },
  ];

  const [bind] = useInput({});

  return (
    <>
      <Layout flex="1">
        <Form
          input={bind.input}
          onSubmit={(data) => {
            backups.create.exec(data as any);
          }}
        >
          <Layout flow="row">
            <Input
              label="Метка"
              placeholder="normal"
              {...bind}
              name="tag"
              style={{ flex: "1" }}
            />
            <Button
              style={{
                marginTop: "auto",
                marginLeft: "auto",
                padding: "0 4rem",
              }}
              disabled={backups.create.status.isLoading}
              margin="md"
              type="submit"
              color="primary"
            >
              {backups.create.status.isLoading ? <LoaderIcon /> : "Создать"}
            </Button>
          </Layout>
        </Form>
        <Hr />
        <WithLoader status={backups.status}>
          <InfoBanner
            disabled={backups.data.total > 0}
            text="Резервные копии отсутствуют."
          >
            <Header align="right">
              Список резервных копий ({backups.data.items.length})
            </Header>

            <Table items={backups.data.items} columns={columns} />
          </InfoBanner>
        </WithLoader>
      </Layout>
    </>
  );
};

export default Departments;
