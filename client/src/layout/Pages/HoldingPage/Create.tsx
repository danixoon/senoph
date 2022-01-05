import { api } from "store/slices/api";
import qs from "query-string";
import Table, { TableColumn } from "components/Table";
import { getDepartmentName, useDepartment } from "hooks/misc/department";
import { splitHolderName, useHolder } from "hooks/misc/holder";
import { useInput, useFileInput } from "hooks/useInput";
import { useTogglePopup } from "hooks/useTogglePopup";
import React from "react";
import Button from "components/Button";
import ClickInput from "components/ClickInput";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import Link from "components/Link";
import Span from "components/Span";
import HolderSelectionPopupContainer from "containers/HolderSelectionPopup";
import PopupLayer from "providers/PopupLayer";
import { getTableColumns, reasonMap } from "./utils";
import { extractStatus, parseItems } from "store/utils";
import { getLastHolding } from "hooks/misc/holding";
import { useLocation } from "react-router";
import InfoBanner from "components/InfoBanner";
import { clearObject } from "utils";
import { useNotice } from "hooks/useNotice";

const useContainer = () => {
  const [createHolding, createStatus] = api.useCreateHoldingMutation();

  return {
    holding: {
      create: { exec: createHolding, status: extractStatus(createStatus) },
    },
  };
};

const columns: TableColumn[] = [
  {
    key: "id",
    header: "ID",
    size: "30px",
    mapper: (v, item) => (
      <Link href={`/phone/view?selectedId=${item.id}`}>
        <Span font="monospace">{`#${v}`}</Span>
      </Link>
    ),
  },
  { key: "modelName", header: "Модель", size: "150px" },
  { key: "inventoryKey", header: "Инвентарный номер", size: "300px" },
  { key: "holderName", header: "Владелец" },
  { key: "departmentName", header: "Отделение" },
];

const CreateContent: React.FC<{}> = (props) => {
  const { holding } = useContainer();
  const getHolder = useHolder();
  const getDepartment = useDepartment();

  const [bind, setInput] = useInput({
    departmentId: null,
    reasonId: null,
    holderId: null,
    holderName: null,
  });

  useNotice(holding.create.status);

  const [bindFile] = useFileInput();

  const location = useLocation();
  const { phoneIds: phoneIdsString } = qs.parse(location.search);
  const phoneIds =
    typeof phoneIdsString === "string"
      ? phoneIdsString
          .split(",")
          .map((v) => parseInt(v))
          .filter((v) => !isNaN(v))
      : [];

  // const isEmpty = typeof empty === "string";

  const fetchPhones = parseItems(
    api.useFetchPhonesQuery(
      {
        amount: phoneIds.length,
        offset: 0,
        ids: phoneIds,
      },
      { skip: phoneIds.length === 0 }
    )
  );

  const phones = parseItems(fetchPhones);

  const tableItems = phones.data.items.map((phone) => {
    const lastHolding = getLastHolding(phone.holdings);
    return {
      ...phone,
      modelName: phone.model?.name,
      holderName: splitHolderName(getHolder(lastHolding?.holderId)),
      departmentName: getDepartmentName(
        getDepartment(lastHolding?.departmentId)
      ),
    };
  });

  const bindHoldingPopup = useTogglePopup();

  const { data: departments } = parseItems(api.useFetchDepartmentsQuery({}));

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <InfoBanner
        href="/phone/edit"
        hrefContent="средство связи"
        text="Для создания движения выберите"
        disabled={true}
      >
        <Layout>
          <Form
            json={false}
            input={clearObject({
              ...bind.input,
              ...bindFile.files,
              phoneIds:
                phones.data.items.length > 0
                  ? phones.data.items.map((phone) => phone.id)
                  : undefined,
            })}
            onSubmit={(data) => {
              holding.create.exec(data);
            }}
          >
            <Layout flow="row">
              <ClickInput
                required
                {...bind}
                name="holderName"
                label="Владелец"
                onActive={() => bindHoldingPopup.onToggle()}
                style={{ flex: "2" }}
              />
              <Dropdown
                {...bind}
                required
                name="departmentId"
                label="Подразделение"
                style={{ flex: "2" }}
                items={departments.items.map((item) => ({
                  label: item.name,
                  id: item.id,
                }))}
              />
              <Input
                required
                label="Дата документа"
                {...bind}
                type="date"
                name="orderDate"
                style={{ flex: "1" }}
              />
              <Input
                required
                label="Номер документа"
                {...bind}
                name="orderKey"
                style={{ flex: "1" }}
              />
              <Input
                label="Файл документа"
                {...bindFile}
                name="orderFile"
                style={{ flex: "1" }}
                type="file"
                inputProps={{ accept: ".pdf" }}
              />
            </Layout>
            <Layout flow="row">
              <Dropdown
                required
                style={{ flex: "1" }}
                label="Причина"
                {...bind}
                name="reasonId"
                items={reasonMap}
              />
              <Input
                style={{ flex: "2rem" }}
                required={bind.input.reasonId === "other"}
                label="Описание"
                {...bind}
                name="description"
              />

              <Button
                style={{
                  marginTop: "auto",
                  marginLeft: "auto",
                  padding: "0 4rem",
                }}
                disabled={holding.create.status.isLoading}
                margin="md"
                type="submit"
                color="primary"
              >
                {holding.create.status.isLoading ? <LoaderIcon /> : "Создать"}
              </Button>
            </Layout>
          </Form>
          <Hr />
          <Header align="right">
            Затрагиваемые средства связи ({phones.data.items.length})
          </Header>
          <Table items={tableItems} columns={columns} />
        </Layout>
      </InfoBanner>
      <PopupLayer>
        <HolderSelectionPopupContainer
          {...bindHoldingPopup}
          onSelect={(id, name) =>
            setInput({ ...bind.input, holderName: name, holderId: id })
          }
        />
      </PopupLayer>
    </>
  );
};

export default CreateContent;
