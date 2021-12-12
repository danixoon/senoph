import Button from "components/Button";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import Popup, { PopupProps, PopupTopBar } from "components/Popup";
import { InputBind, useInput } from "hooks/useInput";
import * as React from "react";
import qs from "query-string";

import "./style.styl";
import Paginator from "components/Paginator";
import PhoneEditActions from "layout/PhoneEditActions";
import PopupLayer from "providers/PopupLayer";
import WithLoader from "components/WithLoader";
import { splitStatus } from "store/utils";
import { usePaginator } from "hooks/usePaginator";

export type Item = { id: any; content?: React.ReactChild; name: string };
export type ItemSelectionPopupProps = OverrideProps<
  PopupProps,
  {
    items: Item[];
    header: string;
    selectable?: boolean;
    status?: ApiStatus;
    zIndex?: number;
    onSelect: (item: Item) => void;
  }
>;

const Item: React.FC<{
  id: any;
  selectable?: boolean;
  onSelect: (id: any) => void;
}> = (props) => {
  const { id, children, selectable, onSelect } = props;
  return (
    <>
      <Hr />
      {selectable ? (
        <Button
          inverted
          onClick={() => onSelect(id)}
          className="items-list__item"
        >
          <Label className="items-list__item-label">{children}</Label>
          <Header className="items-list__item-id">#{id}</Header>
        </Button>
      ) : (
        <Layout flow="row" className="items-list__item">
          <Label className="items-list__item-label">{children}</Label>
          <Header className="items-list__item-id">#{id}</Header>
        </Layout>
      )}
    </>
  );
};

const ItemSelectionPopup: React.FC<ItemSelectionPopupProps> = (props) => {
  const {
    items,
    onSelect,
    zIndex,
    selectable,
    header,
    status,
    children,
    ...rest
  } = props;

  const pageItems = 12;
  const [offset, setOffset] = React.useState(0);
  const paginator = usePaginator(offset, items.length, pageItems);

  return (
    <Popup {...rest} size="md" closeable noPadding>
      <PopupTopBar>
        <Layout flex="1">
          <Header align="center" hr style={{ flex: 1 }}>
            {header}
          </Header>
        </Layout>
      </PopupTopBar>
      <WithLoader status={status ?? splitStatus("idle")}>
        <Layout padding="md" flex="1" className="items-list">
          <Paginator
            style={{ margin: "auto" }}
            onChange={(page) => setOffset((page - 1) * pageItems)}
            current={paginator.currentPage}
            size={5}
            max={paginator.maxPage}
            min={1}
          />
          {children}
          {/* <Hr /> */}

          {items.slice(offset, offset + pageItems).map((item) => {
            const content = item.content ?? item.name;
            return (
              <Item
                key={item.id}
                selectable={selectable}
                id={item.id}
                onSelect={() => {
                  onSelect(item);
                  if (rest.onToggle) rest.onToggle(false);
                }}
              >
                {content}
              </Item>
            );
          })}
        </Layout>
      </WithLoader>
    </Popup>
  );
};

export default ItemSelectionPopup;
