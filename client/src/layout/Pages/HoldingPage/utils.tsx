import Badge from "components/Badge";
import { LoaderIcon } from "components/Icon";
import Layout from "components/Layout";
import Link from "components/Link";
import Span from "components/Span";
import { TableColumn } from "components/Table";
import { splitHolderName } from "hooks/misc/holder";
import React from "react";
import { useAppDispatch } from "store";
import { updateQuery } from "store/utils";
import { HoldingTableItem } from ".";

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

export const getTableColumns: (args: {
  status: ApiStatus;
  holders: Map<number, Api.Models.Holder>;
  departments: Map<number, Api.Models.Department>;
  controlMapper: (v: any, item: HoldingTableItem) => React.ReactNode;
}) => TableColumn[] = ({ status, departments, holders, controlMapper }) => [
  {
    key: "control",
    size: "30px",
    header: "",
    mapper: controlMapper,
  },
  {
    key: "id",
    size: "30px",
    header: "ID",
  },
  { key: "orderKey", header: "Номер документа", size: "100px" },
  { key: "orderDate", header: "Документ от", size: "100px", type: "date" },
  {
    key: "holderId",
    header: "Владелец",
    mapper: (v, item: HoldingTableItem) => {
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
];
