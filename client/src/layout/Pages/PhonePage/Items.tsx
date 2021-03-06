import qs from "query-string";
import Checkbox from "components/Checkbox";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import Link from "components/Link";
import Paginator from "components/Paginator";
import Popup from "components/Popup";
import Table, { TableColumn } from "components/Table";
import { push } from "connected-react-router";
import { InputHook, useInput } from "hooks/useInput";
import PopupLayer from "providers/PopupLayer";
import TopBarLayer from "providers/TopBarLayer";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router";
import { PhoneState } from "store/slices/phone";
import Span from "components/Span";
import columns from "utils/columns";
import { useAuthor } from "hooks/misc/author";

export const getDefaultColumns: (
  getUser: (id?: number | undefined) => Api.Models.User | undefined,
  withoutSelection?: boolean
) => TableColumn[] = (getUser, without) => [
  {
    key: "id",
    header: "ID",
    sortable: true,
    size: "30px",
    mapper: (v, item) => {
      // const dispatch = useDispatch();
      // const location = useLocation();
      // const search = save ? qs.parse(location.search) : {};
      // search.selectedId = item.id;

      if (without) return <Span>#{item.id}</Span>;

      return (
        <Link
          tabIndex={-1}
          href={`/phone?selectedId=${v}`}

          // onClick={() => {
          // dispatch(
          // push({ pathname: "/phone/view", search: qs.stringify(search) })
          // );
          // }}
        >
          #{v}
        </Link>
      );
    },
  },
  {
    key: "modelName",
    header: "Модель",
    sortable: true,
    mapper: (v, item: any) => item.model?.name ?? "Не определена",
  },
  {
    key: "inventoryKey",
    header: "Инвентарный номер",
    sortable: true,
  },
  { key: "factoryKey", header: "Заводской номер", sortable: true },
  {
    key: "assemblyDate",
    header: "Год сборки",
    sortable: true,
    mapper: (v) => new Date(v).getFullYear(),
    size: "50px",
  },
  {
    key: "accountingDate",
    type: "date",
    header: "Дата учёта",
    sortable: true,
    size: "50px",
  },
  {
    key: "commissioningDate",
    type: "date",
    header: "Дата ввода в эксплуатацию",
    sortable: true,
    size: "50px",
  },
  ...columns.entityDates(),
  columns.author({ getUser }),
];

const Items: React.FC<{
  items: Api.Models.Phone[];
  status: ApiStatus;
  paging: {
    totalItems: number;
    // pageItems: number;
    // onOffsetChanged: (offset: number) => void;
    // offset: number;
  };
  sorting: {
    onSort: (key: string, dir: SortDir) => void;
    dir: SortDir;
    key: string | null;
  };
  selection: {
    onSelect: (item: Api.Models.Phone) => void;
    onSelection: (/*all: boolean, */ ids: Set<any>) => void;
    selectionIds: Set<any>;
    selectedId: any;
  };
  mode: "edit" | "view";
}> = (props) => {
  const { items, status, paging, sorting, selection, mode } = props;

  const { totalItems } = paging;
  const { onSelect, selectedId } = selection;

  // React.useEffect(() => {
  //   if(totalItems < filter.offset) return;

  //   let nextOffset =
  // }, [totalItems]);

  const handleTableSelection = (markedIds: Set<any>) => {
    if (props.mode === "edit") selection.onSelection(markedIds);
  };

  const isSelected = (id: any) => {
    return selection.selectionIds.has(id);
  };

  let isAllSelected = totalItems !== 0;

  const tableItems = items.map((item) => {
    const selected = isSelected(item.id);
    if (!selected) isAllSelected = false;
    return {
      ...item,
      selected,
    };
  });

  const getUser = useAuthor();
  const columns: TableColumn[] = getDefaultColumns(getUser, true);

  if (mode === "edit")
    columns.push({
      key: "selected",
      required: true,
      header: (
        <Checkbox
          name="selectAll"
          input={{ selectAll: isAllSelected }}
          onChange={(e) => {
            const set = new Set(selection.selectionIds);
            for (const item of items)
              if (!isAllSelected) set.add(item.id);
              else set.delete(item.id);

            handleTableSelection(set);
          }}
        />
      ),
      type: "checkbox",
      onToggle: (state: boolean, id: any) => {
        const set = new Set(selection.selectionIds);

        if (state) set.add(id);
        else set.delete(id);

        handleTableSelection(set);
      },
    });

  return (
    <>
      <Table
        stickyTop={31}
        selectedId={selectedId}
        onSelect={onSelect}
        onSort={sorting.onSort}
        sortDir={sorting.dir}
        sortKey={sorting.key ?? undefined}
        name="phoneId"
        items={tableItems.map((item) => ({
          ...item,
          // modelName: item.model?.name,
        }))}
        columns={columns}
      />
    </>
  );
};

export default Items;
