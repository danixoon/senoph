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
    mapper: (v, item) => {
      return getAuthorName(props.getUser(item.authorId));
    },
  } as TableColumn);

export default { author };
