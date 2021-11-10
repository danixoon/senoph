import Button from "components/Button";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon from "components/Icon";
import Span from "components/Span";
import Input from "components/Input";
import ClickInput from "components/ClickInput";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import Popup, { PopupProps, PopupTopBar } from "components/Popup";
import { InputBind, useFileInput, useInput } from "hooks/useInput";
import * as React from "react";
import qs from "query-string";
import "./style.styl";
import Form, { FormError } from "components/Form";
import ModelSelectionPopupContainer from "containers/ModelSelectionPopup";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import DepartmentSelectionPopupContainer from "containers/HolderSelectionPopup";
import { useFetchHolder } from "hooks/api/useFetchHolder";
import ListItem from "components/ListItem";
import { v4 as uuid } from "uuid";
import { EmptyError, checkEmptiness, convertDate } from "store/utils";
import AltPopup from "components/AltPopup";
import { useTimeout } from "hooks/useTimeout";

export type PhoneCreatePopupProps = OverrideProps<
  PopupProps,
  {
    createPhones: (phones: Api.GetBody<"post", "/phone">["data"]) => any;
    error: string | null;
    status: ApiStatus;
  }
>;

// type P<T> = Pick<T, keyof T extends infer K ? K : never>

// type Pr = P<Api.Models.Phone>;

// type ExtractRequired<T, P = Omit<T, "id">> = P;

const AddedItem: React.FC<{
  holder: string;
  inventoryKey: string;
  model: string;
  onRemove: () => void;
}> = (props) => {
  const { model, inventoryKey, holder, onRemove } = props;
  return (
    <>
      <Layout className="added-item" flow="row">
        <Button inverted color="primary" onClick={onRemove}>
          <Icon.X />
        </Button>
        <Hr vertical />
        <Layout flex="1">
          <Layout flow="row">
            <Label>{model}</Label>
            <Hr vertical />
            <Span font="monospace">{inventoryKey}</Span>
          </Layout>
          <Hr />
          <Header className="added-item__holder">
            <Icon.User /> {holder}
          </Header>
        </Layout>
      </Layout>
      <Hr />
    </>
  );
};

