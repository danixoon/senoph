import AltPopup from "components/AltPopup";
import Badge from "components/Badge";
import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form, { FormContext } from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { usePhoneType, usePhoneTypeByModel } from "hooks/misc/phoneType";
import { useInput } from "hooks/useInput";
import { useTimeout } from "hooks/useTimeout";
import { NoticeContext } from "providers/NoticeProvider";
import React from "react";
import { api } from "store/slices/api";
import { extractStatus } from "store/utils";

export type PhoneModelsProps = {};

const useContainer = () => {
  const models = api.useFetchPhoneModelQuery({});
  const [deletePhoneModel, deleteStatus] = api.useDeletePhoneModelMutation();
  const [createPhoneModel, createStatus] = api.useCreatePhoneModelMutation();
  const getPhoneType = usePhoneType();
  const types = api.useFetchPhoneTypesQuery({});

  return {
    models: { ...models, items: models.data?.items ?? [] },
    types: { ...types, items: types.data?.items ?? [] },
    deletePhoneModel,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    createPhoneModel,
    getPhoneType,
  };
};

const detailsMap: Record<string, string> = {
  gold: "Золото",
  silver: "Серебро",
  platinum: "Платина",
  mpg: "МПГ",
};

const PhoneModels: React.FC<PhoneModelsProps> = (props) => {
  const {
    models,
    types,
    deletePhoneModel,
    createPhoneModel,
    getPhoneType,
    createStatus,
    deleteStatus,
  } = useContainer();

  const noticeContext = React.useContext(NoticeContext);

  React.useEffect(() => {
    if (createStatus.isLoading)
      noticeContext.createNotice("Создание модели...");
    if (createStatus.isSuccess)
      noticeContext.createNotice("Модель успешно создана.");
    if (createStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при создании модели: (${createStatus.error?.name}) ${createStatus.error?.description}`
      );
  }, [createStatus.status]);

  React.useEffect(() => {
    if (deleteStatus.isLoading)
      noticeContext.createNotice("Удаление модели...");
    if (deleteStatus.isSuccess)
      noticeContext.createNotice("Модель успешно удалена.");
    if (deleteStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при удалении модели: (${deleteStatus.error?.name}) ${deleteStatus.error?.description}`
      );
  }, [deleteStatus.status]);

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      mapper: (v, item) => (
        <ActionBox
          status={deleteStatus}
          onDelete={() => deletePhoneModel({ id: item.id })}
        />
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
      mapper: (v, item: DB.PhoneModelAttributes) =>
        getPhoneType(item.phoneTypeId),
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
              placeholder="DA 310"
              label="Наименование"
              {...bind}
              name="name"
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
              placeholder="Информация по модели"
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
              disabled={createStatus.isLoading}
              style={{
                marginTop: "auto",
                marginLeft: "auto",
                padding: "0 4rem",
              }}
              margin="md"
              type="submit"
              color="primary"
            >
              {createStatus.isLoading ? <LoaderIcon /> : "Создать"}
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

  const amount = Number(bind.input.amount);
  const [show, message, toggleMessage] = useTimeout<string | null>(null, 2000);
  const inputRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (show) setTimeout(() => inputRef.current?.focus());
  }, [show]);

  // const formContext = React.useContext(FormContext);
  // formContext.addCheck(bind.input, "amount", (v) => Number.isNaN("amount"))

  return (
    <Button
      ref={(r) => {
        setTarget(r);
      }}
      color="primary"
      inverted
      onClick={() => {
        setIsOpen(true);
        // setTimeout(() => {

        // });
      }}
    >
      <Icon.PlusCircle />
      <SpoilerPopup
        target={isOpen ? target : null}
        position="bottom"
        onBlur={(e) => {
          const currentTarget = e.currentTarget;
          setTimeout(() => {
            if (!currentTarget.contains(document.activeElement))
              // e.preventDefault();
              setIsOpen(false);
          });
        }}
      >
        <Dropdown label="Металл" items={dropdownItems} name="name" {...bind} />
        <Input
          label="Количество (гр.)"
          name="amount"
          {...bind}
          type="number"
          placeholder="0.001"
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
            else {
              props.onCreate(bind.input.name ?? "", amount);
              inputRef.current?.focus();
            }
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

const ActionBox = (props: { status: ApiStatus; onDelete: () => void }) => {
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
        <SpoilerPopupButton
          // disabled={props.status.isLoading}
          onClick={() => !props.status.isLoading && props.onDelete()}
        >
          {props.status.isLoading ? <LoaderIcon /> : "Удалить"}
        </SpoilerPopupButton>
      </SpoilerPopup>
    </Button>
  );
};

export default PhoneModels;
