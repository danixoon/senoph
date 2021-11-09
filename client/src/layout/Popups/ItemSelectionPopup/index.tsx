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

export type ItemSelectionPopupProps = OverrideProps<
  PopupProps,
  {
    searchBind: InputBind<{ search: string }>;
    targetBind: InputBind;
    name: string;
    items: { id: any; name: string; href?: string }[];
    header: string;
  }
>;

const Item: React.FC<{
  id: any;
  name: string;
  href?: string;
  onSelect: (id: any) => void;
}> = (props) => {
  const { id, name, href, onSelect } = props;
  return (
    <Layout flow="row">
      <Link isMonospace href={href}>
        #{id}
      </Link>
      <Hr vertical />
      <Link
        isMonospace
        onClick={() => onSelect(id)}
        style={{ marginRight: "2rem" }}
      >
        {name}
      </Link>
      <Button
        style={{ marginLeft: "auto" }}
        color="primary"
        inverted
        onClick={() => onSelect(id)}
      >
        <Icon.Check />
      </Button>
    </Layout>
  );
};

const ItemSelectionPopup: React.FC<ItemSelectionPopupProps> = (props) => {
  // const [searchBind] = useInput<{ search: string }>({ search: null });
  const { items, searchBind, targetBind, name, header, ...rest } = props;

  return (
    <Popup {...rest} size="sm" closeable noPadding>
      <PopupTopBar>
        <Layout flex="1">
          <Header align="center" hr style={{ flex: 1 }}>
            {header}
          </Header>
          <Input
            name="search"
            {...searchBind}
            inputProps={{ placeholder: "Запрос.." }}
          />
        </Layout>
      </PopupTopBar>
      <Layout padding="md" flex="1" className="items-list">
        {items
          // .filter((item) => isIncludes(item.name))
          .map((item) => (
            <Item
              key={item.id}
              href={item.href }
              {...item}
              onSelect={(id) => {
                targetBind.onChange({ target: { name, value: id } });
                if (rest.onToggle) rest.onToggle(false);
              }}
            />
          ))}
      </Layout>
    </Popup>
  );
};

export default ItemSelectionPopup;
