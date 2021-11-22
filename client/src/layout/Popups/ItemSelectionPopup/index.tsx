import Button from "components/Button";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon from "components/Icon";
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

export type Item = { id: any; name: string; href?: string };
export type ItemSelectionPopupProps = OverrideProps<
  PopupProps,
  {
    items: Item[];
    header: string;
    zIndex?: number;
    onSelect: (item: Item) => void;
  }
>;

const Item: React.FC<{
  id: any;
  name: string;
  onSelect: (id: any) => void;
}> = (props) => {
  const { id, name, onSelect } = props;
  return (
    <>
      <Hr />
      <Button
        inverted
        onClick={() => onSelect(id)}
        className="items-list__item"
      >
        <Label className="items-list__item-label">{name}</Label>
        <Header className="items-list__item-id">#{id}</Header>
      </Button>
    </>
  );
};

const ItemSelectionPopup: React.FC<ItemSelectionPopupProps> = (props) => {
  const { items, onSelect, zIndex, header, children, ...rest } = props;

  return (
    <Popup {...rest} size="md" closeable noPadding>
      <PopupTopBar>
        <Layout flex="1">
          <Header align="center" hr style={{ flex: 1 }}>
            {header}
          </Header>
        </Layout>
      </PopupTopBar>
      <Layout padding="md" flex="1" className="items-list">
        {children}
        {/* <Hr /> */}
        {items
          // .filter((item) => isIncludes(item.name))
          .map((item) => (
            <Item
              key={item.id}
              href={item.href}
              {...item}
              onSelect={() => {
                onSelect(item);
                if (rest.onToggle) rest.onToggle(false);
              }}
            />
          ))}
      </Layout>
    </Popup>
  );
};

export default ItemSelectionPopup;
