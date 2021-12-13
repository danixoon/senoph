import Checkbox from "components/Checkbox";
import { InputBind } from "hooks/useInput";
import * as React from "react";
import { getLocalDate, mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type TableItem<T> = {
  id: any;
  props?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableRowElement>,
    HTMLTableRowElement
  >;
} & T;

export type TableColumn<T = any> = {
  key: string;
  header: React.ReactChild;
  size?: string;
  sortable?: boolean;
  wrap?: boolean;
  props?: React.TdHTMLAttributes<HTMLElement>;
  mapper?: (v: any, row: T, i: number) => any;
} & (
  | { type?: "date" }
  | { type?: "local-date" }
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
    React.TdHTMLAttributes<HTMLTableCellElement>,
    HTMLTableCellElement
  >,
  {}
>;

const TableCell: React.FC<TableCellProps> = ({ children, ...rest }) => {
  // const mergedProps = mergeProps({}, rest);
  return <td {...rest}>{children}</td>;
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
    value: any,
    i: number
  ) => {
    const mapper = column.mapper ?? ((v: any) => v);

    switch (column.type) {
      case "local-date":
        return getLocalDate(value);
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
    return mapper(value, item, i);
  };

  // console.log(sortDir);

  // TODO: Unique key error
  return (
    <table {...mergedProps}>
      <thead>
        <tr>
          {columns.map((column) => {
            const mergedProps = mergeProps(
              {
                className: mergeClassNames(
                  column.type === "checkbox" && "cell_checkbox",
                  column.sortable && "cell_sortable",
                  sortKey === column.key && `sort_${sortDir}`
                ),
                style: { width: column.size },
              },
              column.props ?? {}
            );
            return (
              <TableCell
                title={
                  typeof column.header === "string" ? column.header : undefined
                }
                onClick={() =>
                  column.sortable &&
                  onSort &&
                  onSort(column.key, sortDir === "asc" ? "desc" : "asc")
                }
                key={`${column.key}`}
                {...mergedProps}
              >
                {column.header}
              </TableCell>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {items.map((item, ir) => (
          <tr
            id={item.id}
            className={mergeClassNames(
              onSelect && "row_selectable",
              onSelect && selectedId === item.id && "row_selected"
            )}
            // TODO: Make rows selectable with keyboard
            tabIndex={onSelect ? 0 : undefined}
            key={`${item.id ?? "id"}-${ir}`}
            {...item.props}
          >
            {columns.map((column, i) => {
              const mergedProps = mergeProps(
                {
                  className: mergeClassNames(
                    column.type === "checkbox" && "cell_checkbox",
                    column.wrap && "cell_wrap"
                  ),
                },
                column.props ?? {}
              );
              return (
                <TableCell
                  key={`${column.key}-${item.id}-${ir}-${i}`}
                  onClick={() =>
                    column.type != "checkbox" && onSelect && onSelect(item)
                  }
                  {...mergedProps}
                >
                  {convertValue(column, item, item[column.key], ir)}
                </TableCell>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
