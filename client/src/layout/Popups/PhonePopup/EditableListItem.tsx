import Button from "components/Button";
import Icon, { LoaderIcon } from "components/Icon";
import Layout from "components/Layout";
import ListItem, { ListItemProps } from "components/ListItem";
import Span from "components/Span";
import { useChanges } from "hooks/api/useChanges";
import ChangesContext from "providers/ChangesContext";
import React from "react";
import { mergeClassNames } from "utils";

const EditableListItem: React.FC<
  OverrideProps<
    ListItemProps,
    {
      propertyKey: string;
      onOpen: (targetId: number, key: string) => void;
      editable?: boolean;
      mapper?: (v: any) => React.ReactNode;
    }
  >
> = (props) => {
  const {
    onOpen,
    mapper = (v) => v,
    propertyKey: key,
    editable,
    children,
    ...rest
  } = props;

  const changesContext = React.useContext(ChangesContext);
  if (!changesContext) return <> </>;

  const { targetId, changes, status } = changesContext;

  const targetChange = changes.find((c) => c.id === targetId);

  const isEdited = targetChange && targetChange[key] !== undefined;

  const Container: React.FC<{}> = ({ children }) =>
    editable ? <Button inverted>{children}</Button> : <> {children} </>;

  const isEmpty = isEdited
    ? targetChange[key].toString().trim() === ""
    : children == null ||
      (typeof children === "string" && children.trim() === "");

  const content = mapper(
    isEmpty ? "Отсутствует" : isEdited ? targetChange[key] : children
  );

  return (
    <ListItem {...rest}>
      <Layout
        flow="row"
        style={{ alignItems: "center" }}
        onClick={editable ? () => onOpen(targetId, key) : undefined}
      >
        <Container>
          {status.keys.includes(key) && status.status.isLoading ? (
            <LoaderIcon />
          ) : (
            <Span
              className={mergeClassNames(
                "edit-item",
                editable && "edit-item_editable"
              )}
            >
              {content}
            </Span>
          )}
        </Container>
        {isEdited && (
          <Icon.Edit2
            color="bgDark"
            size="xs"
            style={{ marginLeft: "0.5rem" }}
            altLabel={{
              text: `Изменено с '${
                children == null ? "Отсутствует" : mapper(children)
              }'`,
              position: "right",
              zIndex: "popup",
            }}
          />
        )}
      </Layout>
    </ListItem>
  );
};

export default EditableListItem;
