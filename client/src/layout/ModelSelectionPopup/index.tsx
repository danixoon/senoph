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

export type ModelSelectionPopupProps = OverrideProps<
  PopupProps,
  {
    bind: InputBind;
    name: string;
    items: { id: any; name: string }[];
  }
>;

// const Content: React.FC<{}> = (props) => {

// };

const ModelItem: React.FC<{
  id: any;
  name: string;
  href: string;
  onSelect: (id: any) => void;
}> = (props) => {
  const { id, name, href, onSelect } = props;
  return (
    <Layout flow="row">
      <Label> #{id}</Label>
      <Hr vertical />
      <Link isMonospace href={href} style={{ marginRight: "2rem" }}>
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

const ModelSelectionPopup: React.FC<ModelSelectionPopupProps> = (props) => {
  const { items, bind, name, ...rest } = props;
  const [searchBind] = useInput({ search: null });

  // TODO: Регистронезависимая регулярка через флаги
  const tester = new RegExp(
    (searchBind.input.search ?? "").toLowerCase().replaceAll("\\", "\\\\"),
    "gm"
  );

  return (
    <Popup {...rest} size="sm" closeable noPadding>
      <PopupTopBar>
        <Layout flex="1">
          <Header align="center" hr style={{ flex: 1 }}>
            Выборка модели
          </Header>
          <Input
            name="search"
            {...searchBind}
            inputProps={{ placeholder: "Запрос.." }}
          />
        </Layout>
      </PopupTopBar>
      <Layout padding="md" flex="1" className="model-list">
        {items
          .filter((item) =>
            searchBind.input.search
              ? tester.test(item.name.toLowerCase())
              : true
          )
          .map((item) => (
            <ModelItem
              href={`/model?selectedId=${item.id}`}
              {...item}
              onSelect={(id) => {
                bind.onChange({ target: { name, value: id } });
                if(rest.onToggle) rest.onToggle(false);
              }}
            />
          ))}
      </Layout>
    </Popup>
  );
};

export default ModelSelectionPopup;
