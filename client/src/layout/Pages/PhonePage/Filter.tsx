import React from "react";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Input from "components/Input";
import Layout from "components/Layout";
import { InputBind, InputHook } from "hooks/useInput";
import ClickInput from "components/ClickInput";
import { useTogglePopup } from "hooks/useTogglePopup";
import HolderSelectionPopupContainer from "containers/HolderSelectionPopup";
import PopupLayer from "providers/PopupLayer";
import Icon from "components/Icon";
import Button from "components/Button";

const Filter: React.FC<{
  hook: InputHook;
  config: {
    types: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    models: { id: number; name: string; phoneTypeId: number }[];
  };
}> = (props) => {
  const { config } = props;
  const [bind, setInput] = props.hook;

  const types = config.types.map((type) => ({
    id: type.id,
    label: type.name,
  }));

  const models = config.models
    .filter(
      (model) =>
        model.phoneTypeId.toString() === bind.input.phoneTypeId?.toString()
    )
    .map((model) => ({ id: model.id, label: model.name }));

  const departments = config.departments.map((dep) => ({
    id: dep.id,
    label: dep.name,
  }));

  const holderPopup = useTogglePopup();

  return (
    <>
      <Form className="filter-content__form" input={bind.input}>
        {/* <Button inverted color="primary" className="filter-content__spoiler-button">
          <Icon.ChevronLeft />
        </Button> */}
        <Layout>
          <Input {...bind} name="ids" label="Идентификаторы" />
          <Dropdown {...bind} name="phoneTypeId" label="Тип СС" items={types} />
          <Dropdown
            {...bind}
            name="phoneModelId"
            label="Модель СС"
            items={models}
          />
          <Dropdown
            {...bind}
            name="departmentId"
            label="Подразделение"
            items={[{ id: "null", label: "Без подразделения" }, ...departments]}
          />
          <ClickInput
            {...bind}
            placeholder="Иванов Иван Иванович"
            name="holderName"
            label="Материально-ответственное лицо"
            clearable
            onClear={() => setInput({ holderId: null, holderName: null })}
            onActive={() => holderPopup.onToggle()}
          />
          <Dropdown
            {...bind}
            name="category"
            label="Категория"
            items={[
              { id: "null", label: "Без категории" },
              { id: "1", label: "I (Прибыло, на гарантии)" },
              { id: "2", label: "II (Нет гарантии, исправно)" },
              { id: "3", label: "III (Неисправно)" },
              { id: "4", label: "IV (Подлежит списанию)" },
            ]}
          />
          <Input
            {...bind}
            name="inventoryKey"
            label="Инвентарный номер"
            placeholder="110xxxxxxxxx"
          />
          <Input
            {...bind}
            name="factoryKey"
            label="Заводской номер"
            placeholder="110xxxxxxxxx"
          />
          <Input
            style={{ flex: 1 }}
            {...bind}
            name="assemblyDate"
            label="Год сборки"
            placeholder="2008"
            type="number"
          />
          <Input
            style={{ flex: 1 }}
            {...bind}
            name="accountingDate"
            label="Дата принятия к учёту"
            type="date"
          />

          <Input
            style={{ flex: 1 }}
            {...bind}
            name="comissioningDate"
            label="Дата ввода в эксплуатацию"
            type="date"
          />
        </Layout>
      </Form>
      <PopupLayer>
        <HolderSelectionPopupContainer
          {...holderPopup}
          onSelect={(id, name) => setInput({ holderId: id, holderName: name })}
        />
      </PopupLayer>
    </>
  );
};

export default Filter;
