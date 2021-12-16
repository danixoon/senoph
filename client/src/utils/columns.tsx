import React from "react";
import Checkbox from "components/Checkbox";
import { Selection } from "hooks/useSelection";
import { TableColumn } from "components/Table";
import { getAuthorName, useAuthor } from "hooks/misc/author";

const author: <T extends { authorId?: number }>(
  props: Partial<TableColumn<T>> & {
    getUser: (id?: number | undefined) => Api.Models.User | undefined;
  }
) => TableColumn<T> = (props) =>
  ({
    ...props,
    hidden: props.hidden ?? true,
    header: props.header ?? "Автор",
    key: props.key ?? "authorId",
    size: props.size ?? "100px",
    mapper: (v, item) => {
      return getAuthorName(props.getUser(item.authorId));
    },
  } as TableColumn);

const selection: <T>(
  props: Partial<TableColumn<T>> & { selection: Selection }
) => TableColumn<T> = (props) =>
  ({
    key: props.key ?? "selection",
    size: props.size ?? "30px",
    required: props.required ?? true,
    header: (
      <Checkbox
        name="all"
        input={{
          all: props.selection.total === props.selection.selection.length,
        }}
        onClick={(e) =>
          props.selection.onToggleAll(
            props.selection.total !== props.selection.selection.length
          )
        }
      />
    ),
    mapper: (v: any, item: { id: any }) => {
      const enabled = props.selection.selection.includes(item.id);
      return (
        <Checkbox
          name="selection"
          input={{ selection: enabled }}
          onClick={(e) => props.selection.onToggle(item.id, !enabled)}
        />
      );
    },
  } as TableColumn);

const entityDates: <
  T extends { createAt?: string; updatedAt?: string }
>() => // props: Partial<TableColumn<T>>
TableColumn<T>[] = () => [
  {
    hidden: true,
    header: "Дата создания",
    key: "createdAt",
    size: "80px",
    type: "local-date",
  },
  {
    hidden: true,
    header: "Дата обновления",
    key: "updatedAt",
    size: "80px",
    type: "local-date",
  },
];

export default { author, selection, entityDates };
