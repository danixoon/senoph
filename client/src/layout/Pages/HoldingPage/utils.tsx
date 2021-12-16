import qs from "query-string";
import Badge from "components/Badge";
import { LoaderIcon } from "components/Icon";
import Layout from "components/Layout";
import Link from "components/Link";
import Span from "components/Span";
import { TableColumn } from "components/Table";
import { splitHolderName } from "hooks/misc/holder";
import React from "react";
import { useAppDispatch } from "store";
import { parseItems, updateQuery } from "store/utils";
import { useLocation } from "react-router";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import { api } from "store/slices/api";
import { InputHook } from "hooks/useInput";
import Checkbox from "components/Checkbox";
import { Selection } from "../../../hooks/useSelection";
import columnTypes from "utils/columns";

export const reasonMap = [
  { id: "initial", label: "Назначение" },
  { id: "order", label: "По приказу" },
  { id: "dismissal", label: "Увольнение" },
  { id: "movement", label: "Переезд" },
  { id: "write-off", label: "Списание" },
  { id: "other", label: "Другое" },
];
export const getReason = (id: string) =>
  reasonMap.find((r) => r.id === id)?.label ?? `#${id}`;

// export const getSelectionColumn = (selection: Selection) => ({
//   size: "30px",
//   header: (
//     <Checkbox
//       name="all"
//       input={{ all: selection.total === selection.selection.length }}
//       onClick={(e) =>
//         selection.onToggleAll(selection.total !== selection.selection.length)
//       }
//     />
//   ),
//   key: "selection",
//   mapper: (v: any, item: { id: any }) => {
//     const enabled = selection.selection.includes(item.id);
//     return (
//       <Checkbox
//         name="selection"
//         input={{ selection: enabled }}
//         onClick={(e) => selection.onToggle(item.id, !enabled)}
//       />
//     );
//   },
// });

