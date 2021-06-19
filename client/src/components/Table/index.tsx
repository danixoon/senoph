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
    onChange?: HookOnChange;
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
  const { items, columns, onChange, input = {}, name, ...rest } = props;
  const mergedProps = mergeProps(
    {
      className: "table",
    },
    rest
  );

  const [{ sortKey, asc }, changeSort] = React.useState<{
    sortKey: string | null;
    asc: boolean;
  }>(() => ({ sortKey: null, asc: false }));

  const sortedItems =
    sortKey === null
      ? items
      : [...items].sort(
          (a, b) => (a[sortKey] > b[sortKey] ? 1 : -1) * (asc ? 1 : -1)
        );

  const convertValue = (column: TableColumn, value: any) => {
    if (column.type === "date") return new Date(value).toLocaleDateString();
    return value;
  };

  return (
    <table {...mergedProps}>
      <thead>
        <tr>
          {columns.map((column) => (
            <TableCell
              className={mergeClassNames(
                column.sortable && "cell_sortable",
                sortKey === column.key && (asc ? "sort_asc" : "sort_desc")
              )}
              onClick={() =>
                column.sortable &&
                changeSort({
                  sortKey: column.key,
                  asc: sortKey == null ? asc : !asc,
                })
              }
              key={column.key}
            >
              {column.name}
            </TableCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedItems.map((item) => (
          <tr
            className={mergeClassNames(
              onChange && "row_selectable",
              onChange && name && input[name] === item.id && "row_selected"
            )}
            // TODO: Make rows selectable with keyboard
            tabIndex={onChange ? 0 : undefined}
            onClick={() =>
              onChange && name && onChange({ target: { name, value: item.id } })
            }
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
