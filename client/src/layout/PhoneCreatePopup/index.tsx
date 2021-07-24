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
import Form from "components/Form";
import ModelSelectionPopupContainer from "containers/ModelSelectionPopup";
import { useFilterConfig } from "hooks/api/useFetchConfig";

export type PhoneCreatePopupProps = OverrideProps<PopupProps, {}>;

// type P<T> = Pick<T, keyof T extends infer K ? K : never>

// type Pr = P<Api.Models.Phone>;

// type ExtractRequired<T, P = Omit<T, "id">> = P;

type InputType = WithoutId<Api.Models.Phone>;
const PhoneCreatePopup: React.FC<PhoneCreatePopupProps> = (props) => {
  const { ...rest } = props;

  const [bind] = useInput<InputType>({
    accountingDate: null,
    inventoryKey: null,
    factoryKey: null,
    holderId: null,
    assemblyDate: null,
    commissioningDate: null,
    phoneModelId: null,
  });

  const [isModelPopup, setModelPopup] = React.useState(() => false);
  const handleModelPopup = () => {
    setModelPopup(!isModelPopup);
  };

  const { models } = useFilterConfig();

  return (
    <>
      <Popup {...rest} size="md" closeable noPadding>
        <PopupTopBar>
          <Header align="center" hr style={{ flex: 1 }}>
            Добавление нового средства связи
          </Header>
        </PopupTopBar>
        <Layout padding="md" flow="row" flex="1">
          <Form>
            <Input {...bind} name="inventoryKey" label="Инвентарный номер" />
            <Input {...bind} name="factoryKey" label="Заводской номер" />
            <Input {...bind} name="assemblyDate" label="Дата сборки" />
            <Input
              {...bind}
              name="commissioningDate"
              label="Дата ввода в эксплуатацию"
            />
            <Input {...bind} name="accountingDate" label="Дата учёта" />
            <Input
              {...bind}
              name="phoneModelId"
              label="Модель"
              mapper={(v) =>
                v === ""
                  ? "Не выбрано"
                  : models.find((m) => m.id === v)?.name ?? `Без имени (#${v})`
              }
              inputProps={{ onClick: handleModelPopup }}
              onChange={void 0}
            />
            <Input {...bind} name="holderId" label="Владелец" />
          </Form>
        </Layout>
      </Popup>
      <ModelSelectionPopupContainer
        isOpen={isModelPopup}
        onToggle={handleModelPopup}
        bind={bind}
        name="phoneModelId"
      />
    </>
  );
};

export default PhoneCreatePopup;
