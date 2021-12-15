import Badge from "components/Badge";
import Link from "components/Link";
import { TableColumn } from "components/Table";
import { useAuthor } from "hooks/misc/author";
import React from "react";
import { resolveStatusName } from "resolvers/commit";
import { useAppDispatch } from "store";
import { updateQuery } from "store/utils";
import { getLocalDate } from "utils";
import columns from "utils/columns";

export const categoryNames = {
  "1": "I (Прибыло, на гарантии)",
  "2": "II (Нет гарантии, исправно)",
  "3": "III (Неисправно)",
  "4": "IV (Подлежит списанию)",
};

export const resolveCategoryName = (category?: CategoryKey) =>
  typeof category !== "string"
    ? "Неизвестно"
    : categoryNames[category] ?? `Категория ${category}`;

export const getColumns: (
  getUser: (id?: number | undefined) => Api.Models.User | undefined
) => TableColumn<Api.Models.Category>[] = (getUser) => {
  return [
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
      mapper: (v, item) => {
        const maxItems = 25;
        const sliced = item.phoneIds.slice(0, maxItems);
        const items = sliced.map((id, i) => (
          <>
            <Link
              key={id}
              style={{ display: "inline" }}
              href={`/phone/view?selectedId=${id}`}
            >{`#${id}`}</Link>
            {i !== sliced.length - 1 ? ", " : ""}
          </>
        ));

        const dispatch = useAppDispatch();

        if (items.length === maxItems)
          items.push(
            <Link
              onClick={() => {
                dispatch(updateQuery({ id: item.id }));
              }}
              inline
              style={{ float: "right" }}
            >
              <small> +{item.phoneIds.length - maxItems} элемент(ов)</small>
            </Link>
          );

        return items;
      },
    },
    {
      key: "categoryKey",
      header: "Категория",
      size: "250px",
      wrap: true,
      mapper: (v, item) => (
        <Badge>{resolveCategoryName(item.categoryKey)}</Badge>
      ),
    },
    {
      key: "status",
      header: "Статус",
      size: "100px",
      wrap: true,
      mapper: (v, item) => <Badge>{resolveStatusName(item.status)}</Badge>,
    },
    {
      key: "createdAt",
      header: "Время создания",
      mapper: (v, item) => getLocalDate(item.createdAt),
    },
    columns.author({ getUser }),
  ];
};
