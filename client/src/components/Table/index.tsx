import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type TableItem = {
  id: any;
  props?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableRowElement>,
    HTMLTableRowElement
  >;
  [key: string]: any;
};

type TableColumn = {
  key: string;
  name: string;
  type?: "date";
  sortable?: boolean;
};

type TableProps = OverrideProps<
  React.TableHTMLAttributes<HTMLTableElement>,
  {
    items: TableItem[];
    columns: TableColumn[];
    name?: string;
    onSelect?: (item: TableItem) => void;
    selectedId?: any;

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

const TableCell: React.FC<TableCellProps> = ({ children, ...props }) => {
  return <td {...props}>{children}</td>;
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

  const convertValue = (column: TableColumn, value: any) => {
    if (column.type === "date") return new Date(value).toLocaleDateString();
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
              {column.name}
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
            onClick={() => onSelect && onSelect(item)}
            key={item.id}
            {...item.props}
          >
            {columns.map((column) => (
              <TableCell key={column.key}>
                {convertValue(column, item[column.key])}
              </TableCell>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
