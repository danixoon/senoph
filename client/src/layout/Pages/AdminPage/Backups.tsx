import { exportBackup, importBackup } from "api/import";
import qu from "@reduxjs/toolkit/query";
import ActionBox from "components/ActionBox";
import Button from "components/Button";
import Checkbox from "components/Checkbox";
import Dropdown from "components/Dropdown";
import Form, { FormContext } from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import InfoBanner from "components/InfoBanner";
import Input from "components/Input";
import Layout from "components/Layout";
import Link from "components/Link";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import WithLoader from "components/WithLoader";
import { useFileInput, useInput } from "hooks/useInput";
import { useNotice } from "hooks/useNotice";
import { useTogglePayloadPopup } from "hooks/useTogglePopup";
import ItemEditPopup from "layout/Popups/ItemEditPopup";
import { NoticeContext } from "providers/NoticeProvider";
import PopupLayer from "providers/PopupLayer";
import TopBarLayer from "providers/TopBarLayer";
import React from "react";
import { useQueryCache } from "react-query";
import { api } from "store/slices/api";
import {
  extractStatus,
  mergeStatuses,
  parseItems,
  splitStatus,
} from "store/utils";

export type BackupsProps = {};

const useContainer = () => {
  const backups = api.useFetchBackupsQuery({});
  const [createBackup, createStatus] = api.useCreateBackupMutation();
  const [revertBackup, revertStatus] = api.useRevertBackupMutation();
  const [removeBackup, removeStatus] = api.useRemoveBackupMutation();
  const [importBackup, importStatus] = api.useImportBackupMutation();

  return {
    backups: {
      ...parseItems(backups),
      revert: { status: extractStatus(revertStatus), exec: revertBackup },
      create: { status: extractStatus(createStatus), exec: createBackup },
      remove: { status: extractStatus(removeStatus), exec: removeBackup },
      import: { status: extractStatus(importStatus), exec: importBackup },
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
      required: true,
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
            onClick={() => {
              exportBackup(item.id);
            }}
          >
            Экспорт
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

  const [bind] = useInput<{}>({});
  const [bindUnsafe] = useInput<{ unsafe?: boolean }>({});
  const [bindImport, setImport, ref] = useFileInput();

  const formContext = React.useContext(FormContext);

  // formContext.addCheck(bind.input, "tag", (v) => {

  // });

  useNotice(backups.import.status);

  React.useEffect(() => {
    if ((bindImport.files.file?.length ?? 0) === 0) return;

    const body = new FormData();

    body.append("file", (bindImport.files.file as FileList)[0]);

    backups.import.exec({
      body: body as any,
      unsafe: bindUnsafe.input.unsafe as boolean,
    });
  }, [bindImport.files.file]);

  return (
    <>
      <TopBarLayer>
        <Checkbox
          containerProps={{
            style: { marginLeft: "auto", marginRight: "0.5rem" },
          }}
          label="Без проверки"
          name="unsafe"
          {...bindUnsafe}
        />
        <Link
          size="sm"
          color="primary"
          onClick={() => {
            if (ref) ref.value = "";
            ref?.click();
          }}
        >
          Импортировать резервную копию <Icon.Upload color="primary" />
        </Link>
        <Input
          hidden
          name="file"
          type="file"
          inputProps={{ accept: ".sbac" }}
          {...bindImport}
        />
      </TopBarLayer>
      <Layout flex="1">
        <Form
          input={bind.input}
          onSubmit={(data) => {
            backups.create.exec({ ...data, tag: data.tag.toUpperCase() });
          }}
        >
          <Layout flow="row">
            <Input
              check={(v) => {
                if (!v) return false;
                if (v.length < 3 || v.length > 10) return "От 3 до 10 символов";
                const correct = v
                  .split("")
                  .every(
                    (c) => (c >= "a" && c <= "z") || (c >= "0" && c <= "9")
                  );

                if (!correct) return "Только латинские цифры и символы";

                return false;
              }}
              label="Метка"
              placeholder="normal"
              {...bind}
              required
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
