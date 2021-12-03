import ActionBox from "components/ActionBox";
import Badge from "components/Badge";
import Link from "components/Link";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import React from "react";
import { resolveStatusName } from "resolvers/commit";
import { api } from "store/slices/api";
import { parseItems } from "store/utils";
import { getLocalDate } from "utils";
import { categoryNames, resolveCategoryName } from "./utils";

const columns: TableColumn<Api.Models.Category>[] = [
  {
    key: "id",
    header: "ID",
    size: "30px",
    mapper: (v, item) => <Link>#{item.id}</Link>,
  },
  {
    key: "actKey",
    header: "Номер акта",
    size: "100px",
    mapper: (v, item) => item.actKey,
  },
  {
    key: "actDate",
    header: "Дата акта",
    type: "date",
    size: "100px",
    mapper: (v, item) => item.actDate,
  },
  {
    key: "phoneIds",
    header: "Средства связи",
    wrap: true,
    mapper: (v, item) =>
      item.phoneIds.map((id, i) => (
        <>
          <Link inline href={`/phone/view?selectedId=${id}`}>
            #{id}
          </Link>
          {i !== item.phoneIds.length - 1 ? ", " : ""}
        </>
      )),
  },
  {
    key: "categoryKey",
    header: "Категория",
    size: "200px",
    mapper: (v, item) => <Badge>{resolveCategoryName(item.categoryKey)}</Badge>,
  },
  {
    key: "status",
    header: "Статус",
    size: "100px",
    mapper: (v, item) => <Badge>{resolveStatusName(item.status)}</Badge>,
  },
  {
    key: "createdAt",
    header: "Время создания",
    mapper: (v, item) => getLocalDate(item.createdAt),
  },
];

const useContainer = () => {
  const fetchedCategories = api.useFetchCategoriesQuery({});
  return { categories: parseItems(fetchedCategories) };
};

export const ViewContent: React.FC<{}> = (props) => {
  const { categories } = useContainer();

  const actionBox: TableColumn = {
    key: "actions",
    header: "",
		size: "30px",
    mapper: (v, item) => (
      <ActionBox>
        <SpoilerPopupButton>Изменить</SpoilerPopupButton>
        <SpoilerPopupButton>Удалить</SpoilerPopupButton>
      </ActionBox>
    ),
  };

  return (
    <>
      <Table items={categories.data.items} columns={[actionBox, ...columns]} />
    </>
  );
};
