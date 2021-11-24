import Badge from "components/Badge";
import { LoaderIcon } from "components/Icon";
import Layout from "components/Layout";
import Link from "components/Link";
import Span from "components/Span";
import { TableColumn } from "components/Table";
import { splitHolderName } from "hooks/misc/useHolderName";
import React from "react";
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
  controlMapper: (v: any, item: HoldingTableItem) => React.ReactNode;
}) => TableColumn[] = ({ status, holders, controlMapper }) => [
  {
    key: "control",
    size: "30px",
    header: "",
    mapper: controlMapper,
  },

  { key: "orderDate", header: "Приказ от", size: "100px", type: "date" },
  {
    key: "holderId",
    header: "Владелец",
    mapper: (v, item: HoldingTableItem) => {
      const holder = holders.get(item.holderId);
      return (
        <Layout>
          {item.prevHolders.map((holder) => (
            <Span strike key={holder.id}>
              {splitHolderName(holder)}
            </Span>
          ))}
          <Span>{holder ? splitHolderName(holder) : <LoaderIcon />}</Span>
        </Layout>
      );
    },
  },
  {
    key: "phoneIds",
    header: "Средства связи",
    props: { style: { whiteSpace: "normal" } },
    mapper: (v, item: HoldingTableItem) => {
      return item.phoneIds.map((id, i) => (
        <>
          <Link
            style={{ display: "inline" }}
            href={`/phone/view?selectedId=${id}`}
          >{`#${id}`}</Link>
          {i !== item.phoneIds.length - 1 ? ", " : ""}
        </>
      ));
    },
  },
  {
    key: "reasonId",
    header: "Причина",
    size: "150px",
    mapper: (v, item) => <Badge>{getReason(item.reasonId)}</Badge>,
  },
  {
    key: "status",
    header: "Статус",
    size: "150px",
    mapper: (v, item) => {
      let status = "Произвидено";
      if (item.status === "create-pending") status = "Ожидает создания";
      else if (item.status === "delete-pending") status = "Ожидает удаления";
      return <Badge>{status}</Badge>;
    },
  },
];