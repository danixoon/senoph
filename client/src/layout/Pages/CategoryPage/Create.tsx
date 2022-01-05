import qs from "query-string";
import ActionBox from "components/ActionBox";
import Badge from "components/Badge";
import Link from "components/Link";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import React from "react";
import { useLocation } from "react-router";
import { resolveStatusName } from "resolvers/commit";
import { api } from "store/slices/api";
import { extractStatus, parseItems } from "store/utils";
import { getLocalDate } from "utils";
// import { defaultColumns } from "../PhonePage/Items";
import { categoryNames, resolveCategoryName } from "./utils";
import Header from "components/Header";
import Hr from "components/Hr";
import { useQueryInput } from "hooks/useQueryInput";
import { useFileInput, useInput } from "hooks/useInput";
import { getDepartmentName, useDepartment } from "hooks/misc/department";
import { splitHolderName, useHolder } from "hooks/misc/holder";
import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import { getLastHolding } from "hooks/misc/holding";
import Span from "components/Span";
import InfoBanner from "components/InfoBanner";
import { useNotice } from "hooks/useNotice";

const useContainer = () => {
  const { search } = useLocation();
  const searchObject = qs.parse(search);
  const phoneIds = ((searchObject.phoneIds as string)?.split(",") ?? []).map(
    (v) => parseInt(v)
  );

  const fetchedPhones = api.useFetchPhonesQuery(
    { ids: phoneIds, offset: 0, amount: phoneIds.length },
    { skip: phoneIds.length === 0 }
  );

  const [createCategory, createCategoryInfo] = api.useCreateCategoryMutation();

  const phones = parseItems(fetchedPhones);
  return {
    phones,
    phoneIds,
    category: {
      create: createCategory,
      status: extractStatus(createCategoryInfo),
    },
  };
};

type InputObject = Partial<
  Record<"actKey" | "actDate" | "categoryKey" | "actFile", string>
>;

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

export const CreateContent: React.FC<{}> = (props) => {
  const { phones, category, phoneIds } = useContainer();

  const getHolder = useHolder();
  const getDepartment = useDepartment();

  const [bind] = useInput({});

  const [bindFile] = useFileInput();

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

  useNotice(category.status);

  return phoneIds.length === 0 ? (
    <InfoBanner
      href="/phone/edit"
      hrefContent="средство связи"
      text="Для создания категории выберите"
    />
  ) : (
    <>
      {/* <Layout> */}

      <Form
        style={{ flexFlow: "row" }}
        json={false}
        input={{
          ...bind.input,
          ...bindFile.files,
          phoneIds,
        }}
        onSubmit={(data) => {
          category.create(data);
          // onSubmit(data);
          // noticeContext.createNotice("Категория создана");
        }}
      >
        {/* <Layout flow="row"> */}
        <Dropdown
          required
          style={{ flex: "1" }}
          label="Категория"
          name="categoryKey"
          items={Object.entries(categoryNames).map(([key, value]) => ({
            id: key,
            label: value,
          }))}
          {...bind}
        />
        <Input
          required
          label="Номер акта"
          {...bind}
          name="actKey"
          style={{ flex: "1" }}
        />
        <Input
          required
          label="Дата акта"
          type="date"
          {...bind}
          name="actDate"
          style={{ flex: "1" }}
        />
        <Input
          required
          label="Файл акта"
          {...bindFile}
          name="actFile"
          style={{ flex: "1" }}
          type="file"
          inputProps={{ accept: ".pdf" }}
        />
        {/* </Layout> */}
        {/* <Layout flow="row"> */}
        <Button
          style={{
            marginTop: "auto",
            marginLeft: "auto",
            padding: "0 4rem",
          }}
          margin="md"
          type="submit"
          color="primary"
          disabled={category.status.isLoading}
        >
          {category.status.isLoading ? <LoaderIcon /> : "Создать"}
        </Button>
        {/* </Layout> */}
      </Form>
      {/* </Layout> */}
      <Hr />
      <Header align="right">
        Затрагиваемые средства связи (
        {phones.data?.items.length ?? phoneIds.length})
      </Header>
      <Table items={tableItems} columns={columns} />
    </>
  );
};
