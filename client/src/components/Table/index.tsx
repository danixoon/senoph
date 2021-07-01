import Checkbox from "components/Checkbox";
import { InputBind } from "hooks/useInput";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type TableItem<T> = {
  id: any;
  props?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableRowElement>,
    HTMLTableRowElement
  >;
} & T;

export type TableColumn = {
  key: string;
  header: React.ReactChild;
  sortable?: boolean;
} & (
  | { type?: "date" }
  | { type?: "checkbox"; onToggle: (state: boolean, id: any) => void }
);

type TableProps<T = any> = OverrideProps<
  React.TableHTMLAttributes<HTMLTableElement>,
  {
    items: TableItem<T>[];
    columns: TableColumn[];
    name?: string;

    onSelect?: (item: TableItem<T>) => void;
    selectedId?: any;

    selectMultiple?: boolean;

    onSort?: (key: string, dir: SortDir) => void;
    sortKey?: string;
    sortDir?: SortDir;

    input?: any;
  }
>;

type TableCellProps = OverrideProps<
  React.DetailedHTMLProps<
    React.TdHTMLAttributes<HTMLTableDataCellElement>,
    HTMLTableDataCellElement
  >,
  {}
>;

const TableCell: React.FC<TableCellProps> = ({ children, ...rest }) => {
  const mergedProps = mergeProps({}, rest);
  return <td {...mergedProps}>{children}</td>;
};

const Table: React.FC<React.PropsWithChildren<TableProps>> = (
  props: TableProps
) => {
  const {
    items,
    columns,
    onSelect,
    input = {},
    name,
    sortKey,
    sortDir,
    onSort,
    selectedId,
    selectMultiple,
    ...rest
  } = props;
  const mergedProps = mergeProps(
    {
      className: "table",
    },
    rest
  );

  // Local sort
  // const [{ sortKey, asc }, changeSort] = React.useState<{
  //   sortKey: string | null;
  //   asc: boolean;
  // }>(() => ({ sortKey: null, asc: false }));

  // const sortedItems =
  //   sortKey === null
  //     ? items
  //     : [...items].sort(
  //         (a, b) => (a[sortKey] > b[sortKey] ? 1 : -1) * (asc ? 1 : -1)
  //       );

  const convertValue = (
    column: TableColumn,
    item: TableItem<any>,
    value: any
  ) => {
    switch (column.type) {
      case "date":
        return new Date(value).toLocaleDateString();
      case "checkbox":
        return (
          <Checkbox
            onChange={(e) => {
              column.onToggle(!value, item.id);
            }}
            input={{ [column.key]: value }}
            name={column.key}
          />
        );
    }
    return value;
  };

  // console.log(sortDir);

  return (
    <table {...mergedProps}>
      <thead>
        <tr>
          {columns.map((column) => (
            <TableCell
              className={mergeClassNames(
                column.type === "checkbox" && "cell_checkbox",
                column.sortable && "cell_sortable",
                sortKey === column.key && `sort_${sortDir}`
              )}
              onClick={() =>
                column.sortable &&
                onSort &&
                onSort(column.key, sortDir === "asc" ? "desc" : "asc")
              }
              key={column.key}
            >
              {column.header}
            </TableCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr
            className={mergeClassNames(
              onSelect && "row_selectable",
              onSelect && selectedId === item.id && "row_selected"
            )}
            // TODO: Make rows selectable with keyboard
            tabIndex={onSelect ? 0 : undefined}
            key={item.id}
            {...item.props}
          >
            {columns.map((column) => (
              <TableCell
                className={mergeClassNames(
                  column.type === "checkbox" && "cell_checkbox"
                )}
                key={column.key}
                onClick={() =>
                  column.type != "checkbox" && onSelect && onSelect(item)
                }
              >
                {convertValue(column, item, item[column.key])}
              </TableCell>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
