import { api } from "store/slices/api";
import Table, { TableColumn } from "components/Table";
import { useDepartmentName } from "hooks/misc/useDepartmentName";
import { useHolderName } from "hooks/misc/useHolderName";
import { useInput, useFileInput } from "hooks/useInput";
import { useTogglePopup } from "hooks/useTogglePopup";
import React from "react";
import { HoldingPageProps } from ".";
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
import { parseItems } from "store/utils";

const CreateContent: React.FC<HoldingPageProps> = (props) => {
  const { phones, holdingCreationStatus, onSubmitHolding: onSubmit } = props;
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
  const getHolderName = useHolderName();
  const getDepartmentName = useDepartmentName();

  const [bind, setInput] = useInput({
    departmentId: null,
    reasonId: null,
    holderId: null,
    holderName: null,
  });

  const [bindFile] = useFileInput();

  const tableItems = phones.map((phone) => ({
    ...phone,
    modelName: phone.model?.name,
    holderName: getHolderName(phone.holder),
    departmentName: getDepartmentName(
      phone.holdings && phone.holdings.length > 0
        ? phone.holdings[0].departmentId
        : undefined
    ),
  }));

  const bindHoldingPopup = useTogglePopup();

  const { data: departments } = parseItems(api.useFetchDepartmentsQuery({}));

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <Layout>
        <Form
          json={false}
          input={{
            ...bind.input,
            ...bindFile.files,
            phoneIds: phones.map((phone) => phone.id),
          }}
          onSubmit={(data) => {
            onSubmit(data);
          }}
        >
          <Layout flow="row">
            <ClickInput
              required
              {...bind}
              name="holderName"
              label="Владещец"
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
              label="Дата приказа"
              {...bind}
              type="date"
              name="orderDate"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="Номер приказа"
              {...bind}
              name="orderKey"
              style={{ flex: "1" }}
            />
            <Input
              label="Файл приказа"
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
              disabled={holdingCreationStatus.isLoading}
              margin="md"
              type="submit"
              color="primary"
            >
              {holdingCreationStatus.isLoading ? <LoaderIcon /> : "Создать"}
            </Button>
          </Layout>
        </Form>
        <Hr />
        <Header align="right">
          Затрагиваемые средства связи ({phones.length})
        </Header>
        <Table items={tableItems} columns={columns} />
      </Layout>
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
