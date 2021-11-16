import AltPopup from "components/AltPopup";
import Badge from "components/Badge";
import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form, { FormContext } from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { usePhoneTypeName } from "hooks/misc/usePhoneTypeName";
import { useInput } from "hooks/useInput";
import { useTimeout } from "hooks/useTimeout";
import React from "react";
import { api } from "store/slices/api";

export type PhoneModelsProps = {};

const useContainer = () => {
  const models = api.useFetchPhoneModelQuery({});
  const [deletePhoneModel] = api.useDeletePhoneModelMutation();
  const [createPhoneModel] = api.useCreatePhoneModelMutation();
  const getPhoneType = usePhoneTypeName();
  const types = api.useFetchPhoneTypesQuery({});

  return {
    models: { ...models, items: models.data?.items ?? [] },
    types: { ...types, items: types.data?.items ?? [] },
    deletePhoneModel,
    createPhoneModel,
    getPhoneType,
  };
};

const detailsMap: Record<string, string> = {
  gold: "Золото",
  silver: "Серебро",
  platinum: "Платина",
  mbg: "МБГ",
};

const PhoneModels: React.FC<PhoneModelsProps> = (props) => {
  const { models, types, deletePhoneModel, createPhoneModel, getPhoneType } =
    useContainer();

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      mapper: (v, item) => (
        <ActionBox onDelete={() => deletePhoneModel({ id: item.id })} />
      ),
    },
    {
      key: "id",
      header: "ID",
      size: "30px",
    },
    {
      key: "name",
      header: "Наименование",
      // size: "150px",
    },
    {
      key: "phoneTypeId",
      header: "Тип СС",
      mapper: (v) => getPhoneType(v),
      // size: "150px",
    },
    {
      key: "description",
      header: "Описание",
      // size: "150px",
    },
    {
      key: "details",
      header: "Драг. металлы",
      mapper: (details: DB.PhoneModelDetailAttributes[]) =>
        details.map((detail) => (
          <>
            {detailsMap[detail.name]}: <b>{detail.amount}</b> {detail.units}.
            <br />
          </>
        )),
    },
  ];

  const [bind] = useInput({});

  const tableItems = models.items.map((type) => type);

  // const noticeContext = React.useContext(NoticeContext);
  // const [isDetailPopup, setDetailPopup] = React.useState(() => false);
  // const handleDetailPopup = () => {
  //   setDetailPopup(!isDetailPopup);
  // };
  // TODO: Make proper typing for POST request params & form inputs

  const [details, setDetails] = React.useState<
    Omit<DB.PhoneModelDetailAttributes, "modelId">[]
  >(() => [] as any);

  // const mapDetailName = (name: string) =>
  //   detailsMap[name]);

  return (
    <>
      <Layout>
        <Form
          input={bind.input}
          onSubmit={(data) => {
            // onSubmit(data);
            createPhoneModel({ ...data, details });
            // noticeContext.createNotice("Пользователь создан");
          }}
        >
          <Layout flow="row">
            <Input
              required
              label="Наименование"
              {...bind}
              name="name"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="Дата учёта"
              {...bind}
              type="date"
              name="accountingDate"
              style={{ flex: "1" }}
            />
            <Dropdown
              required
              style={{ flex: "1" }}
              label="Тип СС"
              name="phoneTypeId"
              items={types.items.map((type) => ({
                id: type.id,
                label: type.name,
              }))}
              {...bind}
            />
            <Input
              label="Описание"
              {...bind}
              name="description"
              style={{ flex: "1" }}
            />
          </Layout>
          <Layout flow="row" padding="md">
            <CreateDetailButton
              details={Object.fromEntries(
                Object.entries(detailsMap).filter(
                  ([name]) => !details.find((det) => det.name === name)
                )
              )}
              onCreate={(type, amount) =>
                setDetails([
                  ...details,
                  { name: type, amount, units: "гр", type: "preciousMetal" },
                ])
              }
            />
            {details.length === 0 ? (
              <Badge>Нет драг. металлов</Badge>
            ) : (
              details.map((detail) => (
                <Badge key={detail.name}>
                  <Button
                    inverted
                    color="primary"
                    onClick={() =>
                      setDetails(
                        details.filter((det) => det.name !== detail.name)
                      )
                    }
                  >
                    <Icon.X />
                  </Button>
                  {detailsMap[detail.name]}: {detail.amount} {detail.units}.
                </Badge>
              ))
            )}
            <Button
              style={{
                marginTop: "auto",
                marginLeft: "auto",
                padding: "0 4rem",
              }}
              margin="md"
              type="submit"
              color="primary"
            >
              Создать
            </Button>
          </Layout>
        </Form>
        <Hr />
        <Header align="right">
          Список моделей средств связи ({models.items.length})
        </Header>
        <Table items={tableItems} columns={columns} />
      </Layout>
    </>
  );
};

const CreateDetailButton = (props: {
  onCreate: (name: string, amount: number) => void;
  details: Record<string, string>;
}) => {
  // const { commit } = props;
  const [target, setTarget] = React.useState<HTMLElement | null>(() => null);

  const [isOpen, setIsOpen] = React.useState(() => false);
  const [bind] = useInput({ name: null, amount: "" });
  const dropdownItems = Object.entries(props.details).map(([id, label]) => ({
    id,
    label,
  }));

  const amount = Number(bind.input.amount?.replaceAll(",", ".").trim());
  const [show, message, toggleMessage] = useTimeout<string | null>(null, 2000);
  const inputRef = React.useRef<HTMLElement | null>(null);

  // const formContext = React.useContext(FormContext);
  // formContext.addCheck(bind.input, "amount", (v) => Number.isNaN("amount"))

  return (
    <Button
      ref={(r) => {
        setTarget(r);
      }}
      color="primary"
      inverted
      onClick={() => setIsOpen(true)}
    >
      <Icon.PlusCircle />
      <SpoilerPopup
        target={isOpen ? target : null}
        position="right"
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as any))
            e.preventDefault();
          else setIsOpen(false);
        }}
      >
        <Dropdown label="Металл" items={dropdownItems} name="name" {...bind} />
        <Input
          label="Количество"
          name="amount"
          {...bind}
          type="number"
          placeholder="50 гр."
          ref={(r) => (inputRef.current = r)}
        />
        <Button
          disabled={
            dropdownItems.length === 0 || bind.input.name === null
            // Number.isNaN(amount)
          }
          color="primary"
          size="sm"
          onClick={() => {
            if (Number.isNaN(amount))
              toggleMessage("Неверно указано количество");
            else props.onCreate(bind.input.name ?? "", amount);
          }}
        >
          Добавить
        </Button>
        <AltPopup
          target={show && message ? inputRef.current : null}
          position="bottom"
        >
          {message}
        </AltPopup>
      </SpoilerPopup>
    </Button>
  );
};

const ActionBox = (props: { onDelete: () => void }) => {
  // const { commit } = props;
  const [target, setTarget] = React.useState<HTMLElement | null>(() => null);

  const [isOpen, setIsOpen] = React.useState(() => false);

  return (
    <Button
      ref={(r) => setTarget(r)}
      color="primary"
      inverted
      onClick={() => setIsOpen(true)}
    >
      <Icon.Box />
      <SpoilerPopup
        target={isOpen ? target : null}
        position="right"
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as any))
            e.preventDefault();
          else setIsOpen(false);
        }}
      >
        <SpoilerPopupButton onClick={() => props.onDelete()}>
          Удалить
        </SpoilerPopupButton>
      </SpoilerPopup>
    </Button>
  );
};

export default PhoneModels;