type InputType = Omit<Api.Models.Phone, "id" | "commitId" | "authorId"> & {
  holderId: number;
};
const PhoneCreatePopup: React.FC<PhoneCreatePopupProps> = (props) => {
  const { createPhones, error, ...rest } = props;

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

  const [isHolderPopup, setHolderPopup] = React.useState(() => false);
  const handleHolderPopup = () => {
    setHolderPopup(!isHolderPopup);
  };

  const { models } = useFilterConfig();
  const { holders } = useFetchHolder(
    {
      id: bind.input.holderId ?? undefined,
    },
    bind.input.holderId === null
  );

  const getHolderName = (holder?: Api.Models.Holder) =>
    holder
      ? `${holder.lastName} ${holder.firstName} ${holder.middleName}`
      : undefined;

  const [addedPhones, setAddedPhones] = React.useState<
    WithId<
      Omit<Api.Models.Phone, "authorId"> & {
        payload: { holder: string; model: string };
      },
      string
    >[]
  >(() => []);

  const [formError, setFormError] = React.useState<FormError>(() => ({}));

  const handleSubmit = () => {
    const { ...rest } = bind.input;
    try {
      const attributes = checkEmptiness(rest);

      const phone = {
        id: Math.random().toString(),
        payload: {
          holder: mapHolderName(attributes.holderId),
          model: mapModelName(attributes.phoneModelId),
        },
        ...attributes,
      };
      setAddedPhones([...addedPhones, phone]);
    } catch (err) {
      if (err instanceof EmptyError) {
        const e = err as EmptyError;
        setFormError({ [e.key]: { message: "Поле не может быть пустым" } });
      } else throw err;
    }
  };

  const handlePhonesSubmit = () => {
    createPhones(
      addedPhones.map(({ payload, id, ...rest }) => ({
        ...rest,
        accountingDate: convertDate(rest.accountingDate).toISOString(),
        assemblyDate: convertDate(rest.assemblyDate).toISOString(),
        commissioningDate: convertDate(rest.commissioningDate).toISOString(),
      }))
    );
  };

  const mapModelName = (value: any) =>
    value === ""
      ? "Не выбрано"
      : models.find((m) => m.id === value)?.name ?? `Без имени (#${value})`;

  const mapHolderName = (value: any) =>
    value === ""
      ? "Не выбрано"
      : getHolderName(holders.items.find((h) => h.id === value)) ??
        `Без имени (#${value})`;

  const [isShowError, errorMessage, setErrorMessage] = useTimeout<
    string | null
  >(null, 2000);

  React.useEffect(() => {
    if (!error) return;
    setErrorMessage(error);
  }, [error]);

  React.useEffect(() => {
    if (rest.status.isSuccess) if (rest.onToggle) rest.onToggle(false);
  }, [rest.status.isSuccess]);

  const submitRef = React.useRef<HTMLButtonElement | null>(null);

  const [bindImport, _, ref] = useFileInput();

  console.log(bindImport);

  return (
    <>
      <Popup {...rest} size="lg" closeable noPadding>
        <PopupTopBar>
          <Header
            align="center"
            hr
            style={{ flex: 1, display: "flex", alignItems: "center" }}
          >
            <Span style={{ margin: "auto" }}>
              Добавление нового средства связи
            </Span>
            <Button
              style={{ marginLeft: "auto" }}
              size="sm"
              color="primary"
              inverted
              onClick={() => ref.current?.click()}
            >
              Импорт <Icon.Database />
            </Button>
            <Button size="sm" color="primary" inverted>
              Шаблон <Icon.Download />
            </Button>
            <Input hidden name="import" type="file" {...bindImport} />
          </Header>
        </PopupTopBar>
        <Layout padding="md" flow="row" flex="1">
          <Form
            onSubmit={() => handleSubmit()}
            inputError={formError}
            input={bind.input}
          >
            <Layout flow="row">
              <Layout>
                <Input
                  {...bind}
                  name="inventoryKey"
                  label="Инвентарный номер"
                />
                <Input {...bind} name="factoryKey" label="Заводской номер" />
                <ClickInput
                  {...bind}
                  name="phoneModelId"
                  label="Модель"
                  mapper={mapModelName}
                  onClick={handleModelPopup}
                />
              </Layout>
              <Layout>
                <Input
                  {...bind}
                  type="date"
                  name="assemblyDate"
                  label="Дата сборки"
                />
                <Input
                  {...bind}
                  type="date"
                  name="commissioningDate"
                  label="Дата ввода в эксплуатацию"
                />
                <Input
                  {...bind}
                  type="date"
                  name="accountingDate"
                  label="Дата учёта"
                />
              </Layout>
            </Layout>
            <ClickInput
              {...bind}
              name="holderId"
              label="Владелец"
              mapper={mapHolderName}
              onClick={handleHolderPopup}
            />
            <Hr style={{ marginTop: "auto" }} />
            <Layout>
              <Button type="submit">Добавить</Button>
            </Layout>
          </Form>
          <Hr vertical />
          <Layout flex="1">
            <Layout className="added-list">
              <Header align="right">
                {addedPhones.length === 0
                  ? "Добавленые СС отсутствуют"
                  : "Добавленные СС"}
              </Header>
              <Hr />
              {addedPhones.map((phone) => (
                <AddedItem
                  key={phone.id}
                  inventoryKey={phone.inventoryKey}
                  onRemove={() =>
                    setAddedPhones(addedPhones.filter((p) => p.id !== phone.id))
                  }
                  {...phone.payload}
                />
              ))}
            </Layout>
            <Hr style={{ marginTop: "auto" }} />
            <Layout>
              <Button
                color="primary"
                onClick={handlePhonesSubmit}
                ref={submitRef}
              >
                Применить
              </Button>
              <AltPopup
                zIndex="popup"
                position="bottom"
                target={isShowError ? submitRef.current : null}
              >
                {errorMessage}
              </AltPopup>
            </Layout>
          </Layout>
        </Layout>
      </Popup>
      <ModelSelectionPopupContainer
        isOpen={isModelPopup}
        onToggle={handleModelPopup}
        targetBind={bind}
        name="phoneModelId"
      />
      <DepartmentSelectionPopupContainer
        isOpen={isHolderPopup}
        onToggle={handleHolderPopup}
        targetBind={bind}
        name="holderId"
      />
    </>
  );
};

export default PhoneCreatePopup;