export const getTableColumns: (args: {
  selection?: {
    onToggle: (id: number, enable: boolean) => void;
    onToggleAll: (enable: boolean) => void;
    selection: number[];
    total: number;
  };
  status: ApiStatus;
  holders: Map<number, Api.Models.Holder>;
  departments: Map<number, Api.Models.Department>;
  getUser: (id?: number | undefined) => Api.Models.User | undefined;
  controlMapper: (v: any, item: HoldingTableItem) => React.ReactNode;
}) => TableColumn<HoldingTableItem>[] = ({
  status,
  selection,
  departments,
  getUser,
  holders,
  controlMapper,
}) => {
  const columns: TableColumn<HoldingItem>[] = [
    {
      key: "control",
      size: "30px",
      header: "",
      required: true,
      mapper: controlMapper,
    },
    {
      key: "id",
      size: "30px",
      header: "ID",
    },
    {
      key: "orderKey",
      header: "Номер документа",
      size: "100px",
      mapper: (v, item) =>
        item.orderUrl ? (
          <Link native href={`/upload/${item.orderUrl}`}>
            {item.orderKey}
          </Link>
        ) : (
          item.orderKey
        ), //. ,
    },
    { key: "orderDate", header: "Документ от", size: "100px", type: "date" },
    {
      key: "holderId",
      header: "Владелец",
      mapper: (v, item) => {
        const holder = holders.get(item.holderId);
        const name = splitHolderName(holder);
        return (
          <>
            {item.prevHolders.map((holder) => (
              <>
                <Span
                  title={splitHolderName(holder)}
                  inline
                  strike
                  key={holder.id}
                >
                  {splitHolderName(holder)}
                </Span>
                <br />
              </>
            ))}
            <Span inline title={name}>
              {holder ? name : <LoaderIcon />}
            </Span>
          </>
        );
      },
    },
    {
      key: "departmentId",
      header: "Подраздение",
      mapper: (v, item: HoldingTableItem) => {
        const department = departments.get(item.departmentId);
        return (
          <>
            {item.prevDepartments.map((department) => (
              <>
                <Span title={department.name} inline strike key={department.id}>
                  {department.name}
                </Span>
                <br />
              </>
            ))}
            <Span inline title={department?.name}>
              {department ? department.name : <LoaderIcon />}
            </Span>
          </>
        );
      },
    },
    {
      key: "phoneIds",
      header: "Средства связи",
      props: { style: { whiteSpace: "normal" } },
      mapper: (v, item: HoldingTableItem) => {
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
        const location = useLocation();

        if (items.length === maxItems)
          items.push(
            <Link
              onClick={() => {
                dispatch(
                  updateQuery({
                    ...qs.parse(location.search),
                    selectedId: item.id,
                  })
                );
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
      key: "reasonId",
      header: "Причина",
      size: "100px",
      mapper: (v, item) => <Badge>{getReason(item.reasonId)}</Badge>,
    },
    {
      key: "status",
      header: "Статус",
      props: { style: { whiteSpace: "normal", textAlign: "center" } },
      size: "100px",
      mapper: (v, item) => {
        let status = "Произвидено";
        if (item.status === "create-pending") status = "Ожидает создания";
        else if (item.status === "delete-pending") status = "Ожидает удаления";
        return <Badge>{status}</Badge>;
      },
    },
    columnTypes.author({ getUser }),
  ];

  if (selection) {
    columns.push(columnTypes.selection({ selection }));
  }

  return columns;
};

export const useHoldingWithHistory = (filter: any = {}) => {
  const { departments } = useFetchConfigMap();
  const holdings = parseItems(api.useFetchHoldingsQuery(filter));

  const holdingPhoneIds = Array.from(
    holdings.data.items
      .reduce(
        (set, v) => v.phoneIds.reduce((set, id) => set.add(id), set),
        new Set<number>()
      )
      .values()
  );

  const phoneHoldings = parseItems(
    api.useFetchPhoneHoldingsQuery(
      {
        phoneIds: holdingPhoneIds,
      },
      { skip: holdingPhoneIds.length === 0 }
    )
  );

  const holdingMap = new Map<number, Api.Models.Holding[]>();
  for (const holding of phoneHoldings.data.items) {
    for (const phoneId of holding.phoneIds) {
      const holdingList = holdingMap.get(phoneId) ?? [];

      holdingMap.set(phoneId, [...holdingList, holding]);
    }
  }

  const holdingItems = holdings.data.items.map((holding) => {
    const prevHolders: Api.Models.Holder[] = [];
    const prevDepartments: Api.Models.Department[] = [];
    for (const id of holding.phoneIds) {
      // Получаем все движения сс по ID средств связи, отсортированные по дате документа
      const prevItems = [...(holdingMap.get(id) ?? [])].sort((a, b) =>
        (a.orderDate as string) < (b.orderDate as string) ? -1 : 1
      );
      // Определяется порядковый номер назначения для СС
      const holdingIndex = prevItems.findIndex(
        (item) => item.id === holding.id
      );
      // Если это не первый владелец, то следует вывести его
      if (holdingIndex > 0) {
        const holder = prevItems[holdingIndex - 1].holder as Api.Models.Holder;
        if (
          holding.holderId !== holder.id &&
          prevHolders.every((h) => h.id !== holder.id)
        ) {
          prevHolders.push(holder);
        }
        const department = departments.get(
          prevItems[holdingIndex - 1].departmentId
        );
        if (
          department &&
          holding.departmentId !== department.id &&
          prevDepartments.every((h) => h.id !== department.id)
        ) {
          prevDepartments.push(department);
        }
      }
    }

    return { ...holding, prevHolders, prevDepartments };
  });

  return {
    data: {
      items: holdingItems,
      total: holdings.data.total,
      offset: holdings.data.offset,
    },
    status: holdings.status,
  };
};

export type HoldingItem = Api.Models.Holding & {
  prevHolders: Api.Models.Holder[];
};

export type HoldingPageProps = {
  holdings: ItemsResponse<HoldingItem>;
  holdingsStatus: ApiStatus;
  holdingCreationStatus: ApiStatus;
  onSubmitHolding: (data: any) => void;
  filterHook: InputHook<any>;
};

export type HoldingTableItem = Api.Models.Holding & {
  prevHolders: Api.Models.Holder[];
  prevDepartments: Api.Models.Department[];
};
