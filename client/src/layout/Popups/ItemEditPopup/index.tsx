import Button from "components/Button";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Label from "components/Label";
import Layout, { LayoutProps } from "components/Layout";
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
import Form from "components/Form";
import { clearObject, denullObject } from "utils";
import { useNotice } from "hooks/useNotice";
import Checkbox from "components/Checkbox";

export type Item = {
  name: string;
  content: React.FC<{ bind: InputBind; name: string; disabled: boolean }>;
  nullable?: boolean;
};
export type ItemEditPopupProps = OverrideProps<
  PopupProps,
  {
    onReset?: () => void;
    onSubmit: (input: any) => void;
    status: ApiStatus;
    defaults?: any;
    layoutProps?: LayoutProps;
    items: Item[];
  }
>;

const ItemEditPopup: React.FC<ItemEditPopupProps> = (props) => {
  const {
    items,
    status,
    defaults = {},
    layoutProps = {},
    onSubmit,
    onReset,
    ...rest
  } = props;

  const [bind, setInput] = useInput<any>(defaults);

  React.useEffect(() => {
    if (rest.isOpen) setInput(defaults);
  }, [rest.isOpen]);

  useNotice(status, { onSuccess: () => rest.onToggle && rest.onToggle(false) });

  const [metaBind, setMeta] = useInput<any>();

  return (
    <Popup {...rest} size="md" closeable noPadding>
      <WithLoader status={status}>
        <Form
          style={{ flex: "1" }}
          input={bind.input}
          onReset={(e) => {
            if (onReset) onReset();
            setInput(defaults);
          }}
          onSubmit={(e) => {
            const input = e;
            onSubmit(input);
          }}
        >
          <Layout {...layoutProps} padding="md">
            {items.map((item, i) => {
              const { content: Component, name } = item;
              return (
                <Layout
                  flex="1"
                  flow="row"
                  className="item-edit__component"
                  key={i}
                >
                  {/* <Checkbox name={name} {...metaBind} /> */}
                  <Component
                    bind={bind}
                    name={name}
                    disabled={metaBind.input[name]}
                  />
                </Layout>
              );
            })}
          </Layout>
          <Layout flow="row" style={{ marginTop: "auto" }}>
            <Button
              style={{ flex: "1" }}
              margin="lg"
              type="reset"
              disabled={status.isLoading}
            >
              Отменить изменения
            </Button>
            <Button
              margin="lg"
              type="submit"
              color="primary"
              disabled={status.isLoading}
            >
              Применить
            </Button>
          </Layout>
        </Form>
      </WithLoader>
    </Popup>
  );
};

export default ItemEditPopup;
