import Button from "components/Button";
import Icon from "components/Icon";
import Layout from "components/Layout";
import ListItem, { ListItemProps } from "components/ListItem";
import Span from "components/Span";
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
    }
  >
> = (props) => {
  const { onOpen, propertyKey: key, editable, children, ...rest } = props;

  const changesContext = React.useContext(ChangesContext);
  if (!changesContext) return <> </>;

  const { targetId, changes } = changesContext;

  const targetChange = changes.find((c) => c.id === targetId);

  const isEdited = targetChange && targetChange[key] !== undefined;

  const Container: React.FC<{}> = ({ children }) =>
    editable ? <Button inverted>{children}</Button> : <> {children} </>;

  const content = isEdited ? targetChange[key] : children;

  return (
    <ListItem {...rest}>
      <Layout
        flow="row"
        style={{ alignItems: "center" }}
        onClick={editable ? () => onOpen(targetId, key) : undefined}
      >
        <Container>
          <Span
            className={mergeClassNames(
              "edit-item",
              editable && "edit-item_editable"
            )}
          >
            {content}
          </Span>
        </Container>
        {isEdited && (
          <Icon.Edit2
            color="bgDark"
            size="xs"
            style={{ marginLeft: "0.5rem" }}
            altLabel={{ text: "Изменён", position: "right", zIndex: "popup" }}
          />
        )}
      </Layout>
    </ListItem>
  );
};

export default EditableListItem;
